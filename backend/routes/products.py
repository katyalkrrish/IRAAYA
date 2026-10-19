from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional, List
from bson import ObjectId
from datetime import datetime
from database import products_collection
from auth.jwt_handler import get_admin_user

router = APIRouter(prefix="/api/products", tags=["Products"])

INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh"
]

CATEGORIES = [
    "Textiles", "Pottery", "Jewellery", "Paintings", "Woodwork",
    "Metalwork", "Bamboo Craft", "Stone Craft", "Leather Work", "Weaving"
]


def serialize_product(p):
    return {
        "id": str(p["_id"]),
        "name": p["name"],
        "description": p.get("description", ""),
        "price": p["price"],
        "state": p["state"],
        "category": p["category"],
        "images": p.get("images", []),
        "stock": p.get("stock", 0),
        "rating": p.get("rating", 0),
        "numReviews": p.get("numReviews", 0),
        "artisan": p.get("artisan", ""),
        "tags": p.get("tags", []),
        "isFeatured": p.get("isFeatured", False),
        "createdAt": p.get("createdAt", ""),
    }


class ProductSchema(BaseModel):
    name: str
    description: str
    price: float
    state: str
    category: str
    images: List[str] = []
    stock: int = 10
    artisan: str = ""
    tags: List[str] = []
    isFeatured: bool = False


@router.get("")
async def get_products(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    search: Optional[str] = None,
    state: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = "createdAt",
    featured: Optional[bool] = None,
):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"artisan": {"$regex": search, "$options": "i"}},
        ]
    if state:
        query["state"] = state
    if category:
        query["category"] = category
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    if featured is not None:
        query["isFeatured"] = featured

    sort_map = {
        "createdAt": [("createdAt", -1)],
        "price_asc": [("price", 1)],
        "price_desc": [("price", -1)],
        "rating": [("rating", -1)],
        "name": [("name", 1)],
    }
    sort_order = sort_map.get(sort_by, [("createdAt", -1)])

    total = products_collection.count_documents(query)
    skip = (page - 1) * limit
    products = list(products_collection.find(query).sort(sort_order).skip(skip).limit(limit))

    return {
        "products": [serialize_product(p) for p in products],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/meta")
async def get_meta():
    return {"states": INDIAN_STATES, "categories": CATEGORIES}


@router.get("/{product_id}")
async def get_product(product_id: str):
    try:
        product = products_collection.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_product(product)


@router.post("", status_code=201)
async def create_product(data: ProductSchema, admin=Depends(get_admin_user)):
    product = data.model_dump()
    product["rating"] = 0.0
    product["numReviews"] = 0
    product["createdAt"] = datetime.utcnow().isoformat()
    result = products_collection.insert_one(product)
    product["_id"] = result.inserted_id
    return serialize_product(product)


@router.put("/{product_id}")
async def update_product(product_id: str, data: ProductSchema, admin=Depends(get_admin_user)):
    try:
        result = products_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": data.model_dump()}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    updated = products_collection.find_one({"_id": ObjectId(product_id)})
    return serialize_product(updated)


@router.delete("/{product_id}")
async def delete_product(product_id: str, admin=Depends(get_admin_user)):
    try:
        result = products_collection.delete_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}
