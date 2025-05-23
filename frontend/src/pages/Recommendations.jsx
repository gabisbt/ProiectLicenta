import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPersonalizedRecommendations } from "@/store/slices/recommendationSlice";
import Card from "@/custom-components/Card";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const Recommendations = () => {
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const { personalizedRecommendations, loading } = useSelector(
    (state) => state.recommendation
  );
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigateTo("/login");
      return;
    }

    if (user && user.role !== "Bidder") {
      navigateTo("/");
      return;
    }

    dispatch(getPersonalizedRecommendations());
  }, [dispatch, isAuthenticated, user, navigateTo]);

  useEffect(() => {
    if (personalizedRecommendations) {
      setFilteredRecommendations(
        personalizedRecommendations.filter((item) =>
          item?.title?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [personalizedRecommendations, searchTerm]);

  return (
    <section className="w-full h-auto px-5 pt-20 lg:pl-[320px] pb-10 flex flex-col min-h-screen bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa]">
      <div className="max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Recomandări pentru tine
        </h1>

        {/* Caută în recomandări */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Caută în recomandări..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent"
            />
            <FaSearch className="absolute top-3 left-3 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B3B3]"></div>
          </div>
        ) : (
          <>
            {filteredRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredRecommendations.map((auction) => (
                  <Link key={auction._id} to={`/auction-item/${auction._id}`}>
                    <Card
                      title={auction.title}
                      description={auction.description}
                      imgSrc={auction.image.url}
                      startingBid={auction.startingBid}
                      startTime={auction.startTime}
                      endTime={auction.endTime}
                      currentBid={auction.currentBid}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <img
                  src="/noauction.jpg"
                  alt="No recommendations"
                  className="w-64 mx-auto mb-6 opacity-80"
                />
                <h3 className="text-xl font-medium text-gray-700">
                  Nu am găsit recomandări care să se potrivească căutării tale
                </h3>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 bg-[#00B3B3] hover:bg-[#009999] text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Arată toate recomandările
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

export default Recommendations;