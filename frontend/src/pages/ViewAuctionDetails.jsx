import Spinner from "@/custom-components/Spinner";
import { getAuctionDetail } from "@/store/slices/auctionSlice";
import React, { useEffect, useState } from "react";
import {
  FaGreaterThan,
  FaInfoCircle,
  FaBox,
  FaMoneyBillWave,
  FaFileAlt,
  FaCalendarAlt,
  FaGavel,
  FaTrophy,
  FaMedal,
  FaAward,
  FaUser,
  FaClock
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";

const ViewAuctionDetails = () => {
  const { id } = useParams();
  const { loading, auctionDetail, auctionBidders } = useSelector((state) => state.auction);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const [isLoaded, setIsLoaded] = useState(false);

  const navigateTo = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated) {
      navigateTo("/");
    }
    if (id) {
      dispatch(getAuctionDetail(id));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (user) {
      console.log("Current user role:", user.role);
    }
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";

    try {
      if (typeof dateString !== "string" && !(dateString instanceof Date)) {
        return "Invalid date format";
      }

      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };

  const getAuctionStatus = () => {
    // Verifica mai intai daca auctionDetail și proprietatile sale sunt disponibile
    if (!auctionDetail || !auctionDetail.startTime || !auctionDetail.endTime) {
      return "unknown";
    }

    try {
      const now = Date.now();
      const startTime = new Date(auctionDetail.startTime);
      const endTime = new Date(auctionDetail.endTime);

      // Verifica daca datele sunt valide
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return "unknown";
      }

      if (now < startTime.getTime()) {
        return "upcoming";
      } else if (now > endTime.getTime()) {
        return "ended";
      } else {
        return "active";
      }
    } catch (error) {
      console.error("Error determining auction status:", error);
      return "unknown";
    }
  };

  return (
    <>
      <section className="w-full h-auto px-5 pt-20 lg:pl-[320px] flex flex-col min-h-screen bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa] relative overflow-hidden pb-10">
        <div className={`max-w-7xl mx-auto w-full transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Breadcrumb */}
          <div className="flex flex-wrap gap-2 items-center mb-6 bg-white/50 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm">
            <Link
              to="/"
              className="text-[#00B3B3] font-medium transition-all duration-300 hover:text-[#2bd6bf] flex items-center gap-1"
            >
              <FaInfoCircle className="text-sm" /> Home
            </Link>
            <FaGreaterThan className="text-gray-400 text-xs" />
            <Link
              to="/view-my-auctions"
              className="text-[#00B3B3] font-medium transition-all duration-300 hover:text-[#2bd6bf] flex items-center gap-1"
            >
              <FaGavel className="text-sm" /> My Auctions
            </Link>
            <FaGreaterThan className="text-gray-400 text-xs" />
            <p className="text-gray-600 truncate max-w-[250px]">{auctionDetail.title}</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column - Auction Details */}
              <div className="xl:col-span-2">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 relative overflow-hidden mb-8">
                  {/* Decorative elements */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-[#00B3B3]/10 to-[#2bd6bf]/10 rounded-full blur-xl"></div>

                  {/* Auction Header */}
                  <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 relative z-10">
                    <div className="w-full md:w-60 h-60 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-md overflow-hidden border border-gray-100 flex items-center justify-center p-2">
                      {auctionDetail.image?.url ? (
                        <img
                          src={auctionDetail.image?.url}
                          alt={auctionDetail.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <FaBox className="text-gray-300 text-7xl" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h1 className="text-[#134e5e] text-2xl md:text-3xl font-bold mb-4">
                        {auctionDetail.title}
                      </h1>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-[#00B3B3]/10 p-2 rounded-full">
                            <FaBox className="text-[#00B3B3]" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Condition</div>
                            <div className="font-semibold text-[#134e5e]">{auctionDetail.condition}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="bg-[#00B3B3]/10 p-2 rounded-full">
                            <FaMoneyBillWave className="text-[#00B3B3]" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Starting Bid</div>
                            <div className="font-semibold text-[#134e5e]">{auctionDetail.startingBid} RON</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="bg-[#00B3B3]/10 p-2 rounded-full">
                            <FaCalendarAlt className="text-[#00B3B3]" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Start Time</div>
                            <div className="font-semibold text-[#134e5e]">{formatDate(auctionDetail.startTime)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="bg-[#00B3B3]/10 p-2 rounded-full">
                            <FaCalendarAlt className="text-[#00B3B3]" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">End Time</div>
                            <div className="font-semibold text-[#134e5e]">{formatDate(auctionDetail.endTime)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {auctionDetail.startTime && auctionDetail.endTime && (
                        <div className="mt-6">
                          {getAuctionStatus() === "upcoming" && (
                            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                              <FaClock /> Upcoming
                            </div>
                          )}
                          {getAuctionStatus() === "active" && (
                            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                              <FaGavel /> Active
                            </div>
                          )}
                          {getAuctionStatus() === "ended" && (
                            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                              <FaClock /> Ended
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="relative z-10 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-2 rounded-full">
                        <FaFileAlt />
                      </div>
                      <h2 className="text-[#134e5e] text-xl font-semibold">Item Description</h2>
                    </div>

                    <div className="bg-[#00B3B3]/5 rounded-xl p-6 border border-[#00B3B3]/10">
                      {auctionDetail.description ? (
                        <div className="space-y-3">
                          {auctionDetail.description.split(". ").filter(Boolean).map((element, index) => {
                            return (
                              <div key={index} className="flex items-start gap-2">
                                <div className="rounded-full w-2 h-2 bg-[#00B3B3] mt-2 flex-shrink-0"></div>
                                <p className="text-gray-700">{element.trim()}</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No description provided</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Bidders */}
              <div className="xl:col-span-1">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-white/50 relative mb-8">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] p-4">
                    <h2 className="text-white font-semibold text-xl flex items-center gap-2">
                      <FaGavel /> Bidders
                    </h2>
                  </div>

                  {/* Bidder List */}
                  <div className="p-4 max-h-[600px] overflow-y-auto">
                    {auctionBidders && auctionBidders.length > 0 &&
                      new Date(auctionDetail.startTime) < Date.now() &&
                      new Date(auctionDetail.endTime) > Date.now() ? (
                      <div className="space-y-4">
                        {auctionBidders.map((element, index) => {
                          return (
                            <div
                              key={index}
                              className={`rounded-xl p-3 flex items-center justify-between border ${index === 0 ? 'bg-green-50 border-green-200' :
                                index === 1 ? 'bg-blue-50 border-blue-200' :
                                  index === 2 ? 'bg-yellow-50 border-yellow-200' :
                                    'bg-gray-50 border-gray-200'
                                } transition-all hover:shadow-md`}
                            >
                              <div className="flex items-center gap-3">
                                {element.profileImage ? (
                                  <img
                                    src={element.profileImage}
                                    alt={element.userName}
                                    className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                    <FaUser className="text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {element.userName}
                                  </p>
                                  <p className="text-[#00B3B3] font-semibold">
                                    {element.amount} RON
                                  </p>
                                </div>
                              </div>
                              {index === 0 ? (
                                <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
                                  <FaTrophy className="text-green-600" />
                                  <span className="text-green-600 font-semibold">1st</span>
                                </div>
                              ) : index === 1 ? (
                                <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
                                  <FaMedal className="text-blue-600" />
                                  <span className="text-blue-600 font-semibold">2nd</span>
                                </div>
                              ) : index === 2 ? (
                                <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                                  <FaAward className="text-yellow-600" />
                                  <span className="text-yellow-600 font-semibold">3rd</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                                  <span className="text-gray-600 font-semibold">{index + 1}th</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        {Date.now() < new Date(auctionDetail.startTime) ? (
                          <>
                            <div className="bg-blue-100/50 p-5 rounded-full mb-4">
                              <FaClock className="text-blue-500 text-4xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">Auction Not Started</h3>
                            <p className="text-gray-600 max-w-xs">
                              This auction will start on {formatDate(auctionDetail.startTime)}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="bg-gray-100/50 p-5 rounded-full mb-4">
                              <FaGavel className="text-gray-500 text-4xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Auction without bids</h3>
                            <p className="text-gray-600 max-w-xs">
                              This auction will end on {formatDate(auctionDetail.endTime)}
                            </p>
                            {auctionBidders && auctionBidders.length > 0 ? (
                              <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-xl w-full">
                                <p className="text-green-800 font-medium">Winner:</p>
                                <div className="flex items-center gap-3 mt-2">
                                  {auctionBidders[0].profileImage ? (
                                    <img
                                      src={auctionBidders[0].profileImage}
                                      alt={auctionBidders[0].userName}
                                      className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                      <FaUser className="text-gray-400" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium">{auctionBidders[0].userName}</p>
                                    <p className="text-green-700 font-semibold">{auctionBidders[0].amount} RON</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-yellow-600 font-medium mt-4">No bids were placed on this auction.</p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </section>
    </>
  );
};

export default ViewAuctionDetails;