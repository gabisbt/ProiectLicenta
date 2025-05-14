import express from 'express';
import { proofOfCommission } from "../controllers/commissionControlller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.post("/proof", isAuthenticated, isAuthorized("Auctioneer"), proofOfCommission);

export default router;