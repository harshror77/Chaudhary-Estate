import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Property } from "../models/property.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { mongoose } from 'mongoose';

const uploadProperty = asyncHandler( async(req,res)=>{
    const {title, description, price, address, longitude, latitude, propertyType, features} = req.body
    console.log(req.body)
    console.log(req.user)
    const userId = req.user?._id
    if(!userId) throw new ApiError(402,"User not found")

    // if(
    //     [title,description ,location,propertyType].some((field)=> field?.trim()==="")
    // ){
    //     throw new ApiError(400,"all fields are required") 
    // }

    if(!price) throw new ApiError(401,"price is required")
    
    if(!address) throw new ApiError(402, "location is required")

    const imageFiles = req.files?.images || [];
    const secureUrls = [];

    for (const file of imageFiles) {
        //console.log(file)
        const uploadedImage = await uploadOnCloudinary(file.path);
       // console.log(uploadedImage)
        if (uploadedImage?.url) {
            secureUrls.push(uploadedImage.url);
        }
    }
    if (secureUrls.length === 0) {
        throw new ApiError(500, "Image upload failed");
    }

    const property = await Property.create({
        title,
        description,
        price,
        owner:userId,
        location: {
            latitude: latitude,
            longitude: longitude,
            address: address,
        },
        propertyType,
        features:features || "",
        images : secureUrls
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201,property,"Property uploaded successfully")
    )

})

const updateProperty = asyncHandler(async (req, res) => {
    const { title, description, price, location, features } = req.body;
    const { propertyId } = req.params;

    if (!propertyId) throw new ApiError(401, "Property not found");

    const property = await Property.findById(propertyId);
    if (!property) throw new ApiError(403, "Property not found");

    property.title = title || property.title;
    property.description = description || property.description;
    property.price = price || property.price;

    if (location) {
        property.location.latitude = location.latitude || property.location?.latitude || "";
        property.location.longitude = location.longitude || property.location?.longitude || "";
        property.location.address = location.address || property.location.address;
    }

    property.features = features || property.features;

    const updatedProperty = await property.save();

    if (!updatedProperty) throw new ApiError(404, "Property can not be updated");

    return res.status(200).json(
        new ApiResponse(200, updatedProperty, "Property updated successfully")
    );
});


const getPropertyById = asyncHandler( async(req,res)=>{
    console.log(req.params)
    const {propertyId} = req.params
    console.log("#####################################33",propertyId)
    if(!propertyId) throw new ApiError(400,"PropertyId not found")

        const property = await Property.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(propertyId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "property",
                    as: "reviews"
                }
            },
            {//look if property is included in favorite list of user
                $lookup: {
                    from: "favorites",
                    let: { userId: new mongoose.Types.ObjectId(req.user._id), propertyId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user", "$$userId"] },
                                        { $eq: ["$property", "$$propertyId"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "favorite"
                }
            },
            {
                $addFields: {
                    reviewCount: { $size: "$reviews" },
                    AverageRating: { $avg: "$reviews.rating" },
                    owner: { $first: "$owner" },
                    isFavorite: { $gt: [{ $size: "$favorite" }, 0] } // if greater tha 0 than true else false
                }
            }
        ]);
        

    if(!property || property.length===0) throw new ApiError(401,"Property not found")
    return res
    .status(200)
    .json(
        new ApiResponse(200,property,"Property fetched successfully")
    )
})

const getMyListings = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const properties = await Property.find({ owner: userId })
        .sort({ createdAt: -1 })
        .select("title price location status images isActive createdAt");

    if (!properties) {
        throw new ApiError(404, "No properties found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, properties, "Listings fetched successfully"));
});


const getAllProperties = asyncHandler(async (req, res) => {
    // Fetch all properties
    const properties = await Property.aggregate([
        // Lookup owner details
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        // Lookup reviews
        {
            $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "property",
                as: "reviews"
            }
        },
        // Add review count and average rating
        {
            $addFields: {
                reviewCount: { $size: "$reviews" },
                averageRating: { $avg: "$reviews.rating" },
                owner: { $first: "$owner" } // Unwind the owner array
            }
        },
        // Exclude sensitive owner information (optional)
        {
            $project: {
                "owner.password": 0,
                "owner.refreshToken": 0,
                "owner.createdAt": 0,
                "owner.updatedAt": 0
            }
        }
    ]);

    // Check if properties exist
    if (!properties || properties.length === 0) {
        throw new ApiError(404, "No properties found");
    }

    // Return response
    return res
        .status(200)
        .json(
            new ApiResponse(200, properties, "All properties fetched successfully")
        );
});

const deleteProperty = asyncHandler( async(req,res)=>{

    const {propertyId} = req.params
    console.log(propertyId)
    const property = await Property.findById(propertyId)
    if(!property) throw new ApiError(404,"property not found")
    // if(req.user?._id != property?.owner) throw new ApiError(404,"Access denied")

    if(property.images && property.images.length>0){
        for(const image of property.images){
            await deleteFromCloudinary(image.public_id)
        }
    }

    await Property.findByIdAndDelete(propertyId);

    return res
    .status(201)
    .json(
        new ApiResponse(201,{},"Property deleted successfully")
    )
})

const toggleStatus = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);

    if (!property) throw new ApiError(404, "Property not found");
    if (req.user?._id.toString() !== property.owner.toString()) {
        throw new ApiError(403, "Access denied");
    }

    // Define the status cycle
    const statusCycle = {
        'for sale': 'sold',
        'sold': 'for sale',
        'for rent': 'rented',
        'rented': 'for rent',
    };

    // Get the new status based on the current status
    const newStatus = statusCycle[property.status];

    if (!newStatus) {
        throw new ApiError(400, "Invalid property status");
    }

    // Update the status
    property.status = newStatus;
    await property.save();

    return res
        .status(200)
        .json(new ApiResponse(200, property, `Status updated to '${newStatus}'`));
});

const changePropertyStatus = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const { status } = req.body;

    const validStatuses = ['for sale', 'sold', 'for rent', 'rented'];

    if (!status || !validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }

    const property = await Property.findById(propertyId);

    if (!property) {
        throw new ApiError(404, "Property not found");
    }

    if (req.user?._id.toString() !== property.owner.toString()) {
        throw new ApiError(403, "Access denied");
    }

    // Update the status
    property.status = status;
    await property.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, property, `Property status updated to '${status}'`)
        );
});


export {
    uploadProperty,
    updateProperty,
    getPropertyById,
    getAllProperties,
    deleteProperty,
    toggleStatus,
    changePropertyStatus,
    getMyListings
}