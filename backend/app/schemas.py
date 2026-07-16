from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ---------- Auth / User ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Category ----------
class CategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = "🍽️"


class CategoryOut(BaseModel):
    id: int
    name: str
    icon: str

    class Config:
        from_attributes = True


# ---------- Food ----------
class FoodCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    price: float
    image_url: Optional[str] = ""
    category_id: int
    is_available: Optional[bool] = True


class FoodOut(BaseModel):
    id: int
    name: str
    description: str
    price: float
    image_url: str
    is_available: bool
    category_id: int

    class Config:
        from_attributes = True


# ---------- Cart ----------
class CartItemCreate(BaseModel):
    food_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemOut(BaseModel):
    id: int
    food: FoodOut
    quantity: int

    class Config:
        from_attributes = True


# ---------- Orders / Payment ----------
class CheckoutRequest(BaseModel):
    payment_method: str = "card"  # card, upi, cod


class OrderItemOut(BaseModel):
    food_name: str
    quantity: int
    price_at_order: float

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    total_amount: float
    status: str
    payment_id: Optional[str] = None
    created_at: datetime
    items: List[OrderItemOut]

    class Config:
        from_attributes = True
