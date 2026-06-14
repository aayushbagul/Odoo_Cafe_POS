from fastapi import APIRouter, HTTPException, Depends
from tortoise_models.signup import User
from tortoise.expressions import Q
from dependencies import require_role
from typing import List

router = APIRouter()

@router.get("", dependencies=[Depends(require_role(["admin"]))])
async def get_employees():
    users = await User.all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role, "is_archived": u.is_archived} for u in users]

@router.post("", dependencies=[Depends(require_role(["admin"]))])
async def create_employee(user_data: dict):
    exists = await User.filter(Q(email=user_data["email"]) | Q(username=user_data["username"])).exists()
    if exists: raise HTTPException(400, "User already exists")
    user = await User.create(**user_data)
    return {"id": user.id, "message": "Employee created"}

@router.patch("/{user_id}/archive", dependencies=[Depends(require_role(["admin"]))])
async def archive_employee(user_id: int):
    user = await User.get_or_none(id=user_id)
    if not user: raise HTTPException(404, "User not found")
    user.is_archived = not user.is_archived
    await user.save()
    return {"message": "Status updated", "is_archived": user.is_archived}

@router.delete("/{user_id}", dependencies=[Depends(require_role(["admin"]))])
async def delete_employee(user_id: int):
    user = await User.get_or_none(id=user_id)
    if not user: raise HTTPException(404, "User not found")
    await user.delete()
    return {"message": "Deleted"}