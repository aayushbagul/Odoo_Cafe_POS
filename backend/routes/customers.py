from fastapi import APIRouter, HTTPException, Query, Depends
from tortoise.expressions import Q
from tortoise_models.customer import Customer
from tortoise_models.signup import User
from schemas.customer import CustomerResponse, CustomerCreate, CustomerUpdate
from dependencies import get_current_user
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# ==========================================
# ROUTES
# ==========================================

@router.get("", response_model=List[CustomerResponse])
async def get_customers(
    search: str = Query(None, description="Search by name, email, or phone"),
    current_user: User = Depends(get_current_user) # Any logged-in user (cashier/admin)
):
    query = Customer.all()
    
    # If a search term is provided, filter by Name OR Email OR Phone
    if search:
        query = query.filter(
            Q(name__icontains=search) | 
            Q(email__icontains=search) | 
            Q(phone__icontains=search)
        )
        
    return await query.order_by("-id") # Newest first

@router.post("", response_model=CustomerResponse)
async def create_customer(
    customer: CustomerCreate,
    current_user: User = Depends(get_current_user)
):
    new_customer = await Customer.create(**customer.dict(exclude_unset=True))
    return new_customer

@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: int,
    current_user: User = Depends(get_current_user)
):
    customer = await Customer.get_or_none(id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: int,
    customer: CustomerUpdate,
    current_user: User = Depends(get_current_user)
):
    db_customer = await Customer.get_or_none(id=customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Update only the fields that were provided in the request
    update_data = customer.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_customer, key, value)
    
    await db_customer.save()
    return db_customer

@router.delete("/{customer_id}")
async def delete_customer(
    customer_id: int,
    current_user: User = Depends(get_current_user)
):
    customer = await Customer.get_or_none(id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    await customer.delete()
    return {"message": "Customer deleted successfully"}