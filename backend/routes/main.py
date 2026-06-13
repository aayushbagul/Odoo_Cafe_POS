from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise
from backend.tortoise_models.config import DATABASE_URL
from backend.routes.signup import router as signup_router

app = FastAPI()

app.include_router(signup_router, prefix="/api")

register_tortoise(
    app,
    db_url=DATABASE_URL,
    modules={"models": ["backend.tortoise_models.signup"]},
    generate_schemas=True,
    add_exception_handlers=True,
)