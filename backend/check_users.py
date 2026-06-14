# backend/check_users.py
import asyncio
from tortoise import Tortoise
from tortoise_models.config import DATABASE_URL
from tortoise_models.signup import User

async def check():
    await Tortoise.init(db_url=DATABASE_URL, modules={"models": ["tortoise_models.signup"]})
    users = await User.all()
    
    print("\n" + "="*50)
    print("CURRENT USERS IN DATABASE:")
    print("="*50)
    if not users:
        print("❌ NO USERS FOUND! The database is empty.")
    else:
        for u in users:
            print(f"✅ Username: {u.username} | Password: {u.password} | Role: {u.role}")
    print("="*50 + "\n")
    
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(check())