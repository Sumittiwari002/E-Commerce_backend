import User from "../models/User.js";

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