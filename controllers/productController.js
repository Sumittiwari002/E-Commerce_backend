import Product from "../models/Product.js";
import multer from 'multer';
import path from "path";
import fs from "fs";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
}).single("path");

const productAction = async (req, res) => {
    upload(req, res, async function (err) {
        try {
            // 1. Handle Multer errors
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }

            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }

            // 2. Check whether an image was uploaded
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Product image is required",
                });
            }

            // 3. Validate image type
            const allowedMimeTypes = [
                "image/png",
                "image/jpg",
                "image/jpeg",
                "image/webp",
            ];

            if (!allowedMimeTypes.includes(req.file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Only PNG, JPG, WEBP and JPEG images are allowed",
                });
            }

            // 4. Validate image size (maximum 5 MB)
            if (req.file.size > 5 * 1024 * 1024) {
                return res.status(400).json({
                    success: false,
                    message: "File size must not exceed 5 MB",
                });
            }

            // 5. Upload image to Cloudinary
            const image = await uploadToCloudinary(
                req.file.buffer
            );

            const exitproduct = await Product.findOne({name:req.body.name});
            if (exitproduct) {
                return res.status(400).json({
                    message: "Product already exists"
                });
            }
            // 6. Save product details and Cloudinary URL in MongoDB
            const product = await Product.create({
                name: req.body.name,
                price: req.body.price,
                discount: req.body.discount,
                description: req.body.description,
                categoryId: req.body.categoryId,
                brandId: req.body.brandId,
                path: image.url,
                cloudinaryPublicId: image.publicId,
            });

            // 7. Send success response
            return res.status(201).json({
                success: true,
                message: "Product added successfully",
                product,
            });
        } catch (error) {
            console.error("Product Creation Error:", error);

            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
};

const productData= async (req, res)=>{
    try{
        let values = await Product.find();

            res.status(200).json({
            success: true,
            message: "Product Fetched successfully",
            dataSet: values
        });
    }
    catch(error){
        console.error("Product Fetch Error", error);

            res.status(500).json({
            success: false,
            message: error.message
        });
    }

}

const singleProduct = async (req, res)=>{
    try{
        const productId = req.params.productid; 
        const product = await Product.findById(productId)
            .populate("brandId", "name")
            .populate("categoryId", "name");
        console.log(product);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
                success: true,
                message: "Product found",
                product
            });
    }
    catch(err){
        return res.status(500).json({
                success: false,
                message: "Error found"
        });
    }
}
const RemoveProduct = async(req, res) =>{
    const {productId} = req.body;

    const product = await Product.findById(productId);

    if(!product)
    {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        })
    }
    await Product.findByIdAndDelete(productId);
    
    return res.status(200).json({
        success: true,
        message: "Product removed successfully"
    })
}

export {
    productAction, productData, singleProduct, RemoveProduct
}

