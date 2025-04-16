import { Favorite } from "../models/favorite.model.js";
import { Property } from "../models/property.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleFavorite = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;

    if (!propertyId) {
        throw new ApiError(400, "Property ID is required");
    }

    const property = await Property.findById(propertyId);
    if (!property) {
        throw new ApiError(404, "Property not found");
    }

    const existingFavorite = await Favorite.findOne({
        user: req.user._id,
        property: propertyId,
    });

    let isFavorited;
    let obj;
    if (existingFavorite) {
        await Favorite.findByIdAndDelete(existingFavorite._id);
        isFavorited = false;
    } else {
        obj = await Favorite.create({
            user: req.user._id,
            property: propertyId,
            isFavorited:true
        });
        isFavorited = true;
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            obj 
        )
    );
});

const getAllFavoritesofUser = asyncHandler(async (req, res) => {
    const { userId, page = 1, limit = 20 } = req.params;

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const skip = (page - 1) * limit;

    const favorites = await Favorite.find({ user: userId })
        .populate('property')
        .skip(skip)
        .limit(limit);
    console.log(favorites)
    if (!favorites || favorites.length === 0) {
        throw new ApiError(404, "No favorites found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, favorites, "Favorites fetched successfully"));
});


export {
    toggleFavorite,
    getAllFavoritesofUser,
};