import express from "express";
import { 
  getPersonalizedRecommendations, 
  getSimilarAuctions, 
  debugAuctions
} from "../controllers/recommendationController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Obține recomandări personalizate pentru utilizatorul autentificat
router.get("/personalized", isAuthenticated, getPersonalizedRecommendations);

// Obține licitații similare pentru o licitație specifică
router.get("/similar/:auctionId", getSimilarAuctions); // Această rută trebuie să existe!

// Debug route for auctions
router.get("/debug-auctions", isAuthenticated, debugAuctions);

export default router;