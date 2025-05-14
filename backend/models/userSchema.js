import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // Adăugat pentru getResetPasswordToken

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        minLength: [3, "Username must be at least 3 characters long"],
        maxLength: [40, "Username must be at most 20 characters long"],
    },
    password: {
        type: String,
        select: false, // Ascunde parola în interogarile implicite
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
    // Adaugă acest nou câmp pentru a stoca licitațiile câștigate
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
    resetPasswordToken: String, // Token pentru resetarea parolei
    resetPasswordExpire: Date,  // Data de expirare a token-ului
});

// Hash-uieste parola inainte de salvare
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// Compara parola introdusa cu parola hash-uita
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Genereaza un token JWT pentru autentificare
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_TIME,
    });
};

// Genereaza un token pentru resetarea parolei
userSchema.methods.getResetPasswordToken = function () {
    // Generează un token unic
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash-uiește token-ul și îl salvează în baza de date
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Setează data de expirare a token-ului (10 minute)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken; // Returnează token-ul ne-hash-uit pentru a fi trimis utilizatorului
};

export const User = mongoose.model("User", userSchema);
