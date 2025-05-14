import express from "express";
import { 
    fetchLeaderboard, 
    forgotPassword, 
    getProfile, 
    login, 
    logout, 
    register,
    resetPassword, 
} from '../controllers/userController.js';
import { isAuthenticated } from "../middlewares/auth.js";
import { finalizeAuction } from "../controllers/auctionItemController.js";
import { getUnpaidCommission } from "../controllers/auctionItemController.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get("/me", isAuthenticated, getProfile);
router.get("/logout", isAuthenticated,logout);
router.get("/leaderboard", fetchLeaderboard);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.put("/auction/finalize/:id", isAuthenticated, finalizeAuction);
router.get("/commission/unpaid", isAuthenticated, getUnpaidCommission);


export default router;