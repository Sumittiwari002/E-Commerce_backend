import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { brandAction, getAllBrands } from "../controllers/brandController.js";
import { categoryAction, getAllcategories } from "../controllers/categoryController.js";
import { productAction, productData, singleProduct } from "../controllers/productController.js";
import { addToCart, getCart, removeFromCart, deleteProductFromCart } from "../controllers/cartController.js";
import { addToWishlist, getWishlist } from "../controllers/wishlistController.js";



const router = express.Router();

router

.get("/allBrands", getAllBrands)
.get("/allcategories", getAllcategories)
.get("/allProducts", productData)
.get('/productdetails/:productid', singleProduct)
.get("/getcart",authMiddleware, getCart)
.get("/getwishlist",authMiddleware, getWishlist)
.post("/addtocart", authMiddleware, addToCart)
.post("/addtowishlist", authMiddleware, addToWishlist)
.post("/removefromcart", authMiddleware, removeFromCart)
.post("/deleteproductfromcart", authMiddleware, deleteProductFromCart)
.post("/brand-action", authMiddleware, adminMiddleware, brandAction)
.post("/category-action", authMiddleware, adminMiddleware, categoryAction) 
.post("/product-action", authMiddleware, adminMiddleware, productAction);
 

export default router;