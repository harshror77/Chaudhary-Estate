import { Router } from 'express';
import { toggleFavorite,getAllFavoritesofUser } from '../controllers/favorite.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router()

router.route("/:propertyId").post(verifyJWT,toggleFavorite)
router.route("/:userId").get(verifyJWT,getAllFavoritesofUser)

export default router
