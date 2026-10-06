import Product from "../models/Product.js";
import multer from 'multer';
import path from "path";
import fs from "fs";

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
}).single("path");

const productAction = async (req, res) =>{
    try{
        upload(req, res, async function (err){
            if(err instanceof multer.MulterError){
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            if(err){
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            let timeStamp = Date.now();

            const product = new Product({
                name: req.body.name,
                price: req.body.price,
                discount: req.body.discount,
                description: req.body.description,
                categoryId: req. body.categoryId,
                brandId: req.body.brandId,
                path:"",
            });

            const validationError = product.validateSync();
            // console.log(validationError);
            // console.log(Object.keys(validationError.errors));

            if(validationError){
                const errors = {};

                Object.keys(validationError.errors).forEach((field)=>{
                    //console.log(field, validationError.errors[field].message);

                    errors[field] = validationError.errors[field].message;


                });
                // console.log(errors);

                return res.status(400).json({
                    success: false,
                    message: "Product validation failed",
                    errors,
                });
                
            }
            if(!req.file){
                return res.status(400).json({
                    success: false,
                    message: "Product image is required",
                });
            }

            const allowedMimeTypes = [
                "image/png",
                "image/jpg",
                "image/jpeg",
                "image/webp"
            ];
            
            if(!allowedMimeTypes.includes(req.file.mimetype)){
                return res.status(400).json({
                    success: false,
                    message: "Only PNG, JPG, WEBP and JPEG images are allowed"
                });
            }

            if(req.file.size >5000000){
                return res.status(400).json({
                    success: false,
                    message: "file allowed upto 5mb"
                });
            }

            const fileName = timeStamp + "-" + req.file.originalname;

            // console.log(req.body);
            // console.log(req.file.buffer);

            const uploadPath = path.join(
                process.cwd(),
                "assets",
                "products"
            );

            await fs.promises.mkdir(uploadPath, {
                recursive: true,
            });
            
            const filePath= path.join(
                uploadPath,
                fileName
            );

            await fs.promises.writeFile(
                filePath,
                req.file.buffer
            );

            await Product.create({
                name: req.body.name,
                price: req.body.price,
                discount: req.body.discount,
                description: req.body.description,
                categoryId: req. body.categoryId,
                brandId: req.body.brandId,
                path:"/assets/products/" + fileName,
                
            });

            return res.status(201).json({
                    success: true,
                    message: "Product Added",
                });
            
            
        });
    }
    catch(error){
        return res.status(500).json({
                    success: false,
                    message: err.message
                });
    }
}

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
export {
    productAction, productData
}