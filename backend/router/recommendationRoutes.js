import express from "express";
import { 
  getPersonalizedRecommendations, 
  getSimilarAuctions, 
  debugAuctions
} from "../controllers/recommendationController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/personalized", isAuthenticated, getPersonalizedRecommendations);

router.get("/similar/:auctionId", getSimilarAuctions); 

router.get("/debug-auctions", isAuthenticated, debugAuctions);

export default router;