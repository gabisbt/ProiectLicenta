import express from "express";
import { addToFavorites, getFavorites, removeFromFavorites, checkFavorite, cleanupDuplicateFavorites } from '../controllers/favoriteController.js';
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", isAuthenticated, isAuthorized("Bidder"), getFavorites);
router.post("/add/:auctionId", isAuthenticated, isAuthorized("Bidder"), addToFavorites);
router.delete("/remove/:auctionId", isAuthenticated, isAuthorized("Bidder"), removeFromFavorites);
router.get("/check/:auctionId", isAuthenticated, isAuthorized("Bidder"), checkFavorite);
router.delete("/cleanup", isAuthenticated, cleanupDuplicateFavorites);

export default router;