import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters long'],
      maxlength: [50, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },

    discount: {
      type: Number,
      required: [true, 'Discount is required'],
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long']
    },

    path: {
      type: String,
      trim: true
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'brands',
      required: [true, 'Brand ID is required']
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'categories',
      required: [true, 'CategoryId is required']
    }
  }
);

const Product = mongoose.model('products', ProductSchema);

export default Product;