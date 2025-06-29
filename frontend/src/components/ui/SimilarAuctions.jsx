import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaGavel, FaClock, FaEye, FaBox } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const SimilarAuctions = ({ currentAuctionId, currentAuctionCategory }) => {
  const [similarAuctions, setSimilarAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useSelector(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentAuctionId && currentAuctionCategory) {
      fetchSimilarAuctions();
    }
  }, [currentAuctionId, currentAuctionCategory]);

  const fetchSimilarAuctions = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching similar auctions for:', currentAuctionId);
      
      const response = await axios.get(
        `http://localhost:5000/api/v1/recommendations/similar/${currentAuctionId}`,
        { withCredentials: true }
      );
      
      console.log('Similar auctions response:', response.data);
      setSimilarAuctions(response.data.similarAuctions || []);
    } catch (error) {
      console.error('Error fetching similar auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isAuctionActive = (auction) => {
    const now = new Date();
    const start = new Date(auction.startTime);
    const end = new Date(auction.endTime);
    return now >= start && now <= end;
  };

  if (!isAuthenticated || user?.role !== "Bidder") {
    return null;
  }

  return (
    <section className="w-full px-5 py-8 lg:pl-[20px] bg-gradient-to-r from-[#f0f9f9] to-[#e0f7fa]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] p-3 rounded-full">
              <FaGavel className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#134e5e]">
                Similar Auctions
              </h2>
              <p className="text-gray-600">
                Based on category: <span className="font-semibold text-[#00B3B3]">{currentAuctionCategory}</span>
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B3B3]"></div>
            </div>
          ) : similarAuctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {similarAuctions.map((auction, index) => (
                <motion.div
                  key={auction._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/auction/item/${auction._id}`)}
                >
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-[#00B3B3]/30">
                    <div className="relative h-32 bg-gray-50 overflow-hidden">
                      {auction.image?.url ? (
                        <img
                          src={auction.image.url}
                          alt={auction.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <FaBox className="text-gray-400 text-3xl" />
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2">
                        {isAuctionActive(auction) ? (
                          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Active
                          </div>
                        ) : (
                          <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Ended
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-gray-800 mb-2 truncate">
                        {auction.title}
                      </h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Starting bid:</span>
                          <span className="text-sm font-semibold text-[#00B3B3]">
                            {auction.startingBid} RON
                          </span>
                        </div>
                        
                        {auction.currentBid && auction.currentBid > auction.startingBid && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Current bid:</span>
                            <span className="text-sm font-semibold text-green-600">
                              {auction.currentBid} RON
                            </span>
                          </div>
                        )}
                        
                        {isAuctionActive(auction) && (
                          <div className="flex items-center gap-1 text-xs text-orange-600">
                            <FaClock className="text-[10px]" />
                            <span>{formatTimeRemaining(auction.endTime)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {auction.condition}
                          </span>
                          <div className="flex items-center gap-1 text-[#00B3B3] text-xs font-medium">
                            <FaEye className="text-[10px]" />
                            View Details
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaGavel className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No Similar Auctions Found
              </h3>
              <p className="text-gray-500 text-sm">
                We couldn't find any active auctions in the {currentAuctionCategory} category.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default SimilarAuctions;