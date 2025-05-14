import Spinner from "@/custom-components/Spinner";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaPaypal,
  FaUniversity,
  FaSave,
  FaEdit,
  FaSignOutAlt,
  FaTrophy,
  FaCreditCard,
  FaUserCircle,
  FaHistory,
  FaGavel,
  FaArrowLeft,
  FaAward,
  FaSpinner,
  FaFileInvoice,
  FaDownload,
} from "react-icons/fa";
import { logout } from "@/store/slices/userSlice";
import { generateAuctionInvoice } from "../utils/pdfGenerator";

const UserProfile = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.user);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAuctionHistory, setShowAuctionHistory] = useState(false);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [isLoadingAuctions, setIsLoadingAuctions] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState({
    userName: user?.userName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    bankName: user?.paymentMethods?.bankTransfer?.bankName || "",
    bankAccountNumber: user?.paymentMethods?.bankTransfer?.bankAccountNumber || "",
    bankAccountName: user?.paymentMethods?.bankTransfer?.bankAccountName || "",
    paypalEmail: user?.paymentMethods?.paypal?.paypalEmail || "",
    auctionsWon: user?.auctionsWon || "",
    moneySpent: user?.moneySpent || "",
    unpaidCommission: user?.unpaidCommission || "",
  });

  useEffect(() => {
    setIsLoaded(true);
    if (!isAuthenticated) {
      navigateTo("/");
    }
  }, [isAuthenticated]);

  const fetchWonAuctions = async () => {
    if (!isAuthenticated || user.role !== "Bidder") return;

    setIsLoadingAuctions(true);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true,
      };
      
      console.log("Fetching won auctions...");
      const response = await axios.get(`http://localhost:5000/api/v1/auctionitem/won-auctions`, config);
      console.log("Response received:", response.data);
      
      if (response.data.success) {
        setWonAuctions(response.data.wonAuctions);
      } else {
        toast.error("Failed to fetch won auctions");
      }
    } catch (error) {
      console.error("Error fetching won auctions:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to load won auctions");
    } finally {
      setIsLoadingAuctions(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSaveChanges = () => {
    console.log("Saved details:", editedDetails);
    setIsEditing(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigateTo("/login");
  };

  const toggleAuctionHistory = () => {
    if (!showAuctionHistory) {
      fetchWonAuctions();
    }
    setShowAuctionHistory(!showAuctionHistory);
  };

  return (
    <>
      <section className="w-full ml-0 m-0 px-5 pt-20 lg:pl-[320px] flex flex-col min-h-screen py-4 justify-start bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa] relative overflow-hidden">
        <div className="absolute top-20 right-0 w-72 h-72 bg-[#2bd6bf] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#00B3B3] opacity-5 rounded-full blur-3xl"></div>

        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <Spinner />
          </div>
        ) : (
          <div className={`max-w-5xl mx-auto w-full transition-all duration-1000 pb-12 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div className="text-center mb-8">
              <div className="w-16 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto mb-4 rounded-full"></div>
              <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-4xl font-extrabold mb-2 md:text-5xl lg:text-6xl drop-shadow-lg">
                Your Profile
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] mx-auto mt-4 rounded-full"></div>
              <p className="text-gray-700 mt-4 max-w-2xl mx-auto">
                Manage your personal information and account settings.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-[#00B3B3]/10 to-[#2bd6bf]/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-r from-[#2bd6bf]/10 to-[#00B3B3]/10 rounded-full blur-xl"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 mb-10">
                <div className="relative group">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-[#2bd6bf] to-[#00B3B3] p-1 shadow-lg">
                    {user?.profileImage?.url ? (
                      <img
                        src={user.profileImage.url}
                        alt={user.userName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full flex items-center justify-center bg-gray-100">
                        <FaUserCircle className="text-gray-300 text-6xl" />
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-[#2bd6bf] text-white p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FaUser size={20} />
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#134e5e] mb-2">
                    {user.userName}
                  </h2>
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-[#00B3B3]/10 to-[#2bd6bf]/10 border border-[#00B3B3]/20 text-[#00B3B3] font-medium">
                    {user.role === "Auctioneer" ? (
                      <>
                        <FaUniversity /> Auctioneer
                      </>
                    ) : (
                      <>
                        <FaMoneyBillWave /> Bidder
                      </>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2 flex items-center justify-center md:justify-start gap-2">
                    <FaCalendarAlt className="text-[#00B3B3]" /> Member since:{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="ml-auto">
                  <button
                    className={`py-3 px-6 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-md ${
                      isEditing
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg"
                        : "bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white hover:shadow-lg"
                    }`}
                    onClick={isEditing ? handleSaveChanges : handleEditToggle}
                  >
                    {isEditing ? (
                      <>
                        <FaSave /> Save Changes
                      </>
                    ) : (
                      <>
                        <FaEdit /> Edit Profile
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-2 rounded-full">
                    <FaUser />
                  </div>
                  <h2 className="text-[#134e5e] text-xl font-semibold">Personal Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/70 rounded-xl p-6 shadow-sm border border-white/80">
                  <div className="flex flex-col gap-2 group">
                    <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                      <FaUser className="text-[#00B3B3]" /> Username
                    </label>
                    <input
                      type="text"
                      name="userName"
                      value={editedDetails.userName}
                      onChange={handleInputChange}
                      className={`w-full py-3 px-4 bg-white/70 border ${
                        isEditing ? "border-gray-200" : "border-gray-100 bg-gray-50"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 ${
                        isEditing ? "" : "cursor-not-allowed"
                      }`}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex flex-col gap-2 group">
                    <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                      <FaEnvelope className="text-[#00B3B3]" /> Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editedDetails.email}
                      onChange={handleInputChange}
                      className={`w-full py-3 px-4 bg-white/70 border ${
                        isEditing ? "border-gray-200" : "border-gray-100 bg-gray-50"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 ${
                        isEditing ? "" : "cursor-not-allowed"
                      }`}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex flex-col gap-2 group">
                    <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                      <FaPhone className="text-[#00B3B3]" /> Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={editedDetails.phone}
                      onChange={handleInputChange}
                      className={`w-full py-3 px-4 bg-white/70 border ${
                        isEditing ? "border-gray-200" : "border-gray-100 bg-gray-50"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 ${
                        isEditing ? "" : "cursor-not-allowed"
                      }`}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex flex-col gap-2 group">
                    <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                      <FaMapMarkerAlt className="text-[#00B3B3]" /> Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={editedDetails.address}
                      onChange={handleInputChange}
                      className={`w-full py-3 px-4 bg-white/70 border ${
                        isEditing ? "border-gray-200" : "border-gray-100 bg-gray-50"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 ${
                        isEditing ? "" : "cursor-not-allowed"
                      }`}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {user.role === "Auctioneer" && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-2 rounded-full">
                      <FaCreditCard />
                    </div>
                    <h2 className="text-[#134e5e] text-xl font-semibold">Payment Methods</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/70 rounded-xl p-6 shadow-sm border border-white/80">
                    <div className="flex flex-col gap-2 group">
                      <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                        <FaUniversity className="text-[#00B3B3]" /> Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={editedDetails.bankName}
                        onChange={handleInputChange}
                        className={`w-full py-3 px-4 bg-white/70 border ${
                          isEditing ? "border-gray-200" : "border-gray-100 bg-gray-50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 ${
                          isEditing ? "" : "cursor-not-allowed"
                        }`}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex flex-col gap-2 group">
                      <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                        <FaMoneyBillWave className="text-[#00B3B3]" /> Bank Account (IBAN)
                      </label>
                      <input
                        type="text"
                        name="bankAccountNumber"
                        value={editedDetails.bankAccountNumber}
                        onChange={handleInputChange}
                        className={`w-full py-3 px-4 bg-white/70 border ${
                          isEditing ? "border-gray-200" : "border-gray-100 bg-gray-50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 ${
                          isEditing ? "" : "cursor-not-allowed"
                        }`}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex flex-col gap-2 group">
                      <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                        <FaUser className="text-[#00B3B3]" /> Account Name
                      </label>
                      <input
                        type="text"
                        name="bankAccountName"
                        value={editedDetails.bankAccountName}
                        onChange={handleInputChange}
                        className={`w-full py-3 px-4 bg-white/70 border ${
                          isEditing ? "border-gray-200" : "border-gray-100 bg-gray-50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 ${
                          isEditing ? "" : "cursor-not-allowed"
                        }`}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex flex-col gap-2 group">
                      <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                        <FaPaypal className="text-[#00B3B3]" /> PayPal Email
                      </label>
                      <input
                        type="email"
                        name="paypalEmail"
                        value={editedDetails.paypalEmail}
                        onChange={handleInputChange}
                        className={`w-full py-3 px-4 bg-white/70 border ${
                          isEditing ? "border-gray-200" : "border-gray-100 bg-gray-50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 ${
                          isEditing ? "" : "cursor-not-allowed"
                        }`}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-2 rounded-full">
                    <FaTrophy />
                  </div>
                  <h2 className="text-[#134e5e] text-xl font-semibold">Your Activity</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.role === "Auctioneer" ? (
                    <div className="bg-gradient-to-br from-[#00B3B3]/10 to-[#2bd6bf]/10 rounded-xl p-6 shadow-sm border border-white/50 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaMoneyBillWave className="text-white text-2xl" />
                      </div>
                      <h3 className="text-[#134e5e] font-semibold mb-2">Unpaid Commission</h3>
                      <p className="text-2xl font-bold text-[#2bd6bf]">
                        {editedDetails.unpaidCommission || "0"} RON
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gradient-to-br from-[#00B3B3]/10 to-[#2bd6bf]/10 rounded-xl p-6 shadow-sm border border-white/50 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaTrophy className="text-white text-2xl" />
                        </div>
                        <h3 className="text-[#134e5e] font-semibold mb-2">Auctions Won</h3>
                        <p className="text-2xl font-bold text-[#2bd6bf]">
                          {editedDetails.auctionsWon || "0"}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-[#00B3B3]/10 to-[#2bd6bf]/10 rounded-xl p-6 shadow-sm border border-white/50 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaMoneyBillWave className="text-white text-2xl" />
                        </div>
                        <h3 className="text-[#134e5e] font-semibold mb-2">Money Spent</h3>
                        <p className="text-2xl font-bold text-[#2bd6bf]">
                          {editedDetails.moneySpent || "0"} RON
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-[#00B3B3]/10 to-[#2bd6bf]/10 rounded-xl p-6 shadow-sm border border-white/50 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaHistory className="text-white text-2xl" />
                        </div>
                        <h3 className="text-[#134e5e] font-semibold mb-2">Auction History</h3>
                        <button
                          onClick={toggleAuctionHistory}
                          className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] hover:from-[#2bd6bf] hover:to-[#00B3B3] text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 w-full"
                        >
                          <FaGavel /> View Won Auctions
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="w-full text-center mt-10 pt-8 border-t border-gray-200">
                <button
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mx-auto shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt /> Logout from Account
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {showAuctionHistory &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center z-[1000] animate-fadeIn">
            <div className="fixed inset-0 backdrop-blur-sm" onClick={toggleAuctionHistory}></div>

            <div className="bg-white/95 rounded-2xl shadow-2xl w-full max-w-3xl p-8 transform transition-all duration-300 border border-white/50 relative overflow-hidden z-10 m-4">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-[#00B3B3]/10 to-[#2bd6bf]/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-r from-[#2bd6bf]/10 to-[#00B3B3]/10 rounded-full blur-xl"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#00B3B3]/20 to-[#2bd6bf]/20 rounded-full flex items-center justify-center p-3 shadow-inner">
                      <FaAward className="text-[#00B3B3] text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-[#134e5e]">Auctions You've Won</h2>
                  </div>

                  <button
                    onClick={toggleAuctionHistory}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                  >
                    <FaArrowLeft className="text-gray-500" />
                  </button>
                </div>

                {isLoadingAuctions ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 mb-4 flex items-center justify-center">
                      <FaSpinner className="text-[#00B3B3] text-4xl animate-spin" />
                    </div>
                    <p className="text-gray-600">Loading your auction history...</p>
                  </div>
                ) : wonAuctions.length > 0 ? (
                  <div className="space-y-4">
                    {wonAuctions.map((auction) => (
                      <div
                        key={auction._id}
                        className="flex items-center bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                      >
                        <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={auction.image?.url || "https://via.placeholder.com/150?text=No+Image"}
                            alt={auction.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="ml-4 flex-grow">
                          <h3 className="font-semibold text-[#134e5e]">{auction.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 mt-1">
                            <p className="text-sm text-gray-600">
                              Final Bid:{" "}
                              <span className="text-[#00B3B3] font-medium">
                                {auction.finalBid || auction.highestBid || auction.startingBid} RON
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="ml-auto">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              auction.paymentStatus === "Paid"
                                ? "bg-green-100 text-green-700"
                                : auction.paymentStatus === "Delivered"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {auction.paymentStatus || "Pending Payment"}
                          </span>
                        </div>

                        <div className="ml-4">
                          <button
                            onClick={() => {
                              (async () => {
                                try {
                                  await generateAuctionInvoice(auction, user);
                                } catch (error) {
                                  console.error("Error generating invoice:", error);
                                  toast.error("Failed to generate invoice. Please try again.");
                                }
                              })();
                            }}
                            className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] hover:from-[#2bd6bf] hover:to-[#00B3B3] text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2"
                            title="Download Invoice"
                          >
                            <FaFileInvoice /> Export Invoice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-[#00B3B3]/10 p-5 rounded-full mb-4">
                      <FaTrophy className="text-[#00B3B3] text-3xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#134e5e] mb-2">
                      No Auctions Won Yet
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      You haven't won any auctions yet. Continue bidding to see your winning
                      auctions here!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default UserProfile;

