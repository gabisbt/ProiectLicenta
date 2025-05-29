// // backend/models/messageSchema.js
// import mongoose from "mongoose";

// const messageSchema = new mongoose.Schema({
//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
//   recipient: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
//   auction: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Auction",
//     required: true
//   },
//   message: {
//     type: String,
//     required: true,
//     maxLength: 1000
//   },
//   messageType: {
//     type: String,
//     enum: ["text", "image", "system"],
//     default: "text"
//   },
//   isRead: {
//     type: Boolean,
//     default: false
//   },
//   readAt: {
//     type: Date
//   }
// }, {
//   timestamps: true
// });

// // Index pentru căutare rapidă
// messageSchema.index({ sender: 1, recipient: 1, auction: 1 });
// messageSchema.index({ auction: 1, createdAt: -1 });

// export const Message = mongoose.model("Message", messageSchema);