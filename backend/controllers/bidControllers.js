import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Auction } from "../models/auctionSchema.js";
import { Bid } from "../models/bidSchema.js";
import { User } from "../models/userSchema.js";
import { io } from "../server.js";

export const placeBid = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params; // Extragem id-ul articolului de licitație
    const auctionItem = await Auction.findById(id);
    if (!auctionItem) {
        return next(new ErrorHandler("Auction Item not found", 404));
    }

    // Verificăm dacă utilizatorul este creatorul licitației
    if (auctionItem.createdBy.toString() === req.user._id.toString()) {
        return next(new ErrorHandler("You cannot place a bid on your own auction.", 403));
    }

    const { amount } = req.body;
    if (!amount) {
        return next(new ErrorHandler("Please place your bid", 404));
    }
    if (amount <= auctionItem.currentBid) {
        return next(new ErrorHandler("Bid amount must be greater than current bid", 404));
    }
    if (amount < auctionItem.startingBid) {
        return next(new ErrorHandler("Bid amount must be greater than starting bid", 404));
    }

    try {
        const existingBid = await Bid.findOne({
            "bidder.id": req.user._id,
            auctionItem: auctionItem._id,
        });
        const existingBidInAuction = auctionItem.bids.find(
            (bid) => bid.userId.toString() == req.user._id.toString()
        );
        if (existingBid && existingBidInAuction) {
            existingBidInAuction.amount = amount;
            existingBid.amount = amount;
            auctionItem.markModified('bids'); // Marchează array-ul bids ca fiind modificat
            await auctionItem.save(); // Salvează documentul părinte
            await existingBid.save(); // Acesta e OK pentru că e document principal
            auctionItem.currentBid = amount;
        } else {
            const bidderDetail = await User.findById(req.user._id);
            const bid = await Bid.create({
                amount,
                bidder: {
                    id: bidderDetail._id,
                    userName: bidderDetail.userName,
                    profileImage: bidderDetail.profileImage?.url,
                },
                auctionItem: auctionItem._id,
            });
            auctionItem.bids.push({
                userId: req.user._id,
                userName: bidderDetail.userName,
                profileImage: bidderDetail.profileImage?.url,
                amount,
            });
            auctionItem.currentBid = amount;
        }
        await auctionItem.save();

        // Sortăm toate ofertele pentru a obține bidders în ordine descrescătoare
        const sortedBids = await Bid.find({ auctionItem: auctionItem._id })
            .sort({ amount: -1 })
            .populate('bidder.id', 'userName profileImage');

        // Emitem eveniment socket.io pentru actualizare în timp real
        io.to(`auction:${id}`).emit("bidUpdate", {
            auctionId: id,
            currentBid: amount,
            bidderName: req.user.userName,
            bidAmount: amount,
            bidders: sortedBids,
            auction: auctionItem
        });

        res.status(201).json({
            success: true,
            message: "Bid placed",
            currentBid: auctionItem.currentBid,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message || "Failed to place bid", 500));
    }
});

export const buyNowAuction = catchAsyncErrors(async (req, res, next) => {
    const { auctionId } = req.params;
    const userId = req.user._id;

    console.log("Buy Now request received for auction:", auctionId);

    // Verifica daca licitatia exista si este activa
    const auction = await Auction.findById(auctionId);
    if (!auction) {
        return next(new ErrorHandler("Auction not found", 404));
    }

    // Verifica daca utilizatorul este creatorul licitatiei
    if (auction.createdBy.toString() === userId.toString()) {
        return next(new ErrorHandler("You cannot buy your own auction.", 403));
    }

    // Verifică dacă licitația este activă
    const now = new Date();
    if (now < new Date(auction.startTime) || now > new Date(auction.endTime)) {
        return next(new ErrorHandler("Auction is not active", 400));
    }

    // Verifică dacă există un preț "Buy Now"
    if (!auction.buyNowPrice) {
        return next(new ErrorHandler("This auction doesn't have a Buy Now option", 400));
    }

    // Verifică dacă prețul curent nu depășește deja prețul Buy Now
    if (auction.currentBid >= auction.buyNowPrice) {
        return next(new ErrorHandler("Current bid already exceeds Buy Now price", 400));
    }

    // Adaugă o nouă ofertă pentru Buy Now
    const bidderDetail = await User.findById(userId);

    const newBid = {
        userId: userId,
        userName: bidderDetail.userName,
        profileImage: bidderDetail.profileImage?.url,
        amount: auction.buyNowPrice
    };

    // Creează și o intrare în colecția Bid pentru consistență
    await Bid.create({
        amount: auction.buyNowPrice,
        bidder: {
            id: bidderDetail._id,
            userName: bidderDetail.userName,
            profileImage: bidderDetail.profileImage?.url,
        },
        auctionItem: auction._id,
    });

    auction.bids.push(newBid);
    auction.currentBid = auction.buyNowPrice;
    auction.highestBidder = userId;

    // Încheie licitația imediat
    auction.endTime = now;
    auction.boughtNow = true;
    auction.buyNowUser = userId;
    await auction.save();

    // Adaugă licitația în lista licitațiilor câștigate ale utilizatorului
    await User.findByIdAndUpdate(
        userId,
        {
            $inc: {
                moneySpent: auction.buyNowPrice,
                auctionsWon: 1
            },
            $push: {
                wonAuctionsDetails: {
                    auctionId: auction._id,
                    title: auction.title,
                    finalBid: auction.buyNowPrice,
                    wonAt: new Date(),
                    image: auction.image,
                    paymentStatus: 'Pending Payment'
                }
            }
        }
    );

    // Actualizează statisticile utilizatorului
    if (bidderDetail) {
        bidderDetail.moneySpent = (bidderDetail.moneySpent || 0) + parseFloat(auction.buyNowPrice);
        bidderDetail.auctionsWon = (bidderDetail.auctionsWon || 0) + 1;
        await bidderDetail.save();
    }

    // Calculează comisionul (5%)
    const commission = auction.buyNowPrice * 0.05;
    const seller = await User.findById(auction.createdBy);
    if (seller) {
        seller.unpaidCommission = (seller.unpaidCommission || 0) + commission;
        await seller.save();
    }

    // Emitem eveniment socket.io pentru notificarea tuturor utilizatorilor
    io.to(`auction:${auctionId}`).emit("auctionEnded", {
        auction,
        buyNow: true,
        buyNowUser: {
            id: bidderDetail._id,
            userName: bidderDetail.userName
        },
        message: "Auction has ended - Item was purchased using Buy Now"
    });

    res.status(200).json({
        success: true,
        message: "Item purchased successfully with Buy Now option"
    });
});