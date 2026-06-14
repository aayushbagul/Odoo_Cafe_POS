from fastapi import APIRouter, HTTPException, Depends
from tortoise_models.reservation import Reservation
from dependencies import require_role
from typing import List

router = APIRouter()

@router.get("")
async def get_reservations():
    return await Reservation.all().prefetch_related('table')

@router.post("", dependencies=[Depends(require_role(["admin", "cashier"]))])
async def create_reservation(data: dict):
    res = await Reservation.create(**data)
    return res

@router.put("/{res_id}", dependencies=[Depends(require_role(["admin", "cashier"]))])
async def update_reservation(res_id: int, data: dict):
    res = await Reservation.get_or_none(id=res_id)
    if not res: raise HTTPException(404, "Not found")
    for k, v in data.items(): setattr(res, k, v)
    await res.save()
    return res

@router.delete("/{res_id}", dependencies=[Depends(require_role(["admin"]))])
async def delete_reservation(res_id: int):
    res = await Reservation.get_or_none(id=res_id)
    if not res: raise HTTPException(404, "Not found")
    await res.delete()
    return {"message": "Deleted"}