from fastapi import APIRouter, HTTPException, Depends
from tortoise_models.payment import PaymentMethod
from dependencies import require_role
from typing import List

router = APIRouter()

@router.get("")
async def get_payment_methods():
    return await PaymentMethod.all()

@router.put("/{method_id}", dependencies=[Depends(require_role(["admin"]))])
async def update_payment_method(method_id: int, data: dict):
    method = await PaymentMethod.get_or_none(id=method_id)
    if not method: raise HTTPException(404, "Not found")
    for k, v in data.items(): setattr(method, k, v)
    await method.save()
    return method