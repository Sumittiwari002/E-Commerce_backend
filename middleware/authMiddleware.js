import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res , next)=>{
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

        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET
        );

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
        

        // 7. Continue to controller
        next();
        
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

export default authMiddleware;