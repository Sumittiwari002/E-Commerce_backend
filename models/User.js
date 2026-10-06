import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true, // Removes accidental white spaces from the start/end
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
      // Regex ensuring name contains only alphabets and spaces
      match: [/^[a-zA-Z\s]+$/, 'Name can only contain alphabets and spaces']
    },

    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      // Validates international formats (e.g., +1234567890, +919876543210, 09876543210)
      match: [/^\+?[1-9]\d{1,14}$|^0\d{9,13}$/, 'Please provide a valid mobile number']
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // Prevents duplicate email registration
      lowercase: true, // Automatically converts email to lowercase before saving
      trim: true,
      // Standard RFC 5322 compliant regex validator for email
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 8 characters long']
      // Custom validator to ensure a strong password
      
    },
    status: {
        type: Number,
        default: 0
    }
  }
 
);

userSchema.pre("save", async function (next) {
    //Password hasn't changed
    if(!this.isModified("password"))
    {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("users", userSchema);

export default User;

