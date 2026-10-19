from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from database import wishlists_collection, products_collection
from auth.jwt_handler import get_current_user

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])


def serialize_product_brief(p):
    return {
        "id": str(p["_id"]),
        "name": p["name"],
        "price": p["price"],
        "images": p.get("images", []),
        "state": p["state"],
        "category": p["category"],
        "rating": p.get("rating", 0),
    }


class WishlistToggleSchema(BaseModel):
    productId: str


@router.get("")
async def get_wishlist(current_user=Depends(get_current_user)):
    user_id = current_user["sub"]
    wishlist = wishlists_collection.find_one({"userId": user_id})
    if not wishlist:
        return {"items": []}

    items = []
    for pid in wishlist.get("productIds", []):
        try:
            product = products_collection.find_one({"_id": ObjectId(pid)})
            if product:
                items.append(serialize_product_brief(product))
        except Exception:
            pass

    return {"items": items}


@router.post("/toggle")
async def toggle_wishlist(data: WishlistToggleSchema, current_user=Depends(get_current_user)):
    user_id = current_user["sub"]
    wishlist = wishlists_collection.find_one({"userId": user_id})

    if not wishlist:
        wishlists_collection.insert_one({
            "userId": user_id,
            "productIds": [data.productId]
        })
        return {"message": "Added to wishlist", "inWishlist": True}

    product_ids = wishlist.get("productIds", [])
    if data.productId in product_ids:
        product_ids.remove(data.productId)
        wishlists_collection.update_one({"userId": user_id}, {"$set": {"productIds": product_ids}})
        return {"message": "Removed from wishlist", "inWishlist": False}
    else:
        product_ids.append(data.productId)
        wishlists_collection.update_one({"userId": user_id}, {"$set": {"productIds": product_ids}})
        return {"message": "Added to wishlist", "inWishlist": True}


@router.get("/check/{product_id}")
async def check_wishlist(product_id: str, current_user=Depends(get_current_user)):
    user_id = current_user["sub"]
    wishlist = wishlists_collection.find_one({"userId": user_id})
    if not wishlist:
        return {"inWishlist": False}
    return {"inWishlist": product_id in wishlist.get("productIds", [])}
