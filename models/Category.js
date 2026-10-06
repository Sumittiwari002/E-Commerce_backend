import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true, // Removes accidental white spaces from the start/end
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters']
        }
    }
 
);




const Category = mongoose.model("categories", CategorySchema);

export default Category;

