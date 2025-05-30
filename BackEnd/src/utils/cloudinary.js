import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import  dotenv  from 'dotenv';

dotenv.config({
    path:'./.env'
})

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
})



const uploadOnCloudinary = async (localfilepath)=>{
    try {
        if(!localfilepath) return null;
        console.log(localfilepath)
        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        fs.unlinkSync(localfilepath);
        return response;
    } catch (error) {
        console.log(error)
        fs.unlinkSync(localfilepath);
        return null;
    }
}

const deleteFromCloudinary = async (url)=>{
    try {
        if(!url) return;

        const publicId = url.split('/').pop().split('.')[0]
        if(!publicId) return

        const response = await cloudinary.uploader.destroy(publicId,{
            resource_type:"auto"
        })
    } catch (error) {
        console.log("error occured while deleting from cloudinary")
    }
}

export {
    uploadOnCloudinary,
    deleteFromCloudinary
}