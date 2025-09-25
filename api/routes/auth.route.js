import express from "express";
import { 
  register, 
  login, 
  logout, 
  verifyEmail, 
  verifyPhone, 
  resendOTP, 
  googleAuth 
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/verify-phone", verifyPhone);
router.post("/resend-otp", resendOTP);
router.post("/google", googleAuth);
router.post("/google-register", googleAuth);

export default router;
