const adminMiddleware = (req, res, next) => {

    const userStatus = req.user.status;

    console.log("userStatus:", userStatus);
    // console.log("type:", typeof userStatus);

    if (userStatus !== 1) {
        return res.status(403).json({
            success: false,
            message: "Only Admin Allowed"
        });
    }

    next();
};

export default adminMiddleware;