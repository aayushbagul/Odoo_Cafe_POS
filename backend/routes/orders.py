from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from tortoise.expressions import Q
from tortoise_models.order import Order, OrderItem
from tortoise_models.product import Product
from tortoise_models.table import Table
from tortoise_models.session import POSSession
from tortoise_models.signup import User
from dependencies import get_current_user
from schemas.order import OrderCreate, OrderUpdate, OrderResponse
from reportlab.lib.pagesizes import A6
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from typing import List
from datetime import datetime
import random
from decimal import Decimal
import os

router = APIRouter()

def generate_order_number():
    """Generate unique order number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = random.randint(1000, 9999)
    return f"ORD-{timestamp}-{random_suffix}"

def generate_receipt_pdf(order, filepath):
    # A6 is a standard size for thermal receipt printers
    c = canvas.Canvas(filepath, pagesize=A6)
    width, height = A6
    
    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, height - 2*cm, "Odoo Cafe")
    c.setFont("Helvetica", 10)
    c.drawCentredString(width / 2, height - 2.5*cm, "123 Cafe Street, City")
    c.drawCentredString(width / 2, height - 3*cm, "Phone: +91 9876543210")
    
    c.line(1*cm, height - 3.5*cm, width - 1*cm, height - 3.5*cm)
    
    # Order Info
    c.setFont("Helvetica-Bold", 10)
    c.drawString(1*cm, height - 4.5*cm, f"Order: {order.order_number}")
    c.setFont("Helvetica", 9)
    
    # Safely format date
    date_str = order.created_at.strftime('%Y-%m-%d %H:%M') if hasattr(order.created_at, 'strftime') else str(order.created_at)
    c.drawString(1*cm, height - 5.2*cm, f"Date: {date_str}")
    
    table_name = f"Table {order.table.table_number}" if order.table else "Takeaway"
    c.drawString(1*cm, height - 5.9*cm, f"Table: {table_name}")
    
    c.line(1*cm, height - 6.5*cm, width - 1*cm, height - 6.5*cm)
    
    # Items List
    y = height - 7.5*cm
    c.setFont("Helvetica-Bold", 9)
    c.drawString(1*cm, y, "Item")
    c.drawRightString(width - 3*cm, y, "Qty")
    c.drawRightString(width - 1*cm, y, "Price")
    
    y -= 0.8*cm
    c.setFont("Helvetica", 9)
    
    for item in order.items:
        prod_name = item.product.name if item.product else "Unknown Item"
        c.drawString(1*cm, y, prod_name[:40]) # Truncate long names
        c.drawRightString(width - 3*cm, y, str(item.quantity))
        c.drawRightString(width - 1*cm, y, f"Rs.{float(item.subtotal):.2f}")
        y -= 0.6*cm
        
    c.line(1*cm, y, width - 1*cm, y)
    y -= 0.8*cm
    
    # Totals
    c.setFont("Helvetica", 9)
    c.drawString(1*cm, y, "Subtotal:")
    c.drawRightString(width - 1*cm, y, f"Rs.{float(order.subtotal):.2f}")
    y -= 0.6*cm
    c.drawString(1*cm, y, "Tax (18%):")
    c.drawRightString(width - 1*cm, y, f"Rs.{float(order.tax):.2f}")
    y -= 0.8*cm
    
    c.setFont("Helvetica-Bold", 11)
    c.drawString(1*cm, y, "TOTAL:")
    c.drawRightString(width - 1*cm, y, f"Rs.{float(order.total):.2f}")
    y -= 1*cm
    
    c.setFont("Helvetica", 9)
    c.drawCentredString(width / 2, y - 1*cm, "Thank you for visiting!")
    c.drawCentredString(width / 2, y - 1.6*cm, "Please come again")
    
    c.save()

@router.get("", response_model=List[OrderResponse])
async def get_orders(session_id: int = None, table_id: int = None, status: str = None, search: str = None):
    query = Order.all().prefetch_related('table', 'customer', 'items__product')

    if session_id:
        query = query.filter(session_id=session_id)
    if table_id:
        query = query.filter(table_id=table_id)
    if status:
        query = query.filter(status=status)
    if search:
        query = query.filter(
            Q(order_number__icontains=search) | 
            Q(customer__name__icontains=search)
        )
    return await query.order_by("-created_at")

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int):
    order = await Order.get_or_none(id=order_id).prefetch_related(
        'table', 'customer', 'items__product'
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("", response_model=OrderResponse)
async def create_order(order: OrderCreate, current_user: User = Depends(get_current_user)):
    session = await POSSession.filter(user=current_user, status="open").first()

    # Generate order number
    order_number = generate_order_number()
    
    # Calculate totals
    subtotal = sum(item.unit_price * item.quantity for item in order.items)
    tax = subtotal * Decimal("0.18")  # 18% tax
    total = subtotal + tax
    
    # Create order
    new_order = await Order.create(
        order_number=order_number,
        table_id=order.table_id,
        customer_id=order.customer_id,
        status=order.status,
        payment_method=order.payment_method,
        notes=order.notes,
        subtotal=subtotal,
        tax=tax,
        total=total,
        session=session,
	    kds_status='to_cook'
    )
    
    # Create order items
    for item in order.items:
        await OrderItem.create(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=item.unit_price * item.quantity
        )
    
    # Update table status if table is assigned
    if order.table_id:
        await Table.filter(id=order.table_id).update(status='occupied')
    
    # Fetch complete order with relations
    complete_order = await Order.get(id=new_order.id).prefetch_related(
        'table', 'customer', 'items__product'
    )
    
    return complete_order

@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(order_id: int, order: OrderUpdate):
    db_order = await Order.get_or_none(id=order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    update_data = order.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_order, key, value)
    
    await db_order.save()
    
    # Update table status if order is paid or cancelled
    if order.status in ['paid', 'cancelled'] and db_order.table_id:
        await Table.filter(id=db_order.table_id).update(status='available')
    
    complete_order = await Order.get(id=db_order.id).prefetch_related(
        'table', 'customer', 'items__product'
    )
    
    return complete_order

@router.delete("/{order_id}")
async def delete_order(order_id: int):
    order = await Order.get_or_none(id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Free up table if exists
    if order.table_id:
        await Table.filter(id=order.table_id).update(status='available')
    
    await order.delete()
    return {"message": "Order deleted successfully"}

@router.post("/{order_id}/payment")
async def process_payment(order_id: int, payment_method: str):
    order = await Order.get_or_none(id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = 'paid'
    order.payment_method = payment_method
    await order.save()
    
    # Free up table
    if order.table_id:
        await Table.filter(id=order.table_id).update(status='available')
    
    return {"message": "Payment processed successfully", "order_id": order_id}

@router.get("/{order_id}/receipt")
async def get_order_receipt(order_id: int):
    # Prefetch related data to avoid N+1 query issues
    order = await Order.get_or_none(id=order_id).prefetch_related('table', 'items__product')
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    filename = f"receipt_{order.order_number}.pdf"
    filepath = f"static/receipts/{filename}"
    
    os.makedirs("static/receipts", exist_ok=True)
    generate_receipt_pdf(order, filepath)
    
    # Return the PDF file. 'inline' opens it in the browser, 'attachment' forces download.
    return FileResponse(
        filepath, 
        media_type='application/pdf', 
        filename=filename,
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )