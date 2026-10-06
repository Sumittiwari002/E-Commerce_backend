import Category from "../models/Category.js";

export const categoryAction = async (req, res) => {

    try{
        const {name} = req.body;

        if(!name )
        {
            return res.status(400).json({
                    success: false,
                    message: "Category Name required"
            });

        }

        const categoryName = await Category.findOne({name});
        if (categoryName) {
            return res.status(409).json({
                success: false,
                message: "category already Exists",
        });
        }

        await Category.create({
            name
        });

        res.status(201).json({
            success: true,
            message: "Category Added successfully"
        });
        
    }
    catch(error){
        console.error("Category Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
    //  console.log(req.user);

    // res.status(200).json({
    //     success: true,
    //     message: "Brand Added"
    // });

}

export const getAllcategories = async (req, res) =>{
    try{
        let values = await Category.find();

            res.status(200).json({
            success: true,
            message: "Category Fetched successfully",
            dataSet: values
        });
    }
    catch(error){
        console.error("Cetegory Fetch Error", error);

            res.status(500).json({
            success: false,
            message: error.message
        });
    }
}