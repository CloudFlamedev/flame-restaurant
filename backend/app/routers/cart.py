from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth_utils
from ..database import get_db

router = APIRouter(prefix="/api/cart", tags=["cart"])


@router.get("/", response_model=list[schemas.CartItemOut])
def get_cart(db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    return db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).all()


@router.post("/", response_model=schemas.CartItemOut)
def add_to_cart(
    item: schemas.CartItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    food = db.query(models.Food).filter(models.Food.id == item.food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    existing = (
        db.query(models.CartItem)
        .filter(models.CartItem.user_id == current_user.id, models.CartItem.food_id == item.food_id)
        .first()
    )
    if existing:
        existing.quantity += item.quantity
        db.commit()
        db.refresh(existing)
        return existing

    cart_item = models.CartItem(user_id=current_user.id, food_id=item.food_id, quantity=item.quantity)
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return cart_item


@router.put("/{item_id}", response_model=schemas.CartItemOut)
def update_cart_item(
    item_id: int,
    update: schemas.CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    cart_item = (
        db.query(models.CartItem)
        .filter(models.CartItem.id == item_id, models.CartItem.user_id == current_user.id)
        .first()
    )
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if update.quantity <= 0:
        db.delete(cart_item)
        db.commit()
        raise HTTPException(status_code=204, detail="Item removed")

    cart_item.quantity = update.quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item


@router.delete("/{item_id}")
def remove_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    cart_item = (
        db.query(models.CartItem)
        .filter(models.CartItem.id == item_id, models.CartItem.user_id == current_user.id)
        .first()
    )
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(cart_item)
    db.commit()
    return {"detail": "removed"}


@router.delete("/")
def clear_cart(db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).delete()
    db.commit()
    return {"detail": "cart cleared"}
