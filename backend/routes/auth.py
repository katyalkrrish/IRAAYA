from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from datetime import datetime
from bson import ObjectId
from database import users_collection
from auth.jwt_handler import create_access_token, get_current_user
from auth.hash_password import hash_password, verify_password
import os

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


def serialize_user(user):
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "user"),
        "avatar": user.get("avatar", ""),
        "createdAt": user.get("createdAt", ""),
    }


@router.post("/register", status_code=201)
async def register(data: RegisterSchema):
    existing = users_collection.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "role": "user",
        "avatar": "",
        "createdAt": datetime.utcnow().isoformat(),
    }
    result = users_collection.insert_one(user)
    user["_id"] = result.inserted_id

    token = create_access_token({
        "sub": str(result.inserted_id),
        "email": data.email,
        "role": "user"
    })

    return {"token": token, "user": serialize_user(user)}


@router.post("/login")
async def login(data: LoginSchema):
    # Check admin credentials
    admin_email = os.getenv("ADMIN_EMAIL", "admin@iraaya.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")

    if data.email == admin_email and data.password == admin_password:
        token = create_access_token({
            "sub": "admin",
            "email": admin_email,
            "role": "admin"
        })
        return {
            "token": token,
            "user": {
                "id": "admin",
                "name": "Admin",
                "email": admin_email,
                "role": "admin",
                "avatar": ""
            }
        }

    user = users_collection.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": user.get("role", "user")
    })

    return {"token": token, "user": serialize_user(user)}


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    if current_user.get("sub") == "admin":
        return {
            "id": "admin",
            "name": "Admin",
            "email": current_user.get("email"),
            "role": "admin",
            "avatar": ""
        }
    user = users_collection.find_one({"_id": ObjectId(current_user["sub"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_user(user)
