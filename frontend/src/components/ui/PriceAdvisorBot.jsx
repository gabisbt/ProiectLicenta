import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaChevronDown, FaInfoCircle, FaRegLightbulb, FaChartLine } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';

const PriceAdvisorBot = ({ auctionDetail, currentBid }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [lastPriceRange, setLastPriceRange] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const price = currentBid || auctionDetail?.currentBid || auctionDetail?.startingBid || '?';
    setMessages([{ 
      sender: 'bot', 
      text: `Salut! Sunt asistentul tău AI pentru evaluarea prețurilor.
      
Te pot ajuta să evaluezi dacă prețul curent (${price} RON) pentru "${auctionDetail?.title || 'acest articol'}" este corect, bazat pe analiza datelor de piață.

Ce dorești să știi?` 
    }]);
  }, [auctionDetail, currentBid]);

  useEffect(() => {
    scrollToBottom();
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    setMessages([...messages, { sender: 'user', text: inputMessage }]);
    
    const userQuery = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/v1/price-advisor', 
        { 
          query: userQuery,
          productTitle: auctionDetail.title,
          productDescription: auctionDetail.description,
          currentBid: currentBid || auctionDetail.currentBid || auctionDetail.startingBid,
          condition: auctionDetail.condition || 'Used'
        },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = response.data;
      
      if (data.success) {
        setEvaluation(data.evaluation);
        setLastPriceRange(data.priceRange);
        
        setMessages(prev => [
          ...prev, 
          { 
            sender: 'bot', 
            text: data.response, 
            priceRange: data.priceRange,
            confidenceLevel: data.confidenceLevel,
            usingFallback: data.usingFallback
          }
        ]);
      } else {
        throw new Error(data.message || 'Failed to get price advice');
      }
    } catch (error) {
      console.error('PriceAdvisor error:', error);
      setMessages(prev => [
        ...prev, 
        { sender: 'bot', text: "Îmi pare rău, am întâmpinat o problemă în analiză. Te rog să încerci din nou mai târziu." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "Este un preț corect?",
    "Cât ar trebui să plătesc maxim?",
    "Merită prețul cerut?",
    "Există produse similare mai ieftine?",
    "Crezi că este o ofertă bună?"
  ];

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const renderPriceRangeVisual = (priceRange) => {
    if (!priceRange) return null;
    
    const price = currentBid || auctionDetail?.currentBid || auctionDetail?.startingBid || 0;
    const numericPrice = parseFloat(price);
    
    const min = priceRange.low;
    const max = priceRange.high;
    const range = max - min;
    const position = Math.max(0, Math.min(100, ((numericPrice - min) / range) * 100));
    
    return (
      <div className="mt-3 mb-1 bg-gray-100 p-3 rounded-lg">
        <div className="text-xs text-gray-500 mb-1 flex items-center">
          <FaChartLine className="mr-1" /> Analiza prețului:
        </div>
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Minim: {priceRange.low} RON</span>
          <span>Mediu: {priceRange.average} RON</span>
          <span>Maxim: {priceRange.high} RON</span>
        </div>
        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-green-200"></div>
          <div className="absolute top-0 left-[33%] h-full w-1/3 bg-yellow-200"></div>
          <div className="absolute top-0 left-[66%] h-full w-1/3 bg-red-200"></div>
          
          <div 
            className="absolute top-0 h-full w-1 bg-blue-600"
            style={{ left: `${position}%` }}
          ></div>
          <div 
            className="absolute top-0 transform -translate-x-1/2 px-2 py-1 bg-blue-600 text-white rounded-full text-xs"
            style={{ left: `${position}%` }}
          >
            {numericPrice} RON
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>Preț excelent</span>
          <span>Preț bun</span>
          <span>Preț ridicat</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        aria-label="Open Price Advisor"
      >
        <div className="relative">
          <FaRegLightbulb className="text-xl" />
          {evaluation && (
            <span 
              className={`absolute -top-2 -right-2 w-3 h-3 rounded-full ${
                evaluation === 'potentially_good_deal' 
                  ? 'bg-green-500' 
                  : 'bg-yellow-500'
              }`}
            />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 right-0 z-50 w-full sm:w-96 h-[500px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl sm:bottom-6 sm:right-6 overflow-hidden border border-gray-200 flex flex-col"
          >
            <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] p-4 flex justify-between items-center text-white">
              <div className="flex items-center">
                <FaRobot className="text-2xl mr-3" />
                <div>
                  <h3 className="font-semibold">AI Price Advisor</h3>
                  <p className="text-xs text-white/80">Analizează valoarea articolelor</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white/80 hover:text-white"
                aria-label="Close chat"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`p-3 rounded-lg max-w-[80%] ${
                      msg.sender === 'user' 
                        ? 'bg-[#00B3B3] text-white rounded-tr-none' 
                        : 'bg-white border border-gray-200 shadow-sm rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                    {msg.sender === 'bot' && msg.confidenceLevel && (
                      <div className="mt-1 text-xs text-gray-500">
                        Nivel de încredere: <span className="font-medium">{msg.confidenceLevel}</span>
                      </div>
                    )}
                    {msg.sender === 'bot' && msg.priceRange && renderPriceRangeVisual(msg.priceRange)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white p-3 rounded-lg rounded-tl-none border border-gray-200 shadow-sm flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {messages.length <= 2 && (
              <div className="px-4 py-2 bg-white border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 flex items-center">
                  <FaInfoCircle className="mr-1" /> Sugestii de întrebări:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputMessage(q);
                        if (inputRef.current) inputRef.current.focus();
                      }}
                      className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Întreabă-mă despre acest preț..."
                  className="flex-1 bg-transparent outline-none py-2 text-gray-700"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`ml-2 text-[#00B3B3] p-1 rounded-full ${
                    !inputMessage.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00B3B3]/10'
                  }`}
                  aria-label="Send message"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PriceAdvisorBot;