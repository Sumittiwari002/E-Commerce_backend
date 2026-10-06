import Brand from "../models/Brand.js";

export const brandAction = async (req, res) => {

    try{
        const {name} = req.body;

        if(!name )
        {
            return res.status(400).json({
                    success: false,
                    message: "Brand Name required"
            });

        }

        const brandName = await Brand.findOne({name});
        if (brandName) {
            return res.status(409).json({
                success: false,
                message: "Brand already Exists",
        });
        }

        await Brand.create({
            name
        });

        res.status(201).json({
            success: true,
            message: "Brand Added successfully"
        });
        
    }
    catch(error){
        console.error("Brand Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
    //  console.log(req.user);
}

export const getAllBrands = async (req, res) =>{
    try{
        let values = await Brand.find();

            res.status(200).json({
            success: true,
            message: "Brand Fetched successfully",
            dataSet: values
        });
    }
    catch(error){
        console.error("Brand Fetch Error", error);

            res.status(500).json({
            success: false,
            message: error.message
        });
    }
}