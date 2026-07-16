from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine, SessionLocal
from .routers import auth, profile, categories, foods, cart, orders

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Flame Restaurant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(categories.router)
app.include_router(foods.router)
app.include_router(cart.router)
app.include_router(orders.router)


@app.get("/api/health")
def health_check():
    """Used by Docker HEALTHCHECK / Kubernetes liveness & readiness probes."""
    return {"status": "ok"}


@app.get("/")
def root():
    return {"message": "Flame Restaurant API is running", "docs": "/docs"}


def seed_data():
    db = SessionLocal()
    try:
        if db.query(models.Category).count() > 0:
            return

        categories_data = [
            {"name": "Starters", "icon": "🥗"},
            {"name": "Main Course", "icon": "🍛"},
            {"name": "Pizza", "icon": "🍕"},
            {"name": "Desserts", "icon": "🍰"},
            {"name": "Beverages", "icon": "🥤"},
        ]
        cat_objs = {}
        for c in categories_data:
            obj = models.Category(**c)
            db.add(obj)
            db.flush()
            cat_objs[c["name"]] = obj.id

        foods_data = [
            {"name": "Paneer Tikka", "description": "Chargrilled cottage cheese cubes marinated in spices", "price": 220.0, "category_id": cat_objs["Starters"], "image_url": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400"},
            {"name": "Chicken 65", "description": "Spicy deep-fried chicken bites", "price": 260.0, "category_id": cat_objs["Starters"], "image_url": "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400"},
            {"name": "Butter Chicken", "description": "Creamy tomato-based curry with tender chicken", "price": 340.0, "category_id": cat_objs["Main Course"], "image_url": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400"},
            {"name": "Dal Makhani", "description": "Slow-cooked black lentils in butter and cream", "price": 240.0, "category_id": cat_objs["Main Course"], "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400"},
            {"name": "Margherita Pizza", "description": "Classic pizza with tomato, mozzarella and basil", "price": 280.0, "category_id": cat_objs["Pizza"], "image_url": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400"},
            {"name": "Farmhouse Pizza", "description": "Loaded with fresh veggies and cheese", "price": 320.0, "category_id": cat_objs["Pizza"], "image_url": "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400"},
            {"name": "Gulab Jamun", "description": "Soft milk dumplings soaked in rose syrup", "price": 120.0, "category_id": cat_objs["Desserts"], "image_url": "https://images.unsplash.com/photo-1666190091586-62fd90cafa1a?w=400"},
            {"name": "Chocolate Brownie", "description": "Warm fudgy brownie with vanilla ice cream", "price": 180.0, "category_id": cat_objs["Desserts"], "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400"},
            {"name": "Masala Chai", "description": "Spiced Indian tea", "price": 60.0, "category_id": cat_objs["Beverages"], "image_url": "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8ee?w=400"},
            {"name": "Cold Coffee", "description": "Chilled coffee blended with ice cream", "price": 140.0, "category_id": cat_objs["Beverages"], "image_url": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400"},
        ]
        for f in foods_data:
            db.add(models.Food(**f))

        db.commit()
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    seed_data()
