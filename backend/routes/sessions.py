from fastapi import APIRouter, HTTPException, Depends
from tortoise_models.session import POSSession
from tortoise_models.order import Order
from tortoise_models.signup import User
from dependencies import get_current_user
from decimal import Decimal
from datetime import datetime

router = APIRouter()

@router.get("/current")
async def get_current_session(current_user: User = Depends(get_current_user)):
    session = await POSSession.filter(user=current_user, status="open").first()
    if not session:
        return None
    # Calculate live stats
    paid_orders = await Order.filter(session=session, status="paid").all()
    total_sales = sum(float(o.total) for o in paid_orders)
    return {
        "id": session.id,
        "start_time": session.start_time,
        "opening_cash": float(session.opening_cash),
        "total_sales": total_sales,
        "order_count": len(paid_orders)
    }

@router.post("/open")
async def open_session(data: dict, current_user: User = Depends(get_current_user)):
    # Close any existing open sessions first (safety check)
    await POSSession.filter(user=current_user, status="open").update(status="closed", end_time=datetime.now())
    
    session = await POSSession.create(
        user=current_user,
        opening_cash=data.get("opening_cash", 0)
    )
    return {"id": session.id, "message": "Session opened"}

@router.post("/{session_id}/close")
async def close_session(session_id: int, data: dict, current_user: User = Depends(get_current_user)):
    session = await POSSession.get_or_none(id=session_id, user=current_user)
    if not session:
        raise HTTPException(404, "Session not found")
    
    closing_cash = data.get("closing_cash", 0)
    
    # Calculate final stats
    paid_orders = await Order.filter(session=session, status="paid").all()
    total_sales = sum(float(o.total) for o in paid_orders)
    
    session.end_time = datetime.now()
    session.closing_cash = closing_cash
    session.total_sales = total_sales
    session.status = "closed"
    await session.save()
    
    return {
        "message": "Session closed",
        "total_sales": total_sales,
        "opening_cash": float(session.opening_cash),
        "closing_cash": float(closing_cash),
        "expected_cash": float(session.opening_cash) + total_sales,
        "difference": float(closing_cash) - (float(session.opening_cash) + total_sales),
        "order_count": len(paid_orders)
    }

@router.get("/history")
async def get_session_history(current_user: User = Depends(get_current_user)):
    sessions = await POSSession.filter(user=current_user).order_by("-start_time").limit(10)
    return [{
        "id": s.id,
        "start_time": s.start_time,
        "end_time": s.end_time,
        "total_sales": float(s.total_sales),
        "status": s.status
    } for s in sessions]