import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Favorite } from "../models/favoriteSchema.js";
import { Auction } from "../models/auctionSchema.js";

export const getFavorites = catchAsyncErrors(async (req, res, next) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .populate({
      path: 'auction',
      select: 'title description startingBid category condition startTime endTime image currentBid'
    });

  const auctions = favorites.map(fav => fav.auction);

  res.status(200).json({
    success: true,
    favorites: auctions
  });
});

export const addToFavorites = catchAsyncErrors(async (req, res, next) => {
  const { auctionId } = req.params;
  const auction = await Auction.findById(auctionId);
  if (!auction) return next(new ErrorHandler("Auction not found", 404));
  const existingFavorite = await Favorite.findOne({
    user: req.user._id, auction: auctionId
  });
  
  if (existingFavorite) return res.status(200).json({
      success: true, message: "Auction is already in favorites"
    });

  await Favorite.create({user: req.user._id, auction: auctionId});
  res.status(201).json({success: true, message: "Added to favorites"});
});

export const removeFromFavorites = catchAsyncErrors(async (req, res, next) => {
  const { auctionId } = req.params;
  
  const deleted = await Favorite.findOneAndDelete({
    user: req.user._id,
    auction: auctionId
  });

  if (!deleted) {
    return next(new ErrorHandler("Favorite not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Removed from favorites"
  });
});

export const checkFavorite = catchAsyncErrors(async (req, res, next) => {
  const { auctionId } = req.params;
  
  const favorite = await Favorite.findOne({
    user: req.user._id,
    auction: auctionId
  });

  res.status(200).json({
    success: true,
    isFavorite: !!favorite
  });
});

export const cleanupDuplicateFavorites = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log("Starting cleanup of duplicate favorites...");
        
        const allFavorites = await Favorite.find({});
        
        const grouped = {};
        
        allFavorites.forEach(fav => {
            const key = `${fav.user}_${fav.auction}`;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(fav);
        });
        
        let deletedCount = 0;
        
        for (const key in grouped) {
            const duplicates = grouped[key];
            if (duplicates.length > 1) {
                for (let i = 1; i < duplicates.length; i++) {
                    await Favorite.findByIdAndDelete(duplicates[i]._id);
                    deletedCount++;
                }
            }
        }
        
        console.log(`Cleanup completed. Deleted ${deletedCount} duplicate favorites.`);
        
        res.status(200).json({
            success: true,
            message: `Cleanup completed. Deleted ${deletedCount} duplicate favorites.`,
            deletedCount
        });
        
    } catch (error) {
        console.error("Error cleaning up favorites:", error);
        return next(new ErrorHandler("Failed to cleanup favorites", 500));
    }
});