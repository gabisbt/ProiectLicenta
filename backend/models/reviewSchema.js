// import mongoose from "mongoose";

// const reviewSchema = new mongoose.Schema({
//     reviewer: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },
//     recipient: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },
//     auction: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Auction",
//         required: true
//     },
//     rating: {
//         type: Number,
//         required: true,
//         min: 1,
//         max: 5
//     },
//     comment: {
//         type: String,
//         maxlength: 500
//     },
//     reviewType: {
//         type: String,
//         enum: ["buyer-to-seller", "seller-to-buyer"],
//         required: true
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// // Un utilizator poate lăsa doar un singur review pentru o anumită licitație
// reviewSchema.index({ reviewer: 1, auction: 1 }, { unique: true });

// export default mongoose.model("Review", reviewSchema);