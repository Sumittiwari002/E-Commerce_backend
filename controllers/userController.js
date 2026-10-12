import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const getProfile = async (req, res)=>{
    res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        data: {
            user: req.user
        }
    });
};

export const passwordUpdate = async (req, res)=>{
    res.send("password update");
    try{
        console.log(req.body);

        let { cpassword, npassword, cnpassword} = req.body;

        if(!cpassword || !npassword || !cnpassword){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        // return;

        if(cpassword == npassword){
            return res.status(400).json({
                success: false,
                message: "current and new password must be different",
            });
        }

        if(npassword != cnpassword){
            return res.status(400).json({
                success: false,
                message: "new password and confirm new must be same",
            });
        }
        // console.log(req.user);

        const userInfo = await User.findOne({email: req.user.email});
        console.log("User found:", userInfo);

        let passwordCheck = await bcrypt.compare(cpassword, userInfo.password);

        if(!passwordCheck){
            return res.status(401).json({
                success: false,
                message: "Invalid Current Password",
            });
        }

        const salt = await bcrypt.genSalt(10);
        let newPassHash = await bcrypt.hash(npassword, salt);

        // console.log(newPassHash);

        await User.findByIdAndUpdate(req.user._id, {password: newPassHash});

        return res.status(200).json({
                success: true,
                message: "Password Updated successfully",
            });
        
    }
    catch(error){
        console.error("Update Error:", error);

        return res.status(500).json({
                success: false,
                message: error.message,
            });
    }
};


export const authToken = async (req, res)=>{
    try{
        const authHeader = req.headers.authorization;
        console.log(authHeader);

        //Bearer a8dardf4dfl5l6l7ll53hg43g43k45k6
        // return;

        if(!authHeader){
            return res.status(401).json({
                success:false,
                message: "Authorization header is missing"
            });
        }
        
        if(!authHeader.startsWith("Bearer")){
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });
        }
        const token = authHeader.split(" ")[1];
        console.log(token);

        if(!token){
            return res.status(401).json({
                success: false,
                message: "Access token is missing"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // console.log(decoded);

        const user = await User.findById(decoded.userId).select("-password");
        // console.log(user);

        if(!user){
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            });
        }

        req.user = user;
        console.log(req.user);
        return res.status(200).json({
            success: false,
            message: "Valid User"
        });
        


        
    }
    catch(error){
        console.log(error.name);

        if(error.name === "TokenExpiredError"){
            return res.status(401).json({
                success: false,
                message: "Access token has expired"
            });
        }

        if(error.name === "JsonWebTokenError"){
            return res.status(401).json({
                success: false,
                message: "Invalid access token"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
        
    }
}