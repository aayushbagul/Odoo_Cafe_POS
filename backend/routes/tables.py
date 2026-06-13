from fastapi import APIRouter, HTTPException
from tortoise_models.table import Table, Floor
from schemas.table import TableCreate, TableUpdate, TableResponse, FloorCreate, FloorResponse
from typing import List

router = APIRouter()

# Floor endpoints
@router.get("/floors", response_model=List[FloorResponse])
async def get_floors():
    floors = await Floor.filter(occupied=True)
    return floors

@router.post("/floors", response_model=FloorResponse)
async def create_floor(floor: FloorCreate):
    new_floor = await Floor.create(**floor.dict())
    return new_floor

# Table endpoints
@router.get("", response_model=List[TableResponse])
async def get_tables(floor_id: int = None):
    query = Table.filter(occupied=True)
    if floor_id:
        query = query.filter(floor_id=floor_id)
    tables = await query.prefetch_related('floor')
    return tables

@router.get("/{table_id}", response_model=TableResponse)
async def get_table(table_id: int):
    table = await Table.get_or_none(id=table_id).prefetch_related('floor')
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    return table

@router.post("", response_model=TableResponse)
async def create_table(table: TableCreate):
    # Check if table number already exists
    exists = await Table.filter(table_number=table.table_number).exists()
    if exists:
        raise HTTPException(status_code=400, detail="Table number already exists")
    
    new_table = await Table.create(**table.dict())
    return new_table

@router.put("/{table_id}", response_model=TableResponse)
async def update_table(table_id: int, table: TableUpdate):
    db_table = await Table.get_or_none(id=table_id)
    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    update_data = table.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_table, key, value)
    
    await db_table.save()
    return db_table

@router.delete("/{table_id}")
async def delete_table(table_id: int):
    table = await Table.get_or_none(id=table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    await table.delete()
    return {"message": "Table deleted successfully"}