import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPersonalizedRecommendations } from "@/store/slices/recommendationSlice";
import Card from "@/custom-components/Card";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaArrowLeft, FaFilter } from "react-icons/fa";

const AllRecommendations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { personalizedRecommendations, loading, userProfile } = useSelector(
    (state) => state.recommendation
  );
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [sortBy, setSortBy] = useState("score"); // score, price, date

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user && user.role !== "Bidder") {
      navigate("/");
      return;
    }

    dispatch(getPersonalizedRecommendations());
  }, [dispatch, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (personalizedRecommendations) {
      let filtered = personalizedRecommendations.filter((item) =>
        item?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      filtered = filtered.sort((a, b) => {
        switch (sortBy) {
          case "score":
            return (b.recommendationScore || 0) - (a.recommendationScore || 0);
          case "price":
            return (a.currentBid || a.startingBid) - (b.currentBid || b.startingBid);
          case "date":
            return new Date(a.endTime) - new Date(b.endTime);
          default:
            return 0;
        }
      });

      setFilteredRecommendations(filtered);
    }
  }, [personalizedRecommendations, searchTerm, sortBy]);

  const handleAuctionClick = (auctionId) => {
    navigate(`/auction/item/${auctionId}`);
  };

  return (
    <section className="w-full h-auto px-5 pt-20 lg:pl-[320px] pb-10 flex flex-col min-h-screen bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa]">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:bg-white"
          >
            <FaArrowLeft className="text-[#00B3B3]" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf]">
              All Recommendations
            </h1>
            <p className="text-gray-600">
              {filteredRecommendations.length} personalized recommendations for you
            </p>
          </div>
        </div>

        {userProfile && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 mb-8">
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#134e5e]">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Activity level:</span>
                <span className="bg-blue-100 px-3 py-1 rounded-full">{userProfile.activityLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Spending patterns:</span>
                <span className="bg-green-100 px-3 py-1 rounded-full">{userProfile.spendingPattern}</span>
              </div>
              {userProfile.topCategories?.[0] && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Favorite category:</span>
                  <span className="bg-yellow-100 px-3 py-1 rounded-full">{userProfile.topCategories[0][0]}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search recommendations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent bg-white/80 backdrop-blur-sm"
            />
            <FaSearch className="absolute left-4 top-4 text-gray-400" />
          </div>
          
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B3B3] bg-white/80 backdrop-blur-sm"
            >
              <option value="score">Compatibility</option>
              <option value="price">Increasing price</option>
              <option value="date">Ends soon</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B3B3]"></div>
          </div>
        ) : (
          <>
            {filteredRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecommendations.map((auction) => (
                  <div
                    key={auction._id}
                    className="cursor-pointer transform transition-all duration-300 hover:scale-105 relative"
                    onClick={() => handleAuctionClick(auction._id)}
                  >
                    {/* Badge cu scorul */}
                    <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white px-3 py-1 rounded-full text-xs font-bold">
                      {Math.round(auction.recommendationScore || 0)}% match
                    </div>

                    <Card
                      imgSrc={auction.image?.url}
                      title={auction.title}
                      category={auction.category}
                      condition={auction.condition}
                      startingBid={auction.startingBid}
                      startTime={auction.startTime}
                      endTime={auction.endTime}
                      currentBid={auction.currentBid}
                    />

                    {auction.recommendationReasons && auction.recommendationReasons.length > 0 && (
                      <div className="mt-2 p-3 bg-white/80 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-700 font-medium mb-1">
                          Why it is recommended:
                        </p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {auction.recommendationReasons.slice(0, 2).map((reason, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-green-500 mt-0.5">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <FaSearch className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-3">
                  Nu am gasit recomandari
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? "Incearca un termen de cautare diferit"
                    : "Nu exista recomandari disponibile momentan"
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] hover:from-[#009999] hover:to-[#00B3B3] text-white font-medium py-2 px-6 rounded-lg transition-all duration-300"
                  >
                    Arata toate recomandarile
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default AllRecommendations;