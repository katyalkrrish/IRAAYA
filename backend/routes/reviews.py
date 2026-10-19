from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
from database import reviews_collection, products_collection
from auth.jwt_handler import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


def serialize_review(r):
    return {
        "id": str(r["_id"]),
        "productId": r["productId"],
        "userId": r["userId"],
        "userName": r["userName"],
        "rating": r["rating"],
        "comment": r["comment"],
        "createdAt": r.get("createdAt", ""),
    }


class ReviewSchema(BaseModel):
    rating: int
    comment: str


@router.get("/{product_id}")
async def get_reviews(product_id: str):
    reviews = list(reviews_collection.find({"productId": product_id}).sort("createdAt", -1))
    return {"reviews": [serialize_review(r) for r in reviews]}


@router.post("/{product_id}", status_code=201)
async def add_review(product_id: str, data: ReviewSchema, current_user=Depends(get_current_user)):
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    try:
        product = products_collection.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = reviews_collection.find_one({
        "productId": product_id,
        "userId": current_user["sub"]
    })
    if existing:
        reviews_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": {"rating": data.rating, "comment": data.comment}}
        )
    else:
        review = {
            "productId": product_id,
            "userId": current_user["sub"],
            "userName": current_user.get("name", current_user.get("email", "User")),
            "rating": data.rating,
            "comment": data.comment,
            "createdAt": datetime.utcnow().isoformat(),
        }
        reviews_collection.insert_one(review)

    # Update product rating
    all_reviews = list(reviews_collection.find({"productId": product_id}))
    avg_rating = sum(r["rating"] for r in all_reviews) / len(all_reviews)
    products_collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {"rating": round(avg_rating, 1), "numReviews": len(all_reviews)}}
    )

    return {"message": "Review submitted successfully"}
