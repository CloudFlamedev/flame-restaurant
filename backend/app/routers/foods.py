from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/foods", tags=["foods"])


@router.get("/", response_model=list[schemas.FoodOut])
def list_foods(category_id: Optional[int] = None, search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Food).filter(models.Food.is_available == True)  # noqa: E712
    if category_id:
        query = query.filter(models.Food.category_id == category_id)
    if search:
        query = query.filter(models.Food.name.ilike(f"%{search}%"))
    return query.all()


@router.get("/{food_id}", response_model=schemas.FoodOut)
def get_food(food_id: int, db: Session = Depends(get_db)):
    return db.query(models.Food).filter(models.Food.id == food_id).first()


@router.post("/", response_model=schemas.FoodOut)
def create_food(food: schemas.FoodCreate, db: Session = Depends(get_db)):
    obj = models.Food(**food.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
