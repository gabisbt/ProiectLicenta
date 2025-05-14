// import Review from "../models/reviewSchema.js";
// import User from "../models/userSchema.js";
// import Auction from "../models/auctionSchema.js";
// import ErrorHandler from "../utils/errorHandler.js";
// import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";

// // Creare review nou
// export const createReview = catchAsyncErrors(async (req, res, next) => {
//     const { recipientId, auctionId, rating, comment, reviewType } = req.body;
    
//     if (!recipientId || !auctionId || !rating || !reviewType) {
//         return next(new ErrorHandler("Required fields missing", 400));
//     }
    
//     // Verifica daca licitatia exista si este finalizata
//     const auction = await Auction.findById(auctionId);
//     if (!auction || new Date(auction.endTime) > new Date()) {
//         return next(new ErrorHandler("Cannot review an active auction", 400));
//     }
    
//     // Verifica daca utilizatorul are dreptul de a lasa review (participant la licitatie)
//     const isReviewerSeller = auction.createdBy.toString() === req.user._id.toString();
//     const isReviewerBuyer = auction.highestBidder?.toString() === req.user._id.toString() || 
//                            auction.buyNowUser?.toString() === req.user._id.toString();
    
//     if ((reviewType === "buyer-to-seller" && !isReviewerBuyer) || 
//         (reviewType === "seller-to-buyer" && !isReviewerSeller)) {
//         return next(new ErrorHandler("You can only review participants in this auction", 403));
//     }
    
//     // Verifica daca review-ul exista deja
//     const existingReview = await Review.findOne({
//         reviewer: req.user._id,
//         auction: auctionId
//     });
    
//     if (existingReview) {
//         return next(new ErrorHandler("You have already submitted a review for this auction", 400));
//     }
    
//     // Creeaza review-ul
//     const review = await Review.create({
//         reviewer: req.user._id,
//         recipient: recipientId,
//         auction: auctionId,
//         rating: Math.min(5, Math.max(1, rating)),  // Asigura ca rating-ul este intre 1-5
//         comment,
//         reviewType
//     });
    
//     // Actualizeaza statisticile utilizatorului care primeste review-ul
//     const recipient = await User.findById(recipientId);
//     const allReviews = await Review.find({ recipient: recipientId });
    
//     const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
//     recipient.averageRating = totalRating / allReviews.length;
//     recipient.totalReviews = allReviews.length;
    
//     await recipient.save();
    
//     res.status(201).json({
//         success: true,
//         message: "Review submitted successfully",
//         review
//     });
// });

// // Obtinerea review-urilor unui utilizator
// export const getUserReviews = catchAsyncErrors(async (req, res, next) => {
//     const { userId } = req.params;
//     const { as, page = 1, limit = 10 } = req.query;
    
//     const query = { recipient: userId };
//     if (as === "reviewer") {
//         query.reviewer = userId;
//         delete query.recipient;
//     }
    
//     const options = {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         sort: { createdAt: -1 },
//         populate: [
//             { path: 'reviewer', select: 'userName profileImage' },
//             { path: 'recipient', select: 'userName profileImage' },
//             { path: 'auction', select: 'title image.url' }
//         ]
//     };
    
//     const reviews = await Review.find(query)
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .sort({ createdAt: -1 })
//         .populate('reviewer', 'userName profileImage')
//         .populate('recipient', 'userName profileImage')
//         .populate('auction', 'title image.url');
    
//     const total = await Review.countDocuments(query);
    
//     res.status(200).json({
//         success: true,
//         reviews,
//         pagination: {
//             total,
//             pages: Math.ceil(total / limit),
//             page: parseInt(page),
//             limit: parseInt(limit)
//         }
//     });
// });

// // Obtinerea statisticilor de rating pentru un utilizator
// export const getUserRatingStats = catchAsyncErrors(async (req, res, next) => {
//     const { userId } = req.params;
    
//     const user = await User.findById(userId).select('averageRating totalReviews');
//     if (!user) {
//         return next(new ErrorHandler("User not found", 404));
//     }
    
//     // Obtine distributia rating-urilor (cate de 5*, 4* etc.)
//     const ratingDistribution = await Review.aggregate([
//         { $match: { recipient: mongoose.Types.ObjectId(userId) } },
//         { $group: { _id: "$rating", count: { $sum: 1 } } },
//         { $sort: { _id: -1 } }
//     ]);
    
//     const distribution = {
//         5: 0, 4: 0, 3: 0, 2: 0, 1: 0
//     };
    
//     ratingDistribution.forEach(item => {
//         distribution[item._id] = item.count;
//     });
    
//     res.status(200).json({
//         success: true,
//         stats: {
//             averageRating: user.averageRating,
//             totalReviews: user.totalReviews,
//             distribution
//         }
//     });
// });

// // stergerea unui review (doar pentru admin)
// export const deleteReview = catchAsyncErrors(async (req, res, next) => {
//     const { id } = req.params;
    
//     const review = await Review.findById(id);
//     if (!review) {
//         return next(new ErrorHandler("Review not found", 404));
//     }
    
//     await review.deleteOne();
    
//     // Recalculeaza statisticile dupa stergere
//     const recipient = await User.findById(review.recipient);
//     const allReviews = await Review.find({ recipient: review.recipient });
    
//     if (allReviews.length > 0) {
//         const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
//         recipient.averageRating = totalRating / allReviews.length;
//     } else {
//         recipient.averageRating = 0;
//     }
    
//     recipient.totalReviews = allReviews.length;
//     await recipient.save();
    
//     res.status(200).json({
//         success: true,
//         message: "Review deleted successfully"
//     });
// });