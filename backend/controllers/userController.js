import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import {v2 as cloudinary} from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

export const register = catchAsyncErrors(async(req, res, next) => {
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Profile image is required", 400));
    }

    const { profileImage } = req.files;

    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(profileImage.mimetype)){
        return next(new ErrorHandler("File format not supported.", 400));
    }

    const {
        userName,
        email,
        password,
        phone,
        address,
        role,
        bankAccountNumber,
        bankAccountName,
        bankName,
        paypalEmail,
    } = req.body;

    if (!userName || !email || !password || !phone || !address || !role){
        return next(new ErrorHandler("All fields are required.", 400));
    }

    if (role === "Auctioneer"){
        if (!bankAccountNumber || !bankAccountName || !bankName){
            return next(new ErrorHandler("Please provide your full bank details.", 400));
        }
        if (!paypalEmail){
            return next(new ErrorHandler("Please provide your PayPal email address.", 400));
        }
    }

    const isRegistered = await User.findOne({ email});
    if (isRegistered){
        return next(new ErrorHandler("User already exists.", 400));
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(
        profileImage.tempFilePath,
        {
            folder: "Auction_Platform_Users",
        }
    );

    if  ( !cloudinaryResponse || cloudinaryResponse.error) {
        console.error(
            "Cloudinary error: ",
            cloudinaryResponse.error || "Unknown cloudinary error"
        );
        return next(new ErrorHandler("Failed to upload profile image to cloudinary", 500)
    );
    }

    const user = await User.create({
        userName,
        email,
        password,
        phone,
        address,
        role,
        profileImage: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
        paymentMethods: {
            bankTransfer: {
                bankAccountNumber,
                bankAccountName,
                bankName,
            },
            paypal: {
                paypalEmail,
            },
        },
    
    });
    generateToken(user, "User registered successfully", 201, res);
});

export const login = catchAsyncErrors(async(req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password."));              
    }
    const user = await User.findOne({email}).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid email or password.", 400));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password.", 400));
    }
    generateToken(user, "User logged in successfully", 200, res);
});

export const getProfile = catchAsyncErrors(async(req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});

export const logout = catchAsyncErrors(async(req, res, next) => {
    res
    .status(200)
    .cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
    })
    .json({
        success: true,
        message: "Logout successfully",
    });
});

export const fetchLeaderboard = catchAsyncErrors(async(req, res, next) => {
    const users = await User.find({ moneySpent: { $gt: 0 }});
    const leaderboard = users.sort((a, b) => b.moneySpent - a.moneySpent);
    res.status(200).json({
        success: true,
        leaderboard,
    });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    console.log("Forgot password request received for email:", req.body.email);
    const { email } = req.body;

    if (!email) {
        return next(new ErrorHandler("Please provide an email address.", 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new ErrorHandler("User not found with this email.", 404));
    }

    // Genereaza un token de resetare
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token-ul si setare in baza de date
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Token valabil 10 minute
    await user.save({ validateBeforeSave: false });

    // Creeaza link-ul de resetare
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            message,
        });

        res.status(200).json({
            success: true,
            message: "Reset link sent to your email.",
        });
    } catch (error) {
        console.error("Error sending email:", error); 
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler("Email could not be sent. Please try again later.", 500));
    }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    console.log("Token:", req.params.token);
    console.log("Password:", req.body.password);
    
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        return next(new ErrorHandler("Please provide a new password.", 400));
    }

    // Hash token-ul si cautarea utilizatorului
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }, 
    });

    if (!user) {
        return next(new ErrorHandler("Invalid or expired reset token.", 400));
    }

    // Actualizeaza parola
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password updated successfully.",
    });
});