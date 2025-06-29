import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"; 

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        minLength: [3, "Username must be at least 3 characters long"],
        maxLength: [40, "Username must be at most 20 characters long"],
    },
    password: {
        type: String,
        select: false, 
        minLength: [8, "Password must be at least 8 characters long"],
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    address: String,
    phone: {
        type: String,
        minLength: [10, "Phone number must be at least 10 digits"],
        maxLength: [10, "Phone number must be at most 10 digits"],
    },
    profileImage: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    paymentMethods: {
        bankTransfer: {
            bankAccountName: String,
            bankAccountNumber: String,
            bankName: String,
        },
        paypal: {
            paypalEmail: String,
        },
    },
    role: {
        type: String,
        enum: ["Auctioneer", "Bidder", "Super Admin"],
    },
    unpaidCommission: {
        type: Number,
        default: 0,
    },
    auctionsWon: {
        type: Number,
        default: 0,
    },
    wonAuctionsDetails: [
        {
            auctionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Auction'
            },
            title: String,
            finalBid: Number,
            wonAt: {
                type: Date,
                default: Date.now
            },
            image: {
                url: String
            },
            paymentStatus: {
                type: String,
                enum: ['Pending Payment', 'Paid', 'Delivered', 'Cancelled'],
                default: 'Pending Payment'
            }
        }
    ],
    moneySpent: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    averageRating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    resetPasswordToken: String, 
    resetPasswordExpire: Date, 
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_TIME,
    });
};

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken; 
};

export const User = mongoose.model("User", userSchema);
