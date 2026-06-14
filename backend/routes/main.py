from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise
from tortoise_models.config import DATABASE_URL

from slowapi import  _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from .rate_limiter import limiter # Import from our new file

from routes.signup import router as signup_router
from routes.tables import router as tables_router
from routes.products import router as products_router
from routes.customers import router as customers_router
from routes.orders import router as orders_router
from routes.uploads import router as uploads_router
from routes.coupons import router as coupons_router
from routes.kds import router as kds_router
from routes.employees import router as employees_router
from routes.payments import router as payments_router
from routes.reservations import router as reservations_router
from routes.sessions import router as sessions_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Odoo POS API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(signup_router, prefix="/api/auth")
app.include_router(tables_router, prefix="/api/tables")
app.include_router(products_router, prefix="/api/products")
app.include_router(customers_router, prefix="/api/customers")
app.include_router(orders_router, prefix="/api/orders")
app.include_router(coupons_router, prefix="/api/coupons")
app.include_router(kds_router, prefix="/api/kds")
app.include_router(employees_router, prefix="/api/employees")
app.include_router(payments_router, prefix="/api/payments")
app.include_router(reservations_router, prefix="/api/reservations")
app.include_router(sessions_router, prefix="/api/sessions")
app.include_router(uploads_router, prefix="/api")

# Mount the static directory so images can be accessed via URL
app.mount("/static", StaticFiles(directory="static"), name="static")

register_tortoise(
    app,
    db_url=DATABASE_URL,
    modules={"models": [
		"tortoise_models.signup",
		"tortoise_models.table",
		"tortoise_models.product",
		"tortoise_models.customer",
		"tortoise_models.order",
		"tortoise_models.coupon",
		"tortoise_models.payment",
		"tortoise_models.session",
        "tortoise_models.reservation",
	]},
    generate_schemas=True,
    add_exception_handlers=True,
)
