import CardTwo from "@/custom-components/CardTwo";
import Spinner from "@/custom-components/Spinner";
import { getMyAuctionItems, republishAuction } from "@/store/slices/auctionSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { FaPlus, FaBox, FaClock, FaSort, FaSortAmountDown, FaSortAmountUp, FaRedo, FaCalendarAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createPortal } from "react-dom";

const ViewMyAuctions = () => {
  const { myAuctions, loading } = useSelector((state) => state.auction);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sortBy, setSortBy] = useState("endTime");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [republishingId, setRepublishingId] = useState(null);
  const [isRepublishModalOpen, setIsRepublishModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [republishStartTime, setRepublishStartTime] = useState(new Date());
  const [republishEndTime, setRepublishEndTime] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7); 
    return date;
  });

  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || user.role !== "Auctioneer") {
      navigateTo("/");
    }
    dispatch(getMyAuctionItems());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    let results = [...myAuctions];
  
    results.sort((a, b) => {
        let aValue, bValue;
        
        if (sortBy === "startingBid") {
            aValue = parseFloat(a.startingBid);
            bValue = parseFloat(b.startingBid);
        } else if (sortBy === "endTime") {
            aValue = new Date(a.endTime);
            bValue = new Date(b.endTime);
        } else if (sortBy === "title") {
            aValue = a.title;
            bValue = b.title;
        }
        
        if (sortOrder === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    setFilteredAuctions(results);
  }, [myAuctions, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleRepublishOpen = (id) => {
    setRepublishingId(id);

    const now = new Date();
    setRepublishStartTime(now);
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    setRepublishEndTime(endDate);
    
    setIsRepublishModalOpen(true);
  };

  const handleRepublishClose = () => {
    setIsRepublishModalOpen(false);
    setRepublishingId(null);
  };

  const handleRepublishSubmit = async () => {
    try {
      if (republishStartTime >= republishEndTime) {
        toast.error("End time must be after start time");
        return;
      }
      
      setIsSubmitting(true);

      await dispatch(republishAuction({ 
        auctionId: republishingId, 
        startTime: republishStartTime,
        endTime: republishEndTime
      })).unwrap();
      
      toast.success("Auction republished successfully!");
      handleRepublishClose();
      dispatch(getMyAuctionItems());
    } catch (error) {
      toast.error(error?.message || "Failed to republish auction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="w-full h-auto px-5 pt-20 lg:pl-[320px] flex flex-col min-h-screen bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa] relative overflow-hidden">
        <div className="absolute top-20 right-0 w-72 h-72 bg-[#2bd6bf] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#00B3B3] opacity-5 rounded-full blur-3xl"></div>

        <div className={`max-w-7xl mx-auto w-full transform transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-8">
            <div className="w-16 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto mb-4 rounded-full"></div>
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-4xl font-extrabold mb-2 md:text-5xl lg:text-6xl drop-shadow-lg">
              My Auctions
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] mx-auto mt-4 rounded-full"></div>
            <p className="text-gray-700 mt-4 max-w-2xl mx-auto">
              Manage and monitor all the auctions you have created.
            </p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <Link 
              to="/create-auction"
              className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] hover:from-[#2bd6bf] hover:to-[#00B3B3] text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-500 transform hover:scale-[1.02] flex items-center gap-2"
            >
              <FaPlus /> Create New Auction
            </Link>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
              >
                <option value="endTime">End Time</option>
                <option value="startingBid">Starting Bid</option>
                <option value="title">Title</option>
              </select>

              <button 
                onClick={toggleSortOrder}
                className="bg-white/70 border border-gray-200 p-2 rounded-xl hover:bg-[#00B3B3]/10 transition-all duration-300"
                title={sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
              >
                {sortOrder === "asc" ? (
                  <FaSortAmountUp className="text-[#00B3B3]" />
                ) : (
                  <FaSortAmountDown className="text-[#00B3B3]" />
                )}
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner />
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  You have <span className="font-semibold text-[#00B3B3]">{filteredAuctions.length}</span> {filteredAuctions.length === 1 ? 'auction' : 'auctions'}
                </p>
              </div>
            
              {filteredAuctions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                  {filteredAuctions.map((element) => (
                    <CardTwo
                      title={element.title}
                      startingBid={element.startingBid}
                      endTime={element.endTime}
                      startTime={element.startTime}
                      imgSrc={element.image?.url}
                      id={element._id}
                      key={element._id}
                      onRepublish={handleRepublishOpen}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 shadow-md">
                  <div className="bg-[#00B3B3]/10 p-6 rounded-full mb-6">
                    <FaBox className="text-[#00B3B3] text-5xl" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#134e5e] mb-3">No Auctions Found</h3>
                  <p className="text-gray-600 text-center max-w-md mb-8">
                    You haven't created any auctions yet. Start by creating your first auction to begin selling your items.
                  </p>
                  <Link 
                    to="/create-auction"
                    className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] hover:from-[#2bd6bf] hover:to-[#00B3B3] text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-500 transform hover:scale-[1.02] flex items-center gap-2"
                  >
                    <FaPlus /> Create Your First Auction
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {isRepublishModalOpen && createPortal(
        <div className="fixed inset-0 flex items-start justify-center z-[1000] p-4 animate-fadeIn pt-32">
          <div 
            className="fixed inset-0" 
            onClick={handleRepublishClose}
          ></div>
          

          <div className="bg-white/95 rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all duration-300 border border-white/50 relative overflow-hidden z-10">

            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-[#00B3B3]/10 to-[#2bd6bf]/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-r from-[#2bd6bf]/10 to-[#00B3B3]/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="mb-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-[#00B3B3]/20 to-[#2bd6bf]/20 rounded-full flex items-center justify-center mx-auto mb-5 p-5 shadow-inner">
                  <FaRedo className="text-[#00B3B3] text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf]">
                  Republish Auction
                </h3>
                <div className="w-16 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto my-3 rounded-full"></div>
                <p className="text-gray-600 mt-2">
                  Let's republish auction with the same details but new starting and ending time.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-8">
                <div className="flex flex-col gap-2 group">
                  <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300 font-medium">
                    <FaCalendarAlt className="text-[#00B3B3]" /> Auction Start Time
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={republishStartTime}
                      onChange={(date) => setRepublishStartTime(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="w-full py-3 px-4 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 shadow-sm"
                      placeholderText="Select start date and time"
                      required
                      minDate={new Date()}
                    />
                    <div className="absolute right-3 top-3 text-[#00B3B3] pointer-events-none">
                      <FaClock />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 group">
                  <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300 font-medium">
                    <FaCalendarAlt className="text-[#00B3B3]" /> Auction End Time
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={republishEndTime}
                      onChange={(date) => setRepublishEndTime(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="w-full py-3 px-4 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 shadow-sm"
                      placeholderText="Select end date and time"
                      required
                      minDate={republishStartTime || new Date()}
                    />
                    <div className="absolute right-3 top-3 text-[#00B3B3] pointer-events-none">
                      <FaClock />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#00B3B3]/5 border border-[#00B3B3]/20 rounded-lg p-3 mb-6">
                <p className="text-sm text-[#00B3B3] flex items-start gap-2">
                  <FaClock className="mt-0.5 flex-shrink-0" /> 
                  <span>We recommend auctions to last between 3-7 days for optimal bidding activity.</span>
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handleRepublishClose}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-all duration-300 hover:shadow-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRepublishSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Republishing...
                    </>
                  ) : (
                    <>
                      <FaRedo /> Republish
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ViewMyAuctions;