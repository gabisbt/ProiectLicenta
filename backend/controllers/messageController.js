// import { Message } from "../models/messageSchema.js";
// import { User } from "../models/userSchema.js";
// import { Auction } from "../models/auctionSchema.js";
// import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
// import ErrorHandler from "../middlewares/error.js";

// // Trimite un mesaj nou
// export const sendMessage = catchAsyncErrors(async (req, res, next) => {
//   const { recipientId, message, auctionId } = req.body;
  
//   if (!recipientId || !message || !auctionId) {
//     return next(new ErrorHandler("All fields are required", 400));
//   }

//   // Verifică dacă licitația există
//   const auction = await Auction.findById(auctionId);
//   if (!auction) {
//     return next(new ErrorHandler("Auction not found", 404));
//   }

//   // Verifică dacă utilizatorul are dreptul să trimită mesaje pentru această licitație
//   const isAuctioneer = auction.createdBy.toString() === req.user._id.toString();
//   const isBidder = auction.bids.some(bid => bid.userId?.toString() === req.user._id.toString());
  
//   if (!isAuctioneer && !isBidder) {
//     return next(new ErrorHandler("You can only message participants in this auction", 403));
//   }

//   // Verifică dacă destinatarul este valid
//   const recipient = await User.findById(recipientId);
//   if (!recipient) {
//     return next(new ErrorHandler("Recipient not found", 404));
//   }

//   const newMessage = await Message.create({
//     sender: req.user._id,
//     recipient: recipientId,
//     auction: auctionId,
//     message: message.trim()
//   });

//   // Populează datele pentru răspuns
//   const populatedMessage = await Message.findById(newMessage._id)
//     .populate('sender', 'userName profileImage')
//     .populate('recipient', 'userName profileImage')
//     .populate('auction', 'title');

//   console.log("Sending message via Socket.IO to:", `user:${recipientId}`);
  
//   // Trimite mesajul prin Socket.IO la destinatar
//   if (global.io) {
//     global.io.to(`user:${recipientId}`).emit("newMessage", populatedMessage);
    
//     // Trimite și la expeditor pentru confirmare
//     global.io.to(`user:${req.user._id}`).emit("messageSent", populatedMessage);
    
//     console.log("Message sent via Socket.IO successfully");
//   }
  
//   res.status(201).json({
//     success: true,
//     message: populatedMessage
//   });
// });

// // Obține conversația între două persoane pentru o licitație
// export const getConversation = catchAsyncErrors(async (req, res, next) => {
//   const { auctionId, otherUserId } = req.params;
  
//   if (!auctionId || !otherUserId) {
//     return next(new ErrorHandler("Auction ID and other user ID are required", 400));
//   }

//   // Verifică dacă licitația există
//   const auction = await Auction.findById(auctionId);
//   if (!auction) {
//     return next(new ErrorHandler("Auction not found", 404));
//   }

//   // Găsește toate mesajele între utilizatorul curent și celălalt utilizator pentru această licitație
//   const messages = await Message.find({
//     auction: auctionId,
//     $or: [
//       { sender: req.user._id, recipient: otherUserId },
//       { sender: otherUserId, recipient: req.user._id }
//     ]
//   })
//   .populate('sender', 'userName profileImage')
//   .populate('recipient', 'userName profileImage')
//   .sort({ createdAt: 1 }); // Sortează crescător pentru cronologie

//   res.status(200).json({
//     success: true,
//     messages
//   });
// });

// // Obține toate conversațiile unui utilizator
// export const getUserConversations = catchAsyncErrors(async (req, res, next) => {
//   const userId = req.user._id;

//   // Găsește toate mesajele în care utilizatorul este implicat
//   const messages = await Message.find({
//     $or: [
//       { sender: userId },
//       { recipient: userId }
//     ]
//   })
//   .populate('sender', 'userName profileImage')
//   .populate('recipient', 'userName profileImage')
//   .populate('auction', 'title image')
//   .sort({ createdAt: -1 });

//   // Grupează mesajele pe conversații
//   const conversationsMap = new Map();

//   messages.forEach(message => {
//     const otherUser = message.sender._id.toString() === userId.toString() 
//       ? message.recipient 
//       : message.sender;
    
//     const conversationKey = `${message.auction._id}-${otherUser._id}`;
    
//     if (!conversationsMap.has(conversationKey)) {
//       conversationsMap.set(conversationKey, {
//         auction: message.auction,
//         otherUser,
//         lastMessage: message,
//         unreadCount: 0,
//         messages: []
//       });
//     }
    
//     const conversation = conversationsMap.get(conversationKey);
//     conversation.messages.push(message);
    
//     // Actualizează ultimul mesaj dacă este mai recent
//     if (message.createdAt > conversation.lastMessage.createdAt) {
//       conversation.lastMessage = message;
//     }
    
//     // Numără mesajele necitite (primite de utilizatorul curent)
//     if (message.recipient._id.toString() === userId.toString() && !message.isRead) {
//       conversation.unreadCount++;
//     }
//   });

//   const conversations = Array.from(conversationsMap.values())
//     .sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);

//   res.status(200).json({
//     success: true,
//     conversations
//   });
// });

// // Marchează mesajele ca citite
// export const markMessagesAsRead = catchAsyncErrors(async (req, res, next) => {
//   const { auctionId, otherUserId } = req.params;
  
//   await Message.updateMany({
//     auction: auctionId,
//     sender: otherUserId,
//     recipient: req.user._id,
//     isRead: false
//   }, {
//     isRead: true,
//     readAt: new Date()
//   });

//   res.status(200).json({
//     success: true,
//     message: "Messages marked as read"
//   });
// });

// // Șterge o conversație
// export const deleteConversation = catchAsyncErrors(async (req, res, next) => {
//   const { auctionId, otherUserId } = req.params;
  
//   await Message.deleteMany({
//     auction: auctionId,
//     $or: [
//       { sender: req.user._id, recipient: otherUserId },
//       { sender: otherUserId, recipient: req.user._id }
//     ]
//   });

//   res.status(200).json({
//     success: true,
//     message: "Conversation deleted successfully"
//   });
// });