import jwt from 'jsonwebtoken';

const generateAccessToken = (userId) =>{
    console.log(userId);

    return jwt.sign(
        {userId},
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "15m"
        }
    );
    
}

const generateRefreshToken = (userId) =>{
    return jwt.sign(
        {userId},
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
        }
    );
}

export{
    generateAccessToken, generateRefreshToken
}