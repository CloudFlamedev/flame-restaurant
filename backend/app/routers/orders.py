import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth_utils
from ..database import get_db

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("/checkout", response_model=schemas.OrderOut)
def checkout(
    request: schemas.CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    cart_items = db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = sum(item.food.price * item.quantity for item in cart_items)

    # --- Mock payment gateway call ---
    # In production, swap this block for a real integration (Stripe/Razorpay).
    payment_id = f"pay_{uuid.uuid4().hex[:12]}"
    payment_status = "paid" if request.payment_method != "cod" else "pending"

    order = models.Order(
        user_id=current_user.id,
        total_amount=total,
        status=payment_status,
        payment_id=payment_id,
    )
    db.add(order)
    db.flush()  # get order.id before commit

    for item in cart_items:
        db.add(
            models.OrderItem(
                order_id=order.id,
                food_id=item.food_id,
                food_name=item.food.name,
                quantity=item.quantity,
                price_at_order=item.food.price,
            )
        )

    db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).delete()
    db.commit()
    db.refresh(order)
    return order


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    order = (
        db.query(models.Order)
        .filter(models.Order.id == order_id, models.Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
