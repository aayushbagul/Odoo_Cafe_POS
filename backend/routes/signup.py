from fastapi import APIRouter, HTTPException, Depends, status
from schemas.signup import SignUp
from tortoise_models.signup import User
from fastapi.security import OAuth2PasswordBearer
import jwt
from schemas.signup import Login
from tortoise.expressions import Q
from routes.encryption_manager import EncryptionManager
from datetime import datetime, timedelta, timezone



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
async def register_user(user_data: SignUp):
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
    )

    return {"message": "User created successfully!", "user_id": new_user.id}


@router.post("/login")
async def login_user(login_data: Login):
    manager = EncryptionManager()
    enc_username_or_email = manager.encrypt(login_data.username_or_email)
    enc_password = manager.encrypt(login_data.password)
    user = await User.get_or_none(
        Q(email=enc_username_or_email) | Q(username=enc_username_or_email)
    )

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if user.password != enc_password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    dec_username_or_email = manager.decrypt(user.username)
    access_token = create_access_token(data={"sub": user.username})
    return {
        "message": "Login successful!",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": dec_username_or_email,
    }