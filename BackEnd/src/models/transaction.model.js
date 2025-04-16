import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema({
    property:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Property",
        required:true
    },
    buyer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    price:{
        type:Number,
        required:true,
    },
    paymentMethod: {
        type: String,
        enum: ['credit card', 'debit card', 'UPI', 'cash'],
        required: true
    },
    paymentStatus:{
        type:String,
        enum:['pending','successfull','failed'],
        default:"pending"
    },
    transactionDate: {
        type: Date,
        default: Date.now
    }
},{timestamps:true})

export const Transaction = mongoose.model("Transaction",transactionSchema)