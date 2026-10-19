from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from database import carts_collection, products_collection
from auth.jwt_handler import get_current_user

router = APIRouter(prefix="/api/cart", tags=["Cart"])


def serialize_cart_item(item, product):
    return {
        "productId": str(item["productId"]),
        "quantity": item["quantity"],
        "product": {
            "id": str(product["_id"]),
            "name": product["name"],
            "price": product["price"],
            "images": product.get("images", []),
            "state": product["state"],
            "category": product["category"],
            "stock": product.get("stock", 0),
        } if product else None
    }


class AddToCartSchema(BaseModel):
    productId: str
    quantity: int = 1


class UpdateCartSchema(BaseModel):
    productId: str
    quantity: int


@router.get("")
async def get_cart(current_user=Depends(get_current_user)):
    user_id = current_user["sub"]
    cart = carts_collection.find_one({"userId": user_id})
    if not cart:
        return {"items": [], "total": 0}

    items_with_products = []
    total = 0
    for item in cart.get("items", []):
        try:
            product = products_collection.find_one({"_id": ObjectId(item["productId"])})
        except Exception:
            product = None
        if product:
            serialized = serialize_cart_item(item, product)
            items_with_products.append(serialized)
            total += product["price"] * item["quantity"]

    return {"items": items_with_products, "total": round(total, 2)}


@router.post("/add")
async def add_to_cart(data: AddToCartSchema, current_user=Depends(get_current_user)):
    user_id = current_user["sub"]

    try:
        product = products_collection.find_one({"_id": ObjectId(data.productId)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    cart = carts_collection.find_one({"userId": user_id})
    if not cart:
        carts_collection.insert_one({
            "userId": user_id,
            "items": [{"productId": data.productId, "quantity": data.quantity}]
        })
    else:
        items = cart.get("items", [])
        found = False
        for item in items:
            if item["productId"] == data.productId:
                item["quantity"] += data.quantity
                found = True
                break
        if not found:
            items.append({"productId": data.productId, "quantity": data.quantity})
        carts_collection.update_one({"userId": user_id}, {"$set": {"items": items}})

    return {"message": "Added to cart"}


@router.put("/update")
async def update_cart(data: UpdateCartSchema, current_user=Depends(get_current_user)):
    user_id = current_user["sub"]
    cart = carts_collection.find_one({"userId": user_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    items = cart.get("items", [])
    for item in items:
        if item["productId"] == data.productId:
            if data.quantity <= 0:
                items.remove(item)
            else:
                item["quantity"] = data.quantity
            break

    carts_collection.update_one({"userId": user_id}, {"$set": {"items": items}})
    return {"message": "Cart updated"}


@router.delete("/remove/{product_id}")
async def remove_from_cart(product_id: str, current_user=Depends(get_current_user)):
    user_id = current_user["sub"]
    cart = carts_collection.find_one({"userId": user_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    items = [i for i in cart.get("items", []) if i["productId"] != product_id]
    carts_collection.update_one({"userId": user_id}, {"$set": {"items": items}})
    return {"message": "Item removed from cart"}


@router.delete("/clear")
async def clear_cart(current_user=Depends(get_current_user)):
    user_id = current_user["sub"]
    carts_collection.update_one({"userId": user_id}, {"$set": {"items": []}})
    return {"message": "Cart cleared"}
