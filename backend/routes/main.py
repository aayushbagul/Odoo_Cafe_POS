from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise
from backend.tortoise_models.config import DATABASE_URL
from backend.routes.signup import router as signup_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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

app.include_router(signup_router, prefix="/api")

register_tortoise(
    app,
    db_url=DATABASE_URL,
    modules={"models": ["backend.tortoise_models.signup"]},
    generate_schemas=True,
    add_exception_handlers=True,
)
