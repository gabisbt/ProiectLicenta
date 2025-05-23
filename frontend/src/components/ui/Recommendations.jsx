import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPersonalizedRecommendations } from "@/store/slices/recommendationSlice";
import Card from "@/custom-components/Card";
  import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Recommendations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { personalizedRecommendations, loading } = useSelector(
    (state) => state.recommendation
  );
  const { isAuthenticated, user } = useSelector((state) => state.user);

  useEffect(() => {
    if (isAuthenticated && user?.role === "Bidder") {
      dispatch(getPersonalizedRecommendations());
    }
  }, [dispatch, isAuthenticated, user]);

  // Nu afișăm nimic dacă utilizatorul nu este autentificat sau nu este Bidder
  // sau dacă nu există recomandări
  if (!isAuthenticated || user?.role !== "Bidder" || !personalizedRecommendations?.length) {
    return null;
  }

  return (
    <section className="w-full px-5 py-16 lg:pl-[320px] bg-gradient-to-b from-[#e0f7fa] via-[#b2ebf2] to-[#80deea] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#2bd6bf] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#00B3B3] opacity-5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h3 className="text-[#134e5e] text-4xl font-extrabold mb-4">
            Recommended <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf]">For You</span>
          </h3>
          <div className="w-20 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto"></div>
        </div>
        
        <div className="bg-white/30 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 relative overflow-hidden">
          {/* Elemente decorative de fundal */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-[#00B3B3]/10 to-[#2bd6bf]/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-[#2bd6bf]/10 to-[#00B3B3]/10 rounded-full blur-xl"></div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B3B3]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
              {personalizedRecommendations.slice(0, 4).map((auction) => (
                <motion.div
                  key={auction._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="recommendation-card-wrapper" // Adaugă o clasă pentru a putea stiliza container-ul
                >
                  {/* Adaugă un div wrapper cu stiluri specifice pentru a anula bordurile nedorite */}
                  <div className="overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0">
                    <Card
                      title={auction.title}
                      startTime={auction.startTime}
                      endTime={auction.endTime}
                      imgSrc={auction.image?.url}
                      startingBid={auction.startingBid}
                      currentBid={auction.currentBid}
                      id={auction._id}
                      description={auction.description}
                      className="border-0" // Adaugă această clasă pentru a suprascrie bordurile default
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {personalizedRecommendations.length > 4 && (
            <div className="mt-8 text-center relative z-10">
              <Link
                to="/recommendations"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] hover:from-[#009999] hover:to-[#00B3B3] shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                View All Recommendations
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Adaugă un stil global pentru a suprascrie bordurile din carduri doar în secțiunea de recomandări */}
      <style jsx>{`
        .recommendation-card-wrapper a,
        .recommendation-card-wrapper div {
          border-left: none !important;
          border-right: none !important;
        }
      `}</style>
    </section>
  );
};

export default Recommendations;