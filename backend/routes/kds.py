from fastapi import APIRouter, HTTPException, Query, Depends
from tortoise_models.order import Order, OrderItem
from tortoise_models.product import Product
from tortoise_models.table import Table
from tortoise_models.signup import User
from dependencies import require_role
from schemas.order import OrderResponse
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# Define the dependency specifically for KDS access
# Only 'kitchen' staff and 'admin' can access these routes
kds_access = require_role(["kitchen", "cashier", "admin"])

@router.get("/orders")
async def get_kds_orders(
    status: str = Query(default="all", description="Filter by kds_status: all, to_cook, preparing, completed"),
    product_filter: Optional[str] = Query(default=None, description="Filter by product name"),
    category_filter: Optional[str] = Query(default=None, description="Filter by category name"),
    current_user: User = Depends(kds_access) # Protected
):
    query = Order.all().prefetch_related(
        'table', 
        'items__product__category'
    )
    
    # Filter by KDS status
    if status != "all":
        query = query.filter(kds_status=status)
    
    # Filter by product name (only show_on_kds products)
    if product_filter:
        query = query.filter(
            items__product__name__icontains=product_filter,
            items__product__show_on_kds=True
        )
    
    # Filter by category name
    if category_filter:
        query = query.filter(
            items__product__category__name__icontains=category_filter,
            items__product__show_on_kds=True
        )
    
    # Order by created_at descending (newest first)
    query = query.order_by('-created_at')
    
    orders = await query
    
    # Format the response - only include show_on_kds items
    result = []
    for order in orders:
        # Filter items to only show products assigned to KDS
        kds_items = [item for item in order.items if item.product.show_on_kds]
        
        # Skip order if it has no KDS items
        if not kds_items:
            continue
            
        order_data = {
            "id": order.id,
            "order_number": order.order_number,
            "table_number": order.table.table_number if order.table else "Takeaway",
            "kds_status": order.kds_status,
            "created_at": order.created_at,
            "items": []
        }
        
        for item in kds_items:
            order_data["items"].append({
                "id": item.id,
                "product_name": item.product.name,
                "category_name": item.product.category.name if item.product.category else "Uncategorized",
                "quantity": item.quantity,
                "item_status": item.item_status,
                "notes": item.notes
            })
        
        result.append(order_data)
    
    return result

@router.patch("/orders/{order_id}/status")
async def update_order_kds_status(
    order_id: int, 
    kds_status: str,
    current_user: User = Depends(kds_access) # Protected
):
    """Update the overall order KDS status"""
    order = await Order.get_or_none(id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if kds_status not in ['to_cook', 'preparing', 'completed']:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    order.kds_status = kds_status
    await order.save()
    
    return {"message": f"Order {order.order_number} moved to {kds_status}"}

@router.patch("/items/{item_id}/status")
async def update_item_status(
    item_id: int, 
    item_status: str,
    current_user: User = Depends(kds_access) # Protected
):
    """Update individual item status (toggle between pending/prepared)"""
    item = await OrderItem.get_or_none(id=item_id).prefetch_related('order')
    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")
    
    if item_status not in ['pending', 'prepared']:
        raise HTTPException(status_code=400, detail="Invalid item status")
    
    item.item_status = item_status
    await item.save()
    
    return {
        "message": f"Item marked as {item_status}",
        "item_id": item.id,
        "item_status": item_status
    }

@router.get("/products")
async def get_kds_products(
    current_user: User = Depends(kds_access) # Protected
):
    """Get only products that should appear on KDS"""
    products = await Product.filter(show_on_kds=True).prefetch_related('category')
    return [
        {
            "id": p.id,
            "name": p.name,
            "category_name": p.category.name if p.category else "Uncategorized"
        }
        for p in products
    ]

@router.get("/stats")
async def get_kds_stats(
    current_user: User = Depends(kds_access) # Protected
):
    """Get counts for each status tab"""
    all_count = await Order.all().count()
    to_cook_count = await Order.filter(kds_status='to_cook').count()
    preparing_count = await Order.filter(kds_status='preparing').count()
    completed_count = await Order.filter(kds_status='completed').count()
    
    return {
        "all": all_count,
        "to_cook": to_cook_count,
        "preparing": preparing_count,
        "completed": completed_count
    }