import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPaperPlane, FaTimes } from 'react-icons/fa';

const PriceAdvisorBot = ({ auctionDetail, currentBid }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: `Hello! I can help you evaluate if the current price (${currentBid || auctionDetail?.startingBid || '?'} RON) for "${auctionDetail?.title || 'this item'}" is fair based on similar products online.` 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // const handleSendMessage = async () => {
  //   if (!inputMessage.trim()) return;
    
  //   // Add user message to chat
  //   setMessages([...messages, { sender: 'user', text: inputMessage }]);
  //   const userQuery = inputMessage;
  //   setInputMessage('');
  //   setIsLoading(true);
    
  //   try {
  //     // Get auth token from localStorage
  //     const token = localStorage.getItem('token');
      
  //     // Make actual API call to your backend
  //     const response = await fetch('/api/price-advisor', {
  //       method: 'POST',
  //       headers: { 
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       },
  //       body: JSON.stringify({ 
  //         query: userQuery,
  //         productTitle: auctionDetail.title,
  //         productDescription: auctionDetail.description,
  //         currentBid: currentBid || auctionDetail.startingBid,
  //         condition: auctionDetail.condition || 'Used'
  //       }),
  //     });
      
  //     if (!response.ok) {
  //       throw new Error('API response error');
  //     }
      
  //     const data = await response.json();
      
  //     if (data.success) {
  //       setMessages(prev => [
  //         ...prev, 
  //         { 
  //           sender: 'bot', 
  //           text: data.response
  //         }
  //       ]);
  //     } else {
  //       throw new Error(data.message || 'Unknown error');
  //     }
  //   } catch (error) {
  //     console.error('Error querying price advisor:', error);
  //     setMessages(prev => [...prev, { 
  //       sender: 'bot', 
  //       text: 'Sorry, I had trouble analyzing prices right now. Please try again later.' 
  //     }]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-4 rounded-full shadow-lg z-50 hover:scale-110 transition-all"
      >
        <FaRobot size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 h-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] p-4 flex items-center justify-between">
            <h3 className="text-white font-medium flex items-center gap-2">
              <FaRobot /> Price Advisor
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1 rounded-full"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-3 flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`p-3 rounded-2xl max-w-[80%] ${
                  msg.sender === 'bot' 
                    ? 'bg-white border border-gray-200 text-gray-800' 
                    : 'bg-[#00B3B3] text-white'
                }`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about the price..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B3B3]"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="bg-[#00B3B3] text-white p-2 rounded-full hover:bg-[#2bd6bf] transition-colors disabled:opacity-50"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PriceAdvisorBot;