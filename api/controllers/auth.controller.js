import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOTP, sendEmailOTP, sendSmsOTP, verifyOTP } from "../utils/otpUtils.js";

export const register = async (req, res, next) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { username: req.body.username },
        { email: req.body.email }
      ]
    }).lean();

    if (existingUser) {
      if (existingUser.username === req.body.username) {
        return next(createError(400, "Username already exists"));
      }
      if (existingUser.email === req.body.email) {
        return next(createError(400, "Email already exists"));
      }
    }

    // Create hash for password
    const hash = bcrypt.hashSync(req.body.password, 5);
    
    // Generate OTP for email verification
    const emailOtp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes
    
    // Create new user with OTP
    const newUser = new User({
      ...req.body,
      password: hash,
      emailOtp,
      otpExpiry,
      authProvider: 'local'
    });

    // Save user to database
    await newUser.save();

    // Send OTP to user's email asynchronously (do not block response)
    Promise.resolve().then(() => {
      sendEmailOTP(req.body.email, emailOtp).catch((err) => {
        console.error('Error sending email OTP:', err);
      });
    });
    
    // If phone number is provided, send OTP to phone as well (async)
    if (req.body.phone) {
      const phoneOtp = generateOTP();
      await User.findByIdAndUpdate(newUser._id, { phoneOtp });
      Promise.resolve().then(() => {
        sendSmsOTP(req.body.phone, phoneOtp).catch((err) => {
          console.error('Error sending SMS OTP:', err);
        });
      });
    }

    res.status(201).json({ 
      message: "User has been created. Please verify your email.",
      userId: newUser._id
    });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    
    if (!userId || !otp) {
      return next(createError(400, "User ID and OTP are required"));
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }
    
    // Verify OTP
    const verification = verifyOTP(user.emailOtp, otp, user.otpExpiry);
    
    if (!verification.valid) {
      return next(createError(400, verification.message));
    }
    
    // Mark email as verified and clear OTP
    await User.findByIdAndUpdate(userId, {
      isEmailVerified: true,
      emailOtp: null,
      otpExpiry: null
    });
    
    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
};

export const verifyPhone = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    
    if (!userId || !otp) {
      return next(createError(400, "User ID and OTP are required"));
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }
    
    // Verify OTP
    const verification = verifyOTP(user.phoneOtp, otp, user.otpExpiry);
    
    if (!verification.valid) {
      return next(createError(400, verification.message));
    }
    
    // Mark phone as verified and clear OTP
    await User.findByIdAndUpdate(userId, {
      isPhoneVerified: true,
      phoneOtp: null
    });
    
    res.status(200).json({ message: "Phone number verified successfully" });
  } catch (err) {
    next(err);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    const { userId, type } = req.body; // type can be 'email' or 'phone'
    
    if (!userId || !type) {
      return next(createError(400, "User ID and type are required"));
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }
    
    // Generate new OTP and set expiry
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
    
    if (type === 'email') {
      // Update user with new email OTP
      await User.findByIdAndUpdate(userId, { emailOtp: otp, otpExpiry });
      
      // Send OTP to email
      await sendEmailOTP(user.email, otp);
      
      res.status(200).json({ message: "OTP sent to your email" });
    } else if (type === 'phone') {
      if (!user.phone) {
        return next(createError(400, "No phone number associated with this account"));
      }
      
      // Update user with new phone OTP
      await User.findByIdAndUpdate(userId, { phoneOtp: otp, otpExpiry });
      
      // Send OTP to phone
      await sendSmsOTP(user.phone, otp);
      
      res.status(200).json({ message: "OTP sent to your phone" });
    } else {
      return next(createError(400, "Invalid type. Must be 'email' or 'phone'"));
    }
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) return next(createError(404, "User not found!"));

    // Check if user is using local authentication
    if (user.authProvider !== 'local') {
      return next(createError(400, `Please login with ${user.authProvider}`));
    }

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect)
      return next(createError(400, "Wrong password or username!"));

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Generate new OTP for verification
      const emailOtp = generateOTP();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
      
      await User.findByIdAndUpdate(user._id, { emailOtp, otpExpiry });

      // Send email OTP asynchronously to avoid blocking login response
      Promise.resolve().then(() => {
        sendEmailOTP(user.email, emailOtp).catch((err) => {
          console.error('Error sending email OTP:', err);
        });
      });
      
      return res.status(403).json({
        message: "Email not verified. A new verification code has been sent to your email.",
        userId: user._id,
        requiresVerification: true
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        isSeller: user.isSeller,
      },
      process.env.JWT_KEY
    );

    const { password, emailOtp, phoneOtp, otpExpiry, ...info } = user._doc;
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .send({ ...info, accessToken: token });

  } catch (err) {
    next(err);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const { googleId, email, name, img } = req.body;
    
    if (!googleId || !email) {
      return next(createError(400, "Google ID and email are required"));
    }
    
    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { googleId },
        { email }
      ]
    });
    
    if (user) {
      // User exists, update Google ID if needed
      if (!user.googleId) {
        user = await User.findByIdAndUpdate(
          user._id,
          { 
            googleId,
            authProvider: 'google',
            isEmailVerified: true,
            img: user.img || img
          },
          { new: true }
        );
      }
    } else {
      // Create new user
      const username = email.split('@')[0] + '_' + Math.floor(1000 + Math.random() * 9000);
      
      user = new User({
        username,
        email,
        googleId,
        img,
        country: req.body.country || "Not specified",
        authProvider: 'google',
        isEmailVerified: true
      });
      
      await user.save();
    }
    
    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        isSeller: user.isSeller,
      },
      process.env.JWT_KEY
    );
    
    const { password, emailOtp, phoneOtp, otpExpiry, ...info } = user._doc;
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .send({ ...info, accessToken: token });
      
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .send("User has been logged out.");
};
