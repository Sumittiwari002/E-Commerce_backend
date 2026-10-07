import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

export const addToCart = async (req, res) => {
    try {

        const { productId, quantity } = req.body;

        // Check logged-in user
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        // Check productId
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // Check quantity
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        // 1. Check product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 2. Find user's cart
        let cart = await Cart.findOne({
            user: req.user._id
        });

        // 3. If cart doesn't exist
        if (!cart) {

            cart = new Cart({
                user: req.user._id,
                items: []
            });
        }

        // 4. Check if product already exists
        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {

            // Product already exists
            existingItem.quantity += Number(quantity);

        } else {

            // New product
            cart.items.push({
                product: productId,
                quantity: Number(quantity)
            });

        }

        // 5. Save cart
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart
        });

    } catch (error) {

        console.error("Add to cart error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getCart = async (req, res) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        const cart = await Cart.findOne({
            user: req.user._id
        }).populate("items.product");

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Cart is empty",
                cart: {
                    items: []
                }
            });
        }

        return res.status(200).json({
            success: true,
            cart
        });

    } catch (error) {

        console.error("Get cart error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};