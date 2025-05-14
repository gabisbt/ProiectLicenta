import Spinner from "@/custom-components/Spinner";
import { getAuctionDetail } from "@/store/slices/auctionSlice";
import { placeBid, buyNowAuction } from "@/store/slices/bidSlice";
import socket from "../utils/socket";
// import socket from "@/utils/socket";
import {
  addToFavorites,
  removeFromFavorites
} from "@/store/slices/favoriteSlice";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FaGreaterThan,
  FaInfoCircle,
  FaGavel,
  FaBox,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaFileAlt,
  FaTrophy,
  FaMedal,
  FaAward,
  FaUser,
  FaClock,
  FaHeart,
  FaRegHeart,
  FaShoppingCart
} from "react-icons/fa";
import { RiAuctionFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PriceAdvisorBot from "@/components/ui/PriceAdvisorBot";


const AuctionItem = () => {
  const { id } = useParams();
  const { loading, auctionDetail, auctionBidders } = useSelector((state) => state.auction);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { loading: bidLoading } = useSelector((state) => state.bid);
  const [isLoaded, setIsLoaded] = useState(false);
  const favorites = useSelector((state) => state.favorites.favorites || []);
  const [isFavorite, setIsFavorite] = useState(false);
  const previousFavoriteStatus = useRef(null);

  const [realTimeRemaining, setRealTimeRemaining] = useState("");
  const socketConnected = useRef(false);
  const [amount, setAmount] = useState(0);
  const [bidError, setBidError] = useState("");

  const navigateTo = useNavigate();
  const dispatch = useDispatch();

  // Adauga o functie pentru a verifica daca utilizatorul este vanzator
  const isUserSeller = user?._id === auctionDetail?.createdBy;

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    if (!isAuthenticated) {
      navigateTo("/");
    }
    if (id) {
      dispatch(getAuctionDetail(id));
    }
  }, [isAuthenticated]);

  const handleBid = () => {
    const bidders = Array.isArray(auctionBidders) ? auctionBidders : [];
    const startingBid = auctionDetail?.startingBid ? parseFloat(auctionDetail.startingBid) : 0;

    const minBid = bidders.length > 0 && bidders[0]?.amount
      ? parseFloat(bidders[0].amount) + 1
      : startingBid;

    if (!amount || parseFloat(amount) < minBid) {
      setBidError(`Your bid must be at least ${minBid} RON`);
      return;
    }

    setBidError("");
    const formData = new FormData();
    formData.append("amount", amount);

    dispatch(placeBid(id, formData))
      .then((response) => {

        dispatch(getAuctionDetail(id));
        setAmount(0);
      })
      .catch((err) => {
        toast.error(err?.message || "Failed to place bid");
      });
  };

  //pentru sockets
  useEffect(() => {
    if (!socketConnected.current && id) {
      // Eliminam verificarea de rol, astfel incat toti utilizatorii autentificati sa se poata conecta
      socket.connect();
      socketConnected.current = true;

      // Alaturam utilizatorul in camera licitatiei
      socket.emit("joinAuction", id);

      if (user?._id) {
        socket.emit("authenticate", user._id);
      }

      // Ascultam pentru actualizari de oferte
      socket.on("bidUpdate", (data) => {
        if (data.auctionId === id) {
          // Reincarcam datele licitatiei pentru a reflecta noua oferta
          dispatch(getAuctionDetail(id));

          // Mesaj diferit pentru vanzator vs. licitator
          if (user?.role === "Auctioneer" && user?._id === auctionDetail?.createdBy) {
            toast.info(`${data.bidderName} a plasat o oferta de ${data.bidAmount} RON pe licitatia ta`);
          } else {
            toast.info(`${data.bidderName} a plasat o oferta de ${data.bidAmount} RON`);
          }
        }
      });

      // Ascultam pentru actualizari de timp
      socket.on("timeUpdate", (data) => {
        if (data.auctionId === id) {
          setRealTimeRemaining(data.formattedTime);
        }
      });

      // Ascultam pentru evenimentul de incheiere a licitatiei
      socket.on("auctionEnded", (data) => {
        if (data.auctionId === id) {
          dispatch(getAuctionDetail(id));
          if (data.buyNow) {
            const message = user?.role === "Auctioneer" && user?._id === auctionDetail?.createdBy
              ? `Licitatia ta s-a incheiat! ${data.buyerName || 'Un cumparator'} a achizitionat produsul folosind optiunea Buy Now`
              : `Licitatia s-a incheiat! ${data.buyerName || 'Un cumparator'} a cumparat produsul folosind optiunea Buy Now`;
            toast.info(message);
          } else {
            const message = user?.role === "Auctioneer" && user?._id === auctionDetail?.createdBy
              ? "Licitatia ta s-a incheiat!"
              : "Licitatia s-a incheiat!";
            toast.info(message);
          }
        }
      });

      // Curatare la demontarea componentei
      return () => {
        socket.emit("leaveAuction", id);
        socket.off("bidUpdate");
        socket.off("timeUpdate");
        socket.off("auctionEnded");
        socket.disconnect();
        socketConnected.current = false;
      };
    }
  }, [id, isAuthenticated, user?._id, user?.role, auctionDetail?.createdBy, dispatch]);

  useEffect(() => {
    if (auctionDetail?._id && Array.isArray(favorites)) {
      const isInFavorites = favorites.some(fav => fav && fav._id === auctionDetail._id);
      if (previousFavoriteStatus.current !== isInFavorites) {
        setIsFavorite(isInFavorites);
        previousFavoriteStatus.current = isInFavorites;
      }
    }
  }, [auctionDetail, favorites]);

  const handleToggleFavorite = useCallback(() => {
    if (!isAuthenticated || user?.role !== "Bidder") {
      toast.warning("Only bidders can add items to favorites!");
      return;
    }

    if (isFavorite) {
      dispatch(removeFromFavorites(auctionDetail._id));
      toast.success("Removed from favorites");
    } else {
      dispatch(addToFavorites(auctionDetail));
      toast.success("Added to favorites");
    }
  }, [isAuthenticated, user?.role, isFavorite, auctionDetail, dispatch]);

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

  // const getTimeRemaining = () => {
  //   if (!auctionDetail?.endTime) return "Time not available";

  //   try {
  //     const now = new Date();
  //     const endTime = new Date(auctionDetail.endTime);

  //     if (isNaN(endTime.getTime())) {
  //       return "Invalid end time";
  //     }

  //     if (now > endTime) return "Auction ended";

  //     const timeRemaining = endTime - now;
  //     const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  //     const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  //     const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  //     const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  //     if (days > 0) {
  //       return `${days}d ${hours}h ${minutes}m`;
  //     } else if (hours > 0) {
  //       return `${hours}h ${minutes}m ${seconds}s`;
  //     } else if (minutes > 0) {
  //       return `${minutes}m ${seconds}s`;
  //     } else {
  //       return `${seconds}s`;
  //     }
  //   } catch (error) {
  //     console.error("Error calculating time remaining:", error);
  //     return "Time calculation error";
  //   }
  // };

  const getTimeRemaining = () => {
    // Daca avem timpul real de la server, il folosim
    if (realTimeRemaining) {
      return realTimeRemaining;
    }

    // Altfel, folosim calculul local (codul tau original)
    if (!auctionDetail?.endTime) return "Time not available";

    try {
      const now = new Date();
      const endTime = new Date(auctionDetail.endTime);

      if (isNaN(endTime.getTime())) {
        return "Invalid end time";
      }

      if (now > endTime) return "Auction ended";

      const timeRemaining = endTime - now;
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    } catch (error) {
      console.error("Error calculating time remaining:", error);
      return "Time calculation error";
    }
  };

  const getAuctionStatus = () => {
    if (!auctionDetail?.startTime || !auctionDetail?.endTime) return "unknown";

    try {
      const now = Date.now();
      const startTime = new Date(auctionDetail.startTime);
      const endTime = new Date(auctionDetail.endTime);

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

  const isValidDate = (date) => {
    if (!date) return false;
    try {
      const d = new Date(date);
      return !isNaN(d.getTime());
    } catch {
      return false;
    }
  };

  const isAuctionActive = () => {
    if (!auctionDetail?.startTime || !auctionDetail?.endTime) return false;

    try {
      const now = Date.now();
      const startTime = new Date(auctionDetail.startTime).getTime();
      const endTime = new Date(auctionDetail.endTime).getTime();

      if (isNaN(startTime) || isNaN(endTime)) return false;

      return now >= startTime && now <= endTime;
    } catch {
      return false;
    }
  };

  const isAuctionUpcoming = () => {
    if (!auctionDetail?.startTime) return false;

    try {
      const now = Date.now();
      const startTime = new Date(auctionDetail.startTime).getTime();

      if (isNaN(startTime)) return false;

      return now < startTime;
    } catch {
      return false;
    }
  };

  const safeBidders = Array.isArray(auctionBidders) ? auctionBidders : [];
  useEffect(() => {
    if (auctionDetail) {
      console.log("Buy Now Button Debug:", {
        isActive: isAuctionActive(),
        buyNowPrice: !!auctionDetail?.buyNowPrice,
        buyNowPriceValue: auctionDetail?.buyNowPrice,
        validBidCondition: (!safeBidders.length ||
          parseFloat(safeBidders[0]?.amount || 0) < parseFloat(auctionDetail?.buyNowPrice || 0)),
        isAuthenticated: isAuthenticated,
        userRole: user?.role,
        shouldShow: showBuyNowButton() && isAuthenticated && user?.role === "Bidder"
      });
    }
  }, [auctionDetail, safeBidders, isAuthenticated, user]);

  const showBuyNowButton = () => {
    console.log("Buy Now debug:", {
      isActive: isAuctionActive(),
      price: auctionDetail?.buyNowPrice,
      bidders: safeBidders
    });

    // inlocuieste "return true" cu verificarea corecta
    return (
      isAuctionActive() &&
      auctionDetail?.buyNowPrice &&
      parseFloat(auctionDetail.buyNowPrice) > 0 &&
      (!safeBidders.length ||
        parseFloat(safeBidders[0]?.amount || 0) < parseFloat(auctionDetail.buyNowPrice))
    );
  };

  const handleBuyNow = () => {
    if (!isAuthenticated || user?.role !== "Bidder") {
      toast.warning("Only bidders can purchase items!");
      return;
    }

    if (window.confirm(`Are you sure you want to buy this item now for ${auctionDetail.buyNowPrice} RON?`)) {
      dispatch(buyNowAuction(id))
        // inlocuieste .unwrap().then cu un simplu .then
        .then((response) => {
          if (response?.success) {
            toast.success("Item purchased successfully!");
            dispatch(getAuctionDetail(id));
          }
        })
        .catch((err) => {
          toast.error(err?.message || "Failed to purchase item");
        });
    }
  };

  return (
    <section className="w-full h-auto px-5 pt-20 lg:pl-[320px] flex flex-col min-h-screen bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa] relative overflow-hidden pb-10">
      <div className={`max-w-7xl mx-auto w-full transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex flex-wrap gap-2 items-center mb-6 bg-white/50 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm">
          <Link
            to="/"
            className="text-[#00B3B3] font-medium transition-all duration-300 hover:text-[#2bd6bf] flex items-center gap-1"
          >
            <FaInfoCircle className="text-sm" /> Home
          </Link>
          <FaGreaterThan className="text-gray-400 text-xs" />
          <Link
            to="/auctions"
            className="text-[#00B3B3] font-medium transition-all duration-300 hover:text-[#2bd6bf] flex items-center gap-1"
          >
            <FaGavel className="text-sm" /> Auctions
          </Link>
          <FaGreaterThan className="text-gray-400 text-xs" />
          <p className="text-gray-600 truncate max-w-[250px]">{auctionDetail?.title || "Auction Details"}</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 relative overflow-hidden mb-8">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-[#00B3B3]/10 to-[#2bd6bf]/10 rounded-full blur-xl"></div>

                <div className="flex flex-col md:flex-row gap-6 mb-8 relative z-10">
                  <div className="w-full md:w-60 h-60 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-md overflow-hidden border border-gray-100 flex items-center justify-center p-2">
                    {auctionDetail?.image?.url ? (
                      <img
                        src={auctionDetail.image.url}
                        alt={auctionDetail.title || "Auction item"}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/400x400?text=No+Image";
                        }}
                      />
                    ) : (
                      <FaBox className="text-gray-300 text-7xl" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <h1 className="text-[#134e5e] text-2xl md:text-3xl font-bold">
                        {auctionDetail?.title || "Auction Item"}
                      </h1>

                      {isAuthenticated && user.role === "Bidder" && auctionDetail?._id && (
                        <button
                          onClick={handleToggleFavorite}
                          className="focus:outline-none transition-transform transform hover:scale-110"
                          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          {isFavorite ? (
                            <FaHeart className="text-red-500 text-2xl" />
                          ) : (
                            <FaRegHeart className="text-gray-400 text-2xl hover:text-red-500" />
                          )}
                        </button>
                      )}

                      {isValidDate(auctionDetail?.startTime) &&
                        isValidDate(auctionDetail?.endTime) &&
                        getAuctionStatus() !== "unknown" && (
                          <div className="flex items-center gap-2">
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



                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#00B3B3]/10 p-2 rounded-full">
                          <FaBox className="text-[#00B3B3]" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Condition</div>
                          <div className="font-semibold text-[#134e5e]">{auctionDetail?.condition || "Not specified"}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="bg-[#00B3B3]/10 p-2 rounded-full">
                          <FaMoneyBillWave className="text-[#00B3B3]" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Starting Bid</div>
                          <div className="font-semibold text-[#134e5e]">
                            {auctionDetail?.startingBid ? `${auctionDetail.startingBid} RON` : "Not specified"}
                          </div>
                        </div>
                      </div>



                      {auctionDetail?.buyNowPrice && (
                        <div className="flex items-center gap-2">
                          <div className="bg-[#00B3B3]/10 p-2 rounded-full">
                            <FaShoppingCart className="text-[#00B3B3]" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Buy Now Price</div>
                            <div className="font-semibold text-[#134e5e]">
                              {`${auctionDetail.buyNowPrice} RON`}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <div className="bg-[#00B3B3]/10 p-2 rounded-full">
                          <FaCalendarAlt className="text-[#00B3B3]" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Start Time</div>
                          <div className="font-semibold text-[#134e5e]">{formatDate(auctionDetail?.startTime)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="bg-[#00B3B3]/10 p-2 rounded-full">
                          <FaCalendarAlt className="text-[#00B3B3]" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">End Time</div>
                          <div className="font-semibold text-[#134e5e]">{formatDate(auctionDetail?.endTime)}</div>
                        </div>
                      </div>
                    </div>

                    {getAuctionStatus() === "active" && (
                      <div className="mt-6 bg-gradient-to-r from-[#00B3B3]/5 to-[#2bd6bf]/5 rounded-xl p-4 border border-[#00B3B3]/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FaClock className="text-[#00B3B3]" />
                            <span className="text-gray-700 font-medium">Time Remaining:</span>
                          </div>
                          <span className="text-[#00B3B3] font-bold">{getTimeRemaining()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative z-10 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-2 rounded-full">
                      <FaFileAlt />
                    </div>
                    <h2 className="text-[#134e5e] text-xl font-semibold">Item Description</h2>
                  </div>

                  <div className="bg-[#00B3B3]/5 rounded-xl p-6 border border-[#00B3B3]/10">
                    {auctionDetail?.description ? (
                      <div className="space-y-3">
                        {auctionDetail.description.split(". ")
                          .filter(Boolean)
                          .map((element, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="rounded-full w-2 h-2 bg-[#00B3B3] mt-2 flex-shrink-0"></div>
                              <p className="text-gray-700">{element.trim()}</p>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No description provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-1">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-white/50 relative mb-8">
                <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] p-4">
                  <h2 className="text-white font-semibold text-xl flex items-center gap-2">
                    <FaGavel /> Current Bids
                  </h2>
                </div>

                <div className="p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                  {safeBidders.length > 0 && isAuctionActive() ? (
                    <div className="space-y-4">
                      {safeBidders.map((element, index) => (
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
                                alt={element.userName || "User"}
                                className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://placehold.co/100x100?text=User";
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <FaUser className="text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-800">{element.userName || "Anonymous"}</p>
                              <p className="text-[#00B3B3] font-semibold">
                                {element.amount ? `${element.amount} RON` : "N/A"}
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
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      {isAuctionUpcoming() ? (
                        <>
                          <div className="bg-blue-100/50 p-5 rounded-full mb-4">
                            <FaClock className="text-blue-500 text-4xl" />
                          </div>
                          <h3 className="text-lg font-semibold text-blue-800 mb-2">Auction Not Started</h3>
                          <p className="text-gray-600 max-w-xs">
                            This auction will start on {formatDate(auctionDetail?.startTime)}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="bg-gray-100/50 p-5 rounded-full mb-4">
                            <FaGavel className="text-gray-500 text-4xl" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {getAuctionStatus() === "active" ? "No Bids Yet" : "Auction Ended"}
                          </h3>
                          {getAuctionStatus() === "ended" && (
                            <p className="text-gray-600 max-w-xs">
                              This auction ended on {formatDate(auctionDetail?.endTime)}
                            </p>
                          )}
                          {getAuctionStatus() === "ended" && safeBidders.length > 0 ? (
                            <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-xl w-full">
                              <p className="text-green-800 font-medium">Winner:</p>
                              <div className="flex items-center dark:text-gray-900 gap-3 mt-2">
                                {safeBidders[0].profileImage ? (
                                  <img
                                    src={safeBidders[0].profileImage}
                                    alt={safeBidders[0].userName || "Winner"}
                                    className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://placehold.co/100x100?text=User";
                                    }}
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                    <FaUser className="text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{safeBidders[0].userName || "Anonymous"}</p>
                                  <p className="text-green-700 font-semibold">
                                    {safeBidders[0].amount ? `${safeBidders[0].amount} RON` : "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : getAuctionStatus() === "ended" ? (
                            <p className="text-yellow-600 font-medium mt-4">No bids were placed on this auction.</p>
                          ) : (
                            <p className="text-blue-600 font-medium mt-4">
                              Be the first to place a bid on this auction!
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {showBuyNowButton() && isAuthenticated && user?.role === "Bidder" && (
                  <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-[#134e5e] to-[#0e3c49]">
                    <button
                      onClick={handleBuyNow}
                      className="w-full bg-[#00B3B3] hover:bg-[#009999] text-white font-medium rounded-xl py-3 transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                      disabled={bidLoading}
                    >
                      <FaShoppingCart /> Buy Now for {auctionDetail.buyNowPrice} RON
                    </button>
                    <p className="text-white/70 text-xs text-center mt-2">
                      Purchase this item immediately at the fixed price.
                    </p>
                  </div>
                )}

                <div className={`p-4 border-t border-gray-100 ${getAuctionStatus() === "active"
                  ? 'bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf]'
                  : 'bg-gray-100'
                  }`}>
                  {isAuctionActive() ? (
                    <div className="flex flex-col gap-4">
                      <p className="text-white font-medium">
                        Place Your Bid
                        {safeBidders.length > 0 && safeBidders[0]?.amount && (
                          <span className="block text-xs text-white/80 mt-1">
                            Current highest bid: {safeBidders[0].amount} RON
                          </span>
                        )}
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="relative flex-grow">
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">RON</span>
                          <input
                            type="number"
                            className="w-full py-3 px-4 pr-14 bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300 text-gray-800 font-medium text-lg"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={`Min ${safeBidders.length > 0 && safeBidders[0]?.amount
                              ? parseFloat(safeBidders[0].amount) + 1
                              : auctionDetail?.startingBid || 0}`}
                          />
                        </div>
                        <button
                          className="p-4 bg-[#134e5e] hover:bg-[#0e3c49] text-white rounded-xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-[#134e5e]"
                          onClick={handleBid}
                          disabled={bidLoading}
                        >
                          {bidLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <RiAuctionFill className="text-xl" />
                          )}
                        </button>
                      </div>

                      {bidError && (
                        <p className="text-red-100 text-sm mt-1">{bidError}</p>
                      )}

                      <p className="text-white/80 text-sm">
                        By placing a bid, you agree to our terms and conditions for auction participation.
                      </p>
                    </div>
                  ) : isAuctionUpcoming() ? (
                    <div className="text-center py-4">
                      <p className="text-[#134e5e] font-semibold text-xl">
                        Auction has not started yet!
                      </p>
                      <p className="text-gray-600 text-sm mt-2">
                        Come back on {formatDate(auctionDetail?.startTime)} to place your bid.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-[#134e5e] font-semibold text-xl">
                        Auction has ended!
                      </p>
                      <p className="text-gray-600 text-sm mt-2">
                        This auction ended on {formatDate(auctionDetail?.endTime)}.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Purchased with Buy Now notification */}
              {getAuctionStatus() === "ended" && auctionDetail?.boughtNow && (
                <div className="bg-green-50 border border-green-200 px-4 py-3 rounded-xl mb-8 shadow-sm">
                  <div className="flex items-center gap-2">
                    <FaShoppingCart className="text-green-600" />
                    <p className="text-green-800 font-medium">
                      This item was purchased using the Buy Now option
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {auctionDetail && !loading && (
        <div>
          {/* Debug info - remove in production */}
          {user ? (
            <div className="hidden">User role: {user.role}</div>
          ) : (
            <div className="hidden">User not loaded</div>
          )}

          {/* Actual chatbot that only displays for Bidders on active or upcoming auctions */}
          {user &&
            user.role === "Bidder" &&
            getAuctionStatus() !== "ended" && (
              <PriceAdvisorBot
                auctionDetail={auctionDetail}
                currentBid={auctionBidders?.[0]?.amount || auctionDetail?.startingBid}
              />
            )}
        </div>
      )}

      {auctionDetail && !loading && user && user.role === "Bidder" && (
        <div className="fixed top-24 right-4 bg-white p-2 z-50 text-sm border">
          Data check: {auctionDetail.title}, {auctionBidders?.[0]?.amount || auctionDetail?.startingBid} RON
        </div>
      )}

    </section>
  );
};

export default AuctionItem;