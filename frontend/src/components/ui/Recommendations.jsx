import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getPersonalizedRecommendations } from "../../store/slices/recommendationSlice";
import { motion } from "framer-motion";
import { FaStar, FaTrophy, FaFire, FaThumbsUp } from "react-icons/fa";

const Recommendations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { personalizedRecommendations, loading, userProfile } = useSelector(
    (state) => state.recommendation
  );
  const { isAuthenticated, user } = useSelector((state) => state.user);

  useEffect(() => {
    if (isAuthenticated && user?.role === "Bidder") {
      dispatch(getPersonalizedRecommendations());
    }
  }, [dispatch, isAuthenticated, user]);

  const handleViewAllClick = () => {
    navigate("/all-recommendations");
  };

  const handleAuctionClick = (auctionId) => {
    navigate(`/auction/item/${auctionId}`);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 'highly_recommended':
        return <FaTrophy className="text-yellow-500" />;
      case 'hot_deal':
        return <FaFire className="text-red-500" />;
      default:
        return <FaThumbsUp className="text-blue-500" />;
    }
  };

  const getRankLabel = (rank) => {
    switch (rank) {
      case 'highly_recommended':
        return 'Highly Recommended';
      case 'hot_deal':
        return 'Hot Deal';
      default:
        return 'Recommended';
    }
  };

  if (!isAuthenticated || user?.role !== "Bidder" || !personalizedRecommendations?.length) {
    return null;
  }

  return (
    <section className="w-full h-auto px-5 pt-20 lg:pl-[320px] pb-10 flex flex-col min-h-screen bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa]">
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#2bd6bf] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#00B3B3] opacity-5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h3 className="text-[#134e5e] text-4xl font-extrabold mb-4">
            Personalized <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf]">For You</span>
          </h3>
          
          
          {userProfile && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6 inline-block">
              <div className="flex items-center gap-4 text-sm text-[#134e5e]">
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-500" />
                  <span>Activity: {userProfile.activityLevel}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaThumbsUp className="text-blue-500" />
                  <span>Spending: {userProfile.spendingPattern}</span>
                </div>
                {userProfile.topCategories?.[0] && (
                  <div className="flex items-center gap-1">
                    <FaTrophy className="text-green-500" />
                    <span>Favorite category: {userProfile.topCategories[0][0]}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="w-20 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto"></div>
        </div>
        
        <div className="bg-white/30 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-[#00B3B3]/10 to-[#2bd6bf]/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-[#2bd6bf]/10 to-[#00B3B3]/10 rounded-full blur-xl"></div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B3B3]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
              {personalizedRecommendations.slice(0, 4).map((auction, index) => (
                <motion.div
                  key={auction._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="recommendation-card no-card-borders relative cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(' Card clicked:', auction.title, auction._id);
                    setTimeout(() => {
                      handleAuctionClick(auction._id, auction.title);
                    }, 10);
                  }}
                >
                  {auction.personalizedRank && auction.personalizedRank <= 2 && (
                    <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      {getRankIcon(auction.recommendationReasons?.[0])}
                      #{auction.personalizedRank}
                    </div>
                  )}
                  
                  <div className="absolute top-2 left-2 z-10 bg-black/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                    {Math.round(auction.recommendationScore)}% match
                  </div>
                
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="relative h-48 bg-gray-50 overflow-hidden">
                      {auction.image?.url ? (
                        <img
                          src={auction.image.url}
                          alt={auction.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-gray-400 text-4xl">📦</div>
                        </div>
                      )}
                    </div>
                    

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                        {auction.title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>{auction.category}</span>
                        <span>{auction.condition}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[#00B3B3] font-semibold">
                          {auction.currentBid || auction.startingBid} RON
                        </span>
                        <span className="text-xs text-gray-500">
                          Starting: {auction.startingBid} RON
                        </span>
                      </div>
                    </div>
                  </div>
                  

                  {auction.recommendationReasons && auction.recommendationReasons.length > 0 && (
                    <div className="mt-2 p-2 bg-white/50 rounded-lg">
                      <p className="text-xs text-gray-700 truncate">
                         {auction.recommendationReasons[0]}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {personalizedRecommendations?.length > 4 && (
            <div className="text-center mt-8">
              <button
                onClick={handleViewAllClick}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] hover:from-[#009999] hover:to-[#00B3B3] shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                
See all personalized recommendations
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Recommendations;