from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas, auth_utils
from ..database import get_db

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("/me", response_model=schemas.UserOut)
def get_profile(current_user: models.User = Depends(auth_utils.get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.UserOut)
def update_profile(
    update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/orders", response_model=list[schemas.OrderOut])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    return (
        db.query(models.Order)
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )
