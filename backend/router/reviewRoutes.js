// import express from "express";
// import { 
//     createReview,
//     getUserReviews, 
//     getUserRatingStats,
//     deleteReview
// } from "../controllers/reviewController.js";
// import { isAuthenticated } from "../middlewares/auth.js";

// const router = express.Router();

// // Creează un review
// router.post("/create", isAuthenticated, createReview);

// // Obține toate review-urile unui utilizator
// router.get("/user/:id", getUserReviews);
//                                                                     //cred ca e :id, nu :userId
// // Obține statisticile de rating ale unui utilizator
// router.get("/stats/:id", getUserRatingStats);

// // Șterge un review (doar administratorii)
// router.delete("/:id", isAuthenticated, isAuthorized("Super Admin"), deleteReview);

// export default router;