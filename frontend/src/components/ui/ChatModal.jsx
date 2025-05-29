// // frontend/src/components/ui/ChatModal.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import { FaTimes, FaPaperPlane, FaUser } from 'react-icons/fa';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import io from 'socket.io-client';

// const ChatModal = ({ isOpen, onClose, auctionId, otherUser, auctionTitle }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef(null);
//   const { user } = useSelector(state => state.user);
//   const socketRef = useRef(null);

//   // Verifică dacă toate props-urile necesare sunt disponibile
//   if (!isOpen || !otherUser || !auctionId) {
//     return null;
//   }

//   // Verifică dacă otherUser are proprietățile necesare
//   if (!otherUser._id || !otherUser.userName) {
//     console.error('Invalid otherUser data:', otherUser);
//     return null;
//   }

//   useEffect(() => {
//     if (!isOpen || !auctionId || !otherUser?._id) {
//       return;
//     }

//     console.log('🚀 ChatModal opened:', {
//       auctionId,
//       otherUserId: otherUser._id,
//       currentUserId: user._id
//     });

//     loadConversation();
    
//     socketRef.current = io('http://localhost:5000', {
//       withCredentials: true,
//       transports: ['websocket', 'polling']
//     });
    
//     socketRef.current.on('connect', () => {
//       console.log('✅ Socket connected:', socketRef.current.id);
      
//       // Autentificare utilizator
//       socketRef.current.emit('authenticate', user._id);
//       console.log('📤 Sent authenticate for user:', user._id);
//     });
    
//     socketRef.current.on('authenticated', (data) => {
//       console.log('🔐 Socket authenticated:', data);
//     });
    
//     // Listen pentru mesaje noi
//     socketRef.current.on('newMessage', (message) => {
//       console.log('📨 Received newMessage event:', message);
      
//       const belongsToConversation = message.auction === auctionId && 
//           ((message.sender._id === otherUser._id && message.recipient._id === user._id) ||
//            (message.sender._id === user._id && message.recipient._id === otherUser._id));
           
//       console.log('Message belongs to conversation:', belongsToConversation);
      
//       if (belongsToConversation) {
//         setMessages(prev => {
//           const messageExists = prev.some(msg => msg._id === message._id);
//           if (messageExists) {
//             console.log('⚠️ Message already exists');
//             return prev;
//           }
          
//           console.log('✅ Adding new message to conversation');
//           return [...prev, message];
//         });
//       }
//     });
    
//     socketRef.current.on('messageSent', (message) => {
//       console.log('✅ Message sent confirmation:', message);
//     });

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
//     };
//   }, [isOpen, auctionId, otherUser?._id, user?._id]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const loadConversation = async () => {
//     if (!otherUser?._id) return;
    
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `http://localhost:5000/api/v1/messages/conversation/${auctionId}/${otherUser._id}`,
//         { withCredentials: true }
//       );
//       setMessages(response.data.messages);
//     } catch (error) {
//       toast.error('Failed to load conversation');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const sendMessage = async (e) => {
//     e.preventDefault();
//     if (!newMessage.trim() || !otherUser?._id) return;

//     const messageText = newMessage.trim();
//     setNewMessage(''); // Clear input imediat

//     try {
//       await axios.post(
//         'http://localhost:5000/api/v1/messages/send',
//         {
//           recipientId: otherUser._id,
//           message: messageText,
//           auctionId
//         },
//         { withCredentials: true }
//       );
      
//     } catch (error) {
//       console.error('Error sending message:', error);
//       toast.error(error.response?.data?.message || 'Failed to send message');
//       // Restaurează mesajul în input dacă a eșuat
//       setNewMessage(messageText);
//     }
//   };

//   const formatTime = (timestamp) => {
//     return new Date(timestamp).toLocaleTimeString('ro-RO', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
//         onClick={onClose}
//       >
//         <motion.div
//           initial={{ scale: 0.95, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.95, opacity: 0 }}
//           className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[600px] flex flex-col"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between p-4 border-b border-gray-200">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] rounded-full flex items-center justify-center">
//                 {otherUser.profileImage?.url ? (
//                   <img
//                     src={otherUser.profileImage.url}
//                     alt={otherUser.userName}
//                     className="w-full h-full rounded-full object-cover"
//                   />
//                 ) : (
//                   <FaUser className="text-white text-sm" />
//                 )}
//               </div>
//               <div>
//                 <h3 className="font-semibold text-gray-900">{otherUser.userName}</h3>
//                 <p className="text-xs text-gray-500 truncate max-w-[200px]">{auctionTitle}</p>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <FaTimes size={20} />
//             </button>
//           </div>

//           {/* Messages */}
//           <div className="flex-1 overflow-y-auto p-4 space-y-3">
//             {loading ? (
//               <div className="flex justify-center items-center h-full">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B3B3]"></div>
//               </div>
//             ) : messages.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-full text-gray-500">
//                 <FaUser size={40} className="mb-2 opacity-50" />
//                 <p>Nu există mesaje încă</p>
//                 <p className="text-sm">Începe conversația!</p>
//               </div>
//             ) : (
//               messages.map((message) => (
//                 <div
//                   key={message._id}
//                   className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
//                 >
//                   <div
//                     className={`max-w-[70%] rounded-lg px-3 py-2 ${
//                       message.sender._id === user._id
//                         ? 'bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white'
//                         : 'bg-gray-100 text-gray-800'
//                     }`}
//                   >
//                     <p className="text-sm">{message.message}</p>
//                     <p
//                       className={`text-xs mt-1 ${
//                         message.sender._id === user._id ? 'text-white opacity-75' : 'text-gray-500'
//                       }`}
//                     >
//                       {formatTime(message.createdAt)}
//                     </p>
//                   </div>
//                 </div>
//               ))
//                 )}


//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input */}
//           <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
//             <div className="flex space-x-2">
//               <input
//                 type="text"
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 placeholder="Scrie un mesaj..."
//                 className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent"
//                 maxLength={1000}
//               />
//               <button
//                 type="submit"
//                 disabled={!newMessage.trim()}
//                 className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-2 rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <FaPaperPlane size={16} />
//               </button>
//             </div>
//           </form>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>      
//   );
// };

// export default ChatModal;