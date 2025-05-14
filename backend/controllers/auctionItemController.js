import { Auction } from "../models/auctionSchema.js";
import { User } from "../models/userSchema.js";
import { Bid } from "../models/bidSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { auctionService } from "../server.js";

export const addNewAuctionItem = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Auction item image is required", 400));
    }

    const { image } = req.files;

    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(image.mimetype)) {
        return next(new ErrorHandler("File format not supported.", 400));
    }

    const {
        title,
        description,
        category,
        condition,
        startingBid,
        startTime,
        endTime,
        buyNowPrice, // Adaugă aceasta pentru a prelua valoarea
    } = req.body;

    if (!title || !description || !category || !condition || !startingBid || !startTime || !endTime) {
        return next(new ErrorHandler("All fields are required.", 400));
    }

    if (new Date(startTime) < Date.now()) {
        return next(new ErrorHandler("Auction starting time must be greater than present time.", 400));
    }

    if (new Date(startTime) >= new Date(endTime)) {
        return next(new ErrorHandler("Auction starting time must be less than ending time", 400));
    }

    // Verifică dacă buyNowPrice (dacă există) este mai mare decât startingBid
    if (buyNowPrice && parseFloat(buyNowPrice) <= parseFloat(startingBid)) {
        return next(new ErrorHandler("Buy Now price must be greater than Starting Bid", 400));
    }

    try {
        const cloudinaryResponse = await cloudinary.uploader.upload(
            image.tempFilePath,
            {
                folder: "Auction_Platform_Auction_Items",
            }
        );

        if (!cloudinaryResponse || cloudinaryResponse.error) {
            console.error(
                "Cloudinary error: ",
                cloudinaryResponse.error || "Unknown cloudinary error"
            );
            return next(new ErrorHandler("Failed to upload auction image to cloudinary.", 500));
        }

        const auctionItem = await Auction.create({
            title,
            description,
            category,
            condition,
            startingBid,
            startTime,
            endTime,
            buyNowPrice: buyNowPrice || null, // Adaugă această linie
            image: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            },
            createdBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: `Auction item created and will be listed on auction page at ${startTime}`,
            auctionItem,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message || "Failed to create auction item.", 500));
    }
});

export const getAllItems = catchAsyncErrors(async (req, res, next) => {
    let items = await Auction.find({});
    res.status(200).json({
        success: true,
        items,
    });
});

export const getAuctionDetails = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid Id format", 400));
    }
    const auctionItem = await Auction.findById(id);
    if (!auctionItem) {
        return next(new ErrorHandler("Auction item not found", 404));
    }
    const bidders = auctionItem.bids.sort((a, b) => b.amount - a.amount);

//si aici

const now = new Date();
    const startTime = new Date(auctionItem.startTime);
    const endTime = new Date(auctionItem.endTime);

    if (now >= startTime && now <= endTime) {
        auctionService.startAuctionTimer(auctionItem._id.toString());
    }

//de aici

    res.status(200).json({
        success: true,
        auctionItem,
        bidders,
    });
});

export const getMyAuctionItems = catchAsyncErrors(async (req, res, next) => {
    const items = await Auction.find({ createdBy: req.user._id });
    res.status(200).json({
        success: true,
        items,
    });
});

export const removeFromAuction = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid Id format", 400));
    }
    const auctionItem = await Auction.findById(id);
    if (!auctionItem) {
        return next(new ErrorHandler("Auction item not found", 404));
    }
    await auctionItem.deleteOne();
    res.status(200).json({
        success: true,
        message: "Auction item deleted successfully",
    });
});

export const republishItem = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid Id format", 400));
    }
    let auctionItem = await Auction.findById(id);
    if (!auctionItem) {
        return next(new ErrorHandler("Auction item not found", 404));
    }
    if (!req.body.startTime || !req.body.endTime) {
        return next(new ErrorHandler("StartTime and EndTime for republish is mandatory.")
        );
    }
    if (new Date(auctionItem.endTime) > Date.now()) {
        return next(
            new ErrorHandler(
                "Auction is already active, cannot republish",
                400
            )
        );
    }
    let data = {
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
    };
    if (data.startTime < Date.now()) {
        return next(
            new ErrorHandler(
                "Auction starting time must be greater than present time.",
                400
            )
        );
    }
    if (data.startTime >= data.endTime) {
        return next(
            new ErrorHandler(
                "Auction starting time must be less than present time.",
                400
            )
        );
    }

    if (auctionItem.highestBidder) {
        const highestBidder = await User.findById(auctionItem.highestBidder);
        highestBidder.moneySpent -= auctionItem.currentBid;
        highestBidder.auctionsWon -= 1;
        highestBidder.save();
    }

    data.bids = [];
    data.commissionCalculated = false;
    data.currentBid = 0;
    data.highestBidder = null;
    auctionItem = await Auction.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    await Bid.deleteMany({ auctionItem: auctionItem._id })
    const createdBy = await User.findByIdAndUpdate(
        req.user._id,
        { unpaidCommission: 0 },
        {
            new: true,
            runValidators: false,
            useFindAndModify: false,
        }
    );
    res.status(200).json({
        success: true,
        auctionItem,
        message: `Auction republished and will be active on ${req.body.startTime}`,
        createdBy
    });
});

export const finalizeAuction = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const auction = await Auction.findById(id);

    if (!auction) {
        return next(new ErrorHandler("Auction not found", 404));
    }

    if (new Date(auction.endTime) > Date.now()) {
        return next(new ErrorHandler("Auction has not ended yet", 400));
    }

    if (!auction.highestBidder) {
        return next(new ErrorHandler("No bids were placed on this auction", 400));
    }

    // Calculăm comisionul de 5%
    const commission = auction.currentBid * 0.05;

    // Actualizăm comisionul neplătit al vânzătorului
    const seller = await User.findById(auction.createdBy);
    seller.unpaidCommission = (seller.unpaidCommission || 0) + commission;
    await seller.save();

    res.status(200).json({
        success: true,
        message: "Auction finalized and commission calculated",
        commission,
    });
});

export const getUnpaidCommission = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    console.log("Unpaid commission for user:", {
        userId: user._id,
        unpaidCommission: user.unpaidCommission || 0
    });

    res.status(200).json({
        success: true,
        unpaidCommission: user.unpaidCommission || 0
    });
});

export const getWonAuctions = catchAsyncErrors(async (req, res, next) => {
    // Verifica daca utilizatorul este logat
    if (!req.user || !req.user._id) {
        return next(new ErrorHandler("User not authenticated", 401));
    }

    // Verificam daca utilizatorul este un Bidder
    if (req.user.role !== "Bidder") {
        return next(new ErrorHandler("Only bidders can access won auctions", 403));
    }

    try {
        // Obtine utilizatorul cu datele despre licitatiile castigate
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }
        
        res.status(200).json({
            success: true,
            wonAuctions: user.wonAuctionsDetails || []
        });
    } catch (error) {
        return next(new ErrorHandler(error.message || "Failed to fetch won auctions", 500));
    }
});