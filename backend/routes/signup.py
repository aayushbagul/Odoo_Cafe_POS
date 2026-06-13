from fastapi import APIRouter, HTTPException
from backend.schemas.signup import SignUp
from backend.tortoise_models.signup import User
from backend.schemas.signup import Login
from tortoise.expressions import Q

router = APIRouter()

@router.post("/register")
async def register_user(user_data: SignUp):
    # 1. Check if the username already exists in the database
    if await User.filter(username=user_data.username).exists():
        raise HTTPException(status_code=400, detail="Username is already taken")

    # 2. Check if the email already exists
    if await User.filter(email=user_data.email).exists():
        raise HTTPException(status_code=400, detail="Email is already registered")

    # 3. Save the new user to the database
    # NOTE: We are saving the raw password for now, but we will need to hash it later!
    new_user = await User.create(
        name=user_data.name,
        username=user_data.username,
        email=user_data.email,
        password=user_data.password
    )

    return {"message": "User created successfully!", "user_id": new_user.id}


@router.post("/login")
async def login_user(login_data: Login):
    user = await User.get_or_none(
        Q(email=login_data.username_or_email) | Q(username=login_data.username_or_email)
    )

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if user.password != login_data.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    return {
        "message": "Login successful!",
        "user_id": user.id,
        "username": user.username
    }