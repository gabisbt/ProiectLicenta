// // frontend/src/pages/Messages.jsx
// import React, { useState, useEffect } from 'react';
// import { FaComment, FaUser, FaSearch } from 'react-icons/fa';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import ChatModal from '@/components/ui/ChatModal';

// const Messages = () => {
//   const [conversations, setConversations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedChat, setSelectedChat] = useState(null);

//   useEffect(() => {
//     loadConversations();
//   }, []);

//   const loadConversations = async () => {
//     try {
//       const response = await axios.get(
//         'http://localhost:5000/api/v1/messages/conversations',
//         { withCredentials: true }
//       );
//       setConversations(response.data.conversations);
//     } catch (error) {
//       toast.error('Failed to load conversations');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredConversations = conversations.filter(conv =>
//     conv.otherUser.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     conv.auction.title.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const formatDate = (timestamp) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffTime = Math.abs(now - date);
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//     if (diffDays === 1) return 'Azi';
//     if (diffDays === 2) return 'Ieri';
//     if (diffDays <= 7) return `${diffDays - 1} zile`;
//     return date.toLocaleDateString('ro-RO');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 pt-20 px-4">
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
//               <FaComment className="text-[#00B3B3]" />
//               <span>Mesajele mele</span>
//             </h1>
//           </div>

//           {/* Search */}
//           <div className="relative mb-6">
//             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Caută conversații..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B3B3]"
//             />
//           </div>

//           {/* Conversations */}
//           {loading ? (
//             <div className="flex justify-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B3B3]"></div>
//             </div>
//           ) : filteredConversations.length === 0 ? (
//             <div className="text-center py-8">
//               <FaComment size={48} className="mx-auto text-gray-300 mb-4" />
//               <p className="text-gray-500">Nu ai conversații încă</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {filteredConversations.map((conversation) => (
//                 <div
//                   key={`${conversation.auction._id}-${conversation.otherUser._id}`}
//                   onClick={() => setSelectedChat(conversation)}
//                   className="flex items-center space-x-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-gray-200"
//                 >
//                   {/* Avatar */}
//                   <div className="w-12 h-12 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] rounded-full flex items-center justify-center flex-shrink-0">
//                     {conversation.otherUser.profileImage?.url ? (
//                       <img
//                         src={conversation.otherUser.profileImage.url}
//                         alt={conversation.otherUser.userName}
//                         className="w-full h-full rounded-full object-cover"
//                       />
//                     ) : (
//                       <FaUser className="text-white" />
//                     )}
//                   </div>

//                   {/* Content */}
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center justify-between mb-1">
//                       <h3 className="font-semibold text-gray-900 truncate">
//                         {conversation.otherUser.userName}
//                       </h3>
//                       <span className="text-xs text-gray-500">
//                         {formatDate(conversation.lastMessage.createdAt)}
//                       </span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-1 truncate">
//                       {conversation.auction.title}
//                     </p>
//                     <p className="text-sm text-gray-500 truncate">
//                       {conversation.lastMessage.text}
//                     </p>
//                   </div>

//                   {/* Unread count */}
//                   {conversation.unreadCount > 0 && (
//                     <div className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
//                       {conversation.unreadCount}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Chat Modal */}
//         {selectedChat && (
//           <ChatModal
//             isOpen={!!selectedChat}
//             onClose={() => setSelectedChat(null)}
//             auctionId={selectedChat.auction._id}
//             otherUser={selectedChat.otherUser}
//             auctionTitle={selectedChat.auction.title}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Messages;