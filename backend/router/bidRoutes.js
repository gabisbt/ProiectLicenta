import express from "express";
import { placeBid } from '../controllers/bidControllers.js';
import { isAuthenticated, isAuthorized} from "../middlewares/auth.js";
import { checkAuctionEndTime } from "../middlewares/checkAuctionEndTime.js";
import { buyNowAuction } from "../controllers/bidControllers.js"; 

const router = express.Router();

router.post("/place/:id", isAuthenticated, isAuthorized("Bidder"), checkAuctionEndTime, placeBid);
router.post("/buy-now/:auctionId", isAuthenticated, isAuthorized("Bidder"), buyNowAuction); 

export default router;