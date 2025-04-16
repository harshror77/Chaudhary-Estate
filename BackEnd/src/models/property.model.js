import mongoose from "mongoose";
import  mongooseAggregatePaginate  from 'mongoose-aggregate-paginate-v2';

const propertySchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        trim:true
    },
    price:{
        type:Number,
        required:true,
        default:0,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    isAvailable:{
        type:Boolean,
        default:true
    },
    images:[
        {
            type:String,
            required:true
        }
    ],
    location:{
        latitude:{type:Number},
        longitude:{type:Number},
        address:{type:String,required:true}
    },
    propertyType:{
        type:String,
        enum:['house','apartment','land','commercial'],
        required:true
    },
    status: {
        type: String,
        enum: ['for sale', 'for rent', 'sold', 'rented'],
        default: 'for sale'
    },
    features: {
        bedrooms: { type: Number, default: 0 },
        bathrooms: { type: Number, default: 0 },
        squareFeet: { type: Number, default: 0 },
        hasGarage: { type: Boolean, default: false },
        hasGarden: { type: Boolean, default: false },
        hasPool: { type: Boolean, default: false }
    },
    listedDate:{
        type:Date,
        default:Date.now
    },
    reviews: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            comment: { type: String, trim: true },
            rating: { type: Number, min: 1, max: 5 }
        }
    ]
},{timestamps:true})

propertySchema.plugin(mongooseAggregatePaginate)

export const Property = mongoose.model("Property",propertySchema)