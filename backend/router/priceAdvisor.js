import express from "express";
import { getPriceAdvice } from "../controllers/priceAdvisorController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();
router.post("/", isAuthenticated, getPriceAdvice);

export default router;