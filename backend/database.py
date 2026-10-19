from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/iraaya")

client = MongoClient(MONGODB_URI)
db = client["iraaya"]

# Collections
users_collection = db["users"]
products_collection = db["products"]
carts_collection = db["carts"]
wishlists_collection = db["wishlists"]
reviews_collection = db["reviews"]

# Indexes
users_collection.create_index("email", unique=True)
products_collection.create_index("name")
products_collection.create_index("state")
products_collection.create_index("category")

print("✅ Connected to MongoDB Atlas")
