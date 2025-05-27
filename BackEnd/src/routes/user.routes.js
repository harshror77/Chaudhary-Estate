import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
  updatePassword,
  updateUser,
  updateUserAvatar,
  getCurrentUser,
  googleLogin,
  updateProfile,
} from "../controllers/user.controller.js";
import { upload } from "./../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/getCurrentUser").get(verifyJWT, getCurrentUser);
router.route("/login").post(loginUser);
router.route("/login/send-otp").post(loginUser);
router.route("/login/verify-otp").post(loginUser);
router.route("/update").put(verifyJWT, updateUser);
router.route("/update/verify-otp").post(verifyJWT, updateUser);
router.route("/updatePassword").put(verifyJWT, updatePassword);
router.route("/avatar").put(
  verifyJWT,
  upload.single("avatar"), // Ensure this middleware is applied
  updateUserAvatar
);
router.route("/getAllUsers").get(getAllUsers);
router.route("/logout").delete(logoutUser);//dont verify while logging out
router.route("/profile").get(verifyJWT, getProfile);
router.route("/delete").delete(verifyJWT, deleteUser);
router.route("/google-login").post(googleLogin);
router.route("/update-profile").patch(verifyJWT,upload.single("avatar"), updateProfile);

export default router;
