from fastapi import APIRouter, HTTPException
from tortoise_models.customer import Customer
from schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from typing import List

router = APIRouter()

@router.get("", response_model=List[CustomerResponse])
async def get_customers(search: str = None):
    query = Customer.all()
    if search:
        query = query.filter(name__icontains=search)
    customers = await query
    return customers

@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: int):
    customer = await Customer.get_or_none(id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("", response_model=CustomerResponse)
async def create_customer(customer: CustomerCreate):
    new_customer = await Customer.create(**customer.dict())
    return new_customer

@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(customer_id: int, customer: CustomerUpdate):
    db_customer = await Customer.get_or_none(id=customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    update_data = customer.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_customer, key, value)
    
    await db_customer.save()
    return db_customer

@router.delete("/{customer_id}")
async def delete_customer(customer_id: int):
    customer = await Customer.get_or_none(id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    await customer.delete()
    return {"message": "Customer deleted successfully"}