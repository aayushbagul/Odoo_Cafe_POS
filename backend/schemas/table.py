from pydantic import BaseModel
from typing import Optional

class TableBase(BaseModel):
    table_number: int
    floor_id: int
    seats: int
    status: str = "available"

class TableCreate(TableBase):
    pass

class TableUpdate(BaseModel):
    table_number: Optional[int] = None
    floor_id: Optional[int] = None
    seats: Optional[int] = None
    status: Optional[str] = None
    occupied: Optional[bool] = None

class TableResponse(TableBase):
    id: int
    occupied: bool
    
    class Config:
        from_attributes = True

class FloorBase(BaseModel):
    name: str

class FloorCreate(FloorBase):
    pass

class FloorResponse(FloorBase):
    id: int
    occupied: bool
    
    class Config:
        from_attributes = True