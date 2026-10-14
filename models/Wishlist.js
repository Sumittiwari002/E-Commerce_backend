import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products",
                    required: true
                },

                quantity: {
                    type: Number,
                    default: 1
                }
            }
        ]
    }
);

export default mongoose.model("WishList", wishlistSchema);