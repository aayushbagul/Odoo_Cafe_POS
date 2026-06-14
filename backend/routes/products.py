from fastapi import APIRouter, HTTPException, Depends
from tortoise_models.product import Product, Category
from schemas.product import ProductCreate, ProductUpdate, ProductResponse, CategoryCreate, CategoryResponse
from tortoise_models.signup import User
from dependencies import require_role, get_current_user
from typing import List

router = APIRouter()

# ==========================================
# CATEGORY ENDPOINTS
# ==========================================

@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(current_user: User = Depends(get_current_user)):
    # Accessible to all logged-in users (cashiers, admins)
    categories = await Category.filter()
    return categories

@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate, 
    current_user: User = Depends(require_role(["admin"])) # Admin only
):
    new_category = await Category.create(**category.dict())
    return new_category

# ==========================================
# PRODUCT ENDPOINTS
# ==========================================

@router.get("", response_model=List[ProductResponse])
async def get_products(
    category_id: int = None, 
    search: str = None,
    current_user: User = Depends(get_current_user) # Accessible to all logged-in users
):
    query = Product.filter(is_available=True)
    if category_id:
        query = query.filter(category_id=category_id)
    if search:
        query = query.filter(name__icontains=search)
    products = await query.prefetch_related('category')
    return products

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, current_user: User = Depends(get_current_user)):
    product = await Product.get_or_none(id=product_id).prefetch_related('category')
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=ProductResponse)
async def create_product(
    product: ProductCreate, 
    current_user: User = Depends(require_role(["admin"])) # Admin only
):
    new_product = await Product.create(**product.dict())
    return await Product.get(id=new_product.id).prefetch_related('category')

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int, 
    product: ProductUpdate, 
    current_user: User = Depends(require_role(["admin"])) # Admin only
):
    db_product = await Product.get_or_none(id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    await db_product.save()
    
    # Fix: Prefetch category before returning to avoid serialization errors
    return await Product.get(id=db_product.id).prefetch_related('category')

@router.delete("/{product_id}")
async def delete_product(
    product_id: int, 
    current_user: User = Depends(require_role(["admin"])) # Admin only
):
    product = await Product.get_or_none(id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await product.delete()
    return {"message": "Product deleted successfully"}