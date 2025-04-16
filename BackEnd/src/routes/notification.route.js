import { Router } from 'express';
import {
    createNotification,
    getAllNotifications,
    deleteNotification,
    markAsRead
} from "../controllers/notification.controller.js";
import { verifyJWT } from './../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(createNotification)
    .get(getAllNotifications);

router.route("/:notificationId")
    .delete(deleteNotification)
    .put(markAsRead);

export default router;