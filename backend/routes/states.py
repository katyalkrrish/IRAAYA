from fastapi import APIRouter
from database import products_collection

router = APIRouter(prefix="/api/states", tags=["States"])

INDIAN_STATES = [
    {"name": "Andhra Pradesh", "capital": "Amaravati", "craft": "Kalamkari, Kondapalli Toys"},
    {"name": "Arunachal Pradesh", "capital": "Itanagar", "craft": "Cane & Bamboo Craft"},
    {"name": "Assam", "capital": "Dispur", "craft": "Mekhela Chador, Cane Work"},
    {"name": "Bihar", "capital": "Patna", "craft": "Madhubani Painting, Sujni"},
    {"name": "Chhattisgarh", "capital": "Raipur", "craft": "Dhokra Art, Bell Metal"},
    {"name": "Goa", "capital": "Panaji", "craft": "Pottery, Coconut Shell Craft"},
    {"name": "Gujarat", "capital": "Gandhinagar", "craft": "Patola Silk, Bandhani"},
    {"name": "Haryana", "capital": "Chandigarh", "craft": "Phulkari, Pottery"},
    {"name": "Himachal Pradesh", "capital": "Shimla", "craft": "Kangra Paintings, Kullu Shawls"},
    {"name": "Jharkhand", "capital": "Ranchi", "craft": "Dokra Craft, Sohrai Painting"},
    {"name": "Karnataka", "capital": "Bengaluru", "craft": "Channapatna Toys, Bidriware"},
    {"name": "Kerala", "capital": "Thiruvananthapuram", "craft": "Kathakali Masks, Coir Work"},
    {"name": "Madhya Pradesh", "capital": "Bhopal", "craft": "Gond Art, Chanderi Silk"},
    {"name": "Maharashtra", "capital": "Mumbai", "craft": "Paithani Sarees, Warli Art"},
    {"name": "Manipur", "capital": "Imphal", "craft": "Longpi Pottery, Moirang Phee"},
    {"name": "Meghalaya", "capital": "Shillong", "craft": "Bamboo Craft, Cane Work"},
    {"name": "Mizoram", "capital": "Aizawl", "craft": "Puan Weaving, Bamboo Craft"},
    {"name": "Nagaland", "capital": "Kohima", "craft": "Naga Shawls, Woodcarving"},
    {"name": "Odisha", "capital": "Bhubaneswar", "craft": "Pattachitra, Sambalpuri Silk"},
    {"name": "Punjab", "capital": "Chandigarh", "craft": "Phulkari, Jutti Footwear"},
    {"name": "Rajasthan", "capital": "Jaipur", "craft": "Blue Pottery, Gemstone Jewellery"},
    {"name": "Sikkim", "capital": "Gangtok", "craft": "Thangka Paintings, Carpet Weaving"},
    {"name": "Tamil Nadu", "capital": "Chennai", "craft": "Kanjivaram Silk, Bronze Icons"},
    {"name": "Telangana", "capital": "Hyderabad", "craft": "Bidri Work, Pochampally Ikat"},
    {"name": "Tripura", "capital": "Agartala", "craft": "Bamboo Craft, Cane Furniture"},
    {"name": "Uttar Pradesh", "capital": "Lucknow", "craft": "Chikankari, Brassware"},
    {"name": "Uttarakhand", "capital": "Dehradun", "craft": "Ringaal Craft, Woollen Shawls"},
    {"name": "West Bengal", "capital": "Kolkata", "craft": "Baluchari Saree, Dokra"},
    {"name": "Delhi", "capital": "New Delhi", "craft": "Zari Embroidery, Meenakari"},
    {"name": "Jammu & Kashmir", "capital": "Srinagar", "craft": "Pashmina, Kani Shawl, Walnut Wood"},
    {"name": "Ladakh", "capital": "Leh", "craft": "Thangka Painting, Pashmina"},
    {"name": "Puducherry", "capital": "Puducherry", "craft": "Auroville Pottery, Handmade Paper"},
    {"name": "Chandigarh", "capital": "Chandigarh", "craft": "Phulkari, Leather Craft"},
]


@router.get("")
async def get_states():
    states_with_count = []
    for state in INDIAN_STATES:
        count = products_collection.count_documents({"state": state["name"]})
        states_with_count.append({**state, "productCount": count})
    return {"states": states_with_count}


@router.get("/{state_name}/products")
async def get_state_products(state_name: str):
    products = list(products_collection.find({"state": state_name}).limit(20))
    serialized = []
    for p in products:
        serialized.append({
            "id": str(p["_id"]),
            "name": p["name"],
            "price": p["price"],
            "images": p.get("images", []),
            "category": p["category"],
            "rating": p.get("rating", 0),
        })
    return {"products": serialized, "state": state_name}
