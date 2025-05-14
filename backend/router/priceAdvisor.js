// import express from 'express';
// import { protect } from '../middleware/authMiddleware.js';
// import axios from 'axios';

// const router = express.Router();

// // @desc    Get price advice for a product
// // @route   POST /api/price-advisor
// // @access  Private (Bidders only)
// router.post('/', protect, async (req, res) => {
//   try {
//     if (req.user.role !== "Bidder") {
//       return res.status(403).json({ success: false, message: "Only bidders can use the price advisor" });
//     }

//     const { productTitle, productDescription, currentBid, condition, query } = req.body;
    
//     // Simple price estimation logic
//     let priceRange = {
//       low: Math.round(currentBid * 0.8),
//       average: Math.round(currentBid * 1.0),
//       high: Math.round(currentBid * 1.2)
//     };
    
//     // Adjust for condition
//     if (condition === "New") {
//       priceRange.average = Math.round(priceRange.average * 1.2);
//       priceRange.high = Math.round(priceRange.high * 1.2);
//     } else if (condition === "Used - Like New") {
//       priceRange.average = Math.round(priceRange.average * 1.1);
//       priceRange.high = Math.round(priceRange.high * 1.1);
//     } else if (condition === "Used - Poor") {
//       priceRange.average = Math.round(priceRange.average * 0.7);
//       priceRange.low = Math.round(priceRange.low * 0.7);
//     }
    
//     // Build response based on query
//     let response;
//     const lowerQuery = query.toLowerCase();
    
//     if (lowerQuery.includes("good price") || lowerQuery.includes("worth") || lowerQuery.includes("fair price")) {
//       if (currentBid <= priceRange.low) {
//         response = `The current bid of ${currentBid} RON for this ${condition.toLowerCase()} ${productTitle} is below the typical market price. This could be a good deal! Similar items typically sell for ${priceRange.average}-${priceRange.high} RON.`;
//       } else if (currentBid <= priceRange.average) {
//         response = `The current bid of ${currentBid} RON for this ${condition.toLowerCase()} ${productTitle} seems reasonable. Similar items typically sell for ${priceRange.low}-${priceRange.high} RON.`;
//       } else {
//         response = `The current bid of ${currentBid} RON for this ${condition.toLowerCase()} ${productTitle} is higher than typical market prices. Similar items typically sell for ${priceRange.low}-${priceRange.average} RON. Consider if the unique features of this item justify the premium.`;
//       }
//     } else if (lowerQuery.includes("comparison") || lowerQuery.includes("similar")) {
//       response = `Similar ${productTitle} items in ${condition.toLowerCase()} condition typically sell for ${priceRange.low}-${priceRange.high} RON on online marketplaces. The average price is around ${priceRange.average} RON.`;
//     } else if (lowerQuery.includes("should i") || lowerQuery.includes("bid") || lowerQuery.includes("recommend")) {
//       if (currentBid <= priceRange.low) {
//         response = `At ${currentBid} RON, this ${productTitle} appears to be priced below market value. If you're interested in this item, it could be a good opportunity to bid.`;
//       } else if (currentBid <= priceRange.average) {
//         response = `The current bid of ${currentBid} RON is around the typical market price for this ${condition.toLowerCase()} ${productTitle}. If you need this item, it's a fair price to pay.`;
//       } else {
//         response = `The current bid of ${currentBid} RON is above the typical price range for similar items. Unless this specific item has special value to you, you might find better prices elsewhere.`;
//       }
//     } else {
//       response = `Based on my analysis, this ${condition.toLowerCase()} ${productTitle} has a typical market value between ${priceRange.low} and ${priceRange.high} RON. The current bid is ${currentBid} RON. How else can I help you evaluate this auction?`;
//     }
    
//     res.json({ 
//       success: true,
//       response,
//       priceRange,
//       currentBid,
//       evaluation: currentBid <= priceRange.average ? "potentially_good_deal" : "potentially_overpriced"
//     });
//       evaluation: currentBid <= priceRange.average ? "potentially_good_deal" : "potentially_overpriced"
//     });
    
//   } catch (error) {
//     console.error('Price advisor error:', error);
//     res.status(500).json({ success: false, message: 'Error analyzing price data' });
//   }
// });

// module.exports = router;