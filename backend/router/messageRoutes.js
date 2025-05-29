// // backend/router/messageRoutes.js
// import express from "express";
// import { sendMessage, getConversation, getUserConversations } from "../controllers/messageController.js";
// import { isAuthenticated } from "../middlewares/auth.js";

// const router = express.Router();

// router.post("/send", isAuthenticated, sendMessage);
// router.get("/conversation/:auctionId/:otherUserId", isAuthenticated, getConversation);
// router.get("/conversations", isAuthenticated, getUserConversations);

// export default router;