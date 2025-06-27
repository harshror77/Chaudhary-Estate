import mongoose from "mongoose";
import bcrypt from "bcrypt"
import  jwt  from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:[true,"name is required"],
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true, 
        lowerCase:true,
        trim:true
    },
    password:{
        type:String,
        //required:[true,'Password is required']
    },
    
    phone:{
        type:Number,
        //required:true,   
    },
    avatar:{
        type:String,
    },
    address:{
        street:{type:String,trim:true},
        city:{type:String,trim:true,required:false},
        state:{type:String,trim:true},
        postalCode:{type:Number,required:false},
    },
    isActive:{
        type:Boolean,
        default:true
    },
    lastLogin:{
        type:Date,
    },
    refreshToken:{
        type:String
    }
},{timestamps:true})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.hasPermission = function (permission) {
    return this.permissions.includes(permission);
};

userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullname: this.fullname,
            phone:this.phone 
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema);