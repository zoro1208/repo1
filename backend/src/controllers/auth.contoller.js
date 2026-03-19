
import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js';
import bcrypt from "bcryptjs";
import cloudinary from '../lib/cloudinary.js';
import { sendEmail } from "../lib/sendemail.js";

const otpStore = new Map();
const verifiedEmails = new Map();

//is valid email
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
// ================= SEND OTP =================
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    });

    await sendEmail(email, "OTP Code", `Your OTP is ${otp}`);

    res.json({ message: "OTP sent" });

  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = otpStore.get(email);

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (record.expires < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    otpStore.delete(email);
    verifiedEmails.set(email, true);

    res.json({ message: "Email verified" });

  } catch (error) {
      console.log("Signup error :", error.message);
    res.status(500).json({ message: "Verification failed" });
  }
};

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // ❌ block if not verified
    if (!verifiedEmails.get(email)) {
      return res.status(400).json({
        message: "Please verify OTP first",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    verifiedEmails.delete(email); // cleanup

    generateToken(newUser._id, res);

    res.status(201).json(newUser);

  } catch (error) {
    res.status(500).json({ message: "Signup failed" });
  }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        });


    } catch (error) {
        console.log("Login error :", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {
            maxAge: 0,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development"
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateprofile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );

        res.status(200).json(updatedUser);

    } catch (error) {
        console.error("Update Profile error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.error("Check Auth controller error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};