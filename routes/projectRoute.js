import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { brandAction, getAllBrands } from "../controllers/brandController.js";
import { categoryAction, getAllcategories } from "../controllers/categoryController.js";
import { productAction, productData } from "../controllers/productController.js";



const router = express.Router();

router
// .post("/brand-action", authMiddleware, adminMiddleware, brandAction)
// .post("/category-action", authMiddleware, adminMiddleware, categoryAction)
// .post("/product-action", authMiddleware, adminMiddleware, productAction);
.get("/allBrands", getAllBrands)
.get("/allcategories", getAllcategories)
.get("/allProducts", productData)
.post("/brand-action", authMiddleware, adminMiddleware, brandAction)
.post("/category-action", authMiddleware, adminMiddleware, categoryAction) 
.post("/product-action", authMiddleware, adminMiddleware, productAction);
 

export default router;