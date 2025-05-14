import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Favorite } from "../models/favoriteSchema.js";
import { Auction } from "../models/auctionSchema.js";

// Obtine toate favoritele unui utilizator
export const getFavorites = catchAsyncErrors(async (req, res, next) => {
  // Gaseste toate favoritele utilizatorului si populează cu detaliile licitatiei
  const favorites = await Favorite.find({ user: req.user._id })
    .populate({
      path: 'auction',
      select: 'title description startingBid category condition startTime endTime image currentBid'
    });

  // Extrage doar datele licitatiilor
  const auctions = favorites.map(fav => fav.auction);

  res.status(200).json({
    success: true,
    favorites: auctions
  });
});

// Adauga o licitatie la favorite
export const addToFavorites = catchAsyncErrors(async (req, res, next) => {
  const { auctionId } = req.params;
  
  // Verifica daca licitatia exista
  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return next(new ErrorHandler("Auction not found", 404));
  }

  // Verifica daca este deja în favorite
  const existingFavorite = await Favorite.findOne({
    user: req.user._id,
    auction: auctionId
  });

  if (existingFavorite) {
    return res.status(200).json({
      success: true,
      message: "Auction is already in favorites"
    });
  }

  // Adauga la favorite
  await Favorite.create({
    user: req.user._id,
    auction: auctionId
  });

  res.status(201).json({
    success: true,
    message: "Added to favorites"
  });
});

// Sterge o licitatie din favorite
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

// Verifica daca o licitatie este în favorite
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