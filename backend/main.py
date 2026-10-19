from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.cart import router as cart_router
from routes.wishlist import router as wishlist_router
from routes.reviews import router as reviews_router
from routes.states import router as states_router
from routes.upload import router as upload_router

app = FastAPI(
    title="Iraaya API",
    description="API for Iraaya - Indian Handicrafts E-Commerce Platform",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(cart_router)
app.include_router(wishlist_router)
app.include_router(reviews_router)
app.include_router(states_router)
app.include_router(upload_router)


@app.get("/")
async def root():
    return {"message": "Welcome to Iraaya API 🪔", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
