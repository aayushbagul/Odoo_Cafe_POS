from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi import Request
from schemas.signup import SignUp, Login
from tortoise_models.signup import User
from fastapi.security import OAuth2PasswordBearer
from slowapi.util import get_remote_address
import jwt
from schemas.signup import Login
from tortoise.expressions import Q
from routes.encryption_manager import EncryptionManager
from datetime import datetime, timedelta, timezone
from .rate_limiter import limiter


router = APIRouter()

SECRET_KEY = "vnksbo!@#rnjavklBHJKN$_!@78"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# This tells FastAPI where to look for the token in Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = await User.get_or_none(username=username)
    if user is None:
        raise credentials_exception
    return user

@router.post("/register")
@limiter.limit("5/hour") # Max 5 registrations per hour per IP
async def register_user(request: Request, user_data: SignUp):
    manager = EncryptionManager()
    enc_name = manager.encrypt(user_data.name)
    enc_username = manager.encrypt(user_data.username)
    enc_email = manager.encrypt(user_data.email)
    enc_password = manager.encrypt(user_data.password)

    if await User.filter(username=enc_username).exists():
        raise HTTPException(status_code=400, detail="Username is already taken")
    if await User.filter(email=enc_email).exists():
        raise HTTPException(status_code=400, detail="Email is already registered")

    new_user = await User.create(
        name=enc_name,
        username=enc_username,
        email=enc_email,
        password=enc_password,
        role=user_data.role if hasattr(user_data, 'role') else "cashier"
    )

    return {"message": "User created successfully!", "user_id": new_user.id}


@router.post("/login")
@limiter.limit("10/minute") 
async def login_user(request: Request, login_data: Login): 
    # 1. Get whatever string the user typed (handles 'email', 'username', or 'username_or_email')
    search_term = getattr(login_data, 'username_or_email', None) or \
                  getattr(login_data, 'email', None) or \
                  getattr(login_data, 'username', None)

    if not search_term:
        raise HTTPException(status_code=400, detail="Missing username or email")

    # 2. Search the database for EITHER the email OR the username
    user = await User.get_or_none(
        Q(email=search_term) | Q(username=search_term)
    )

    # 3. Check if user exists and password matches
    if not user or user.password != login_data.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # 4. Generate token
    access_token = create_access_token(data={"sub": user.username})

    return {
        "message": "Login successful!",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "role": user.role
    }