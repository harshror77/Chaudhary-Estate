import { Router } from 'express';
import {deleteProperty, getAllProperties, getPropertyById, updateProperty, uploadProperty, toggleStatus, changePropertyStatus, getMyListings,filterProperties} from "../controllers/property.controller.js"
import { verifyJWT } from './../middlewares/auth.middleware.js';
import { upload } from './../middlewares/multer.middleware.js';

const router = Router()

router.route("/upload").post(
    verifyJWT, 
    upload.fields([ 
        {
            name:"images",
            maxCount: 10
        }
    ]),
    uploadProperty
)

router.route("/").get(verifyJWT,getAllProperties)
router.route("/my-listings").get(verifyJWT, getMyListings);
router.route("/delete/:propertyId").delete(verifyJWT,deleteProperty)
router.route("/:propertyId").put(verifyJWT,updateProperty)

router.route("/fetch/:propertyId").get(verifyJWT,getPropertyById)
router.route("/:propertyId/toggle-status").patch(verifyJWT,toggleStatus)
router.route("/:propertyId/change-status").put(verifyJWT,changePropertyStatus)

//filter property
router.route("/filterProperty").get(verifyJWT, filterProperties);


export default router
