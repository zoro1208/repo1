import express from 'express';
import { checkAuth, login, logout, signup, updateprofile,verifyOtp,sendOtp } from '../controllers/auth.contoller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateprofile);
router.get("/check", protectRoute, checkAuth);

export default router;



