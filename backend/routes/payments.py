import io
import qrcode
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from tortoise_models.payment import PaymentMethod
from dependencies import require_role

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

@router.get("/qr")
async def generate_qr_code(data: str = Query(..., description="Data to encode in QR code")):
    """Generates a QR code image dynamically using Python"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    # Create image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to a bytes buffer
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    byte_im = buf.getvalue()
    
    # Return as an image stream
    return StreamingResponse(io.BytesIO(byte_im), media_type="image/png")
