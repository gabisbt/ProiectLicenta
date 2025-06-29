import { clearAllSuperAdminSliceErrors, getAllPaymentProofs, getAllUsers, getMonthlyRevenue } from "@/store/slices/superAdminSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AuctionItemDelete from "./sub-components/AuctionItemDelete";
import BiddersAuctioneersGraph from "./sub-components/BiddersAuctioneersGraph";
import PaymentGraph from "./sub-components/PaymentGraph";
import PaymentProofs from "./sub-components/PaymentProofs";
import Spinner from "@/custom-components/Spinner";
import { useNavigate } from "react-router-dom";
import { FaChartBar, FaUsers, FaReceipt, FaTrash, FaTachometerAlt } from "react-icons/fa";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { loading, totalAuctioneers, totalBidders, monthlyRevenue, paymentProofs } = useSelector((state) => state.superAdmin);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(getMonthlyRevenue());
    dispatch(getAllUsers());
    dispatch(getAllPaymentProofs());
    dispatch(clearAllSuperAdminSliceErrors());
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);

  const { user, isAuthenticated } = useSelector((state) => state.user);
  const navigateTo = useNavigate();

  useEffect(() => {
    if (user.role !== "Super Admin" || !isAuthenticated) {
      navigateTo("/");
    }
  }, [isAuthenticated]);

  const totalUsers = totalAuctioneers?.reduce((a, b) => a + b, 0) + totalBidders?.reduce((a, b) => a + b, 0) || 0;
  const totalRevenue = monthlyRevenue?.reduce((a, b) => a + b, 0) || 0;
  const pendingPayments = paymentProofs?.filter(proof => proof.status === "Pending").length || 0;

  return (
    <section className="w-full px-5 pt-20 pb-10 lg:pl-[320px] bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa] relative">

      <div className="absolute top-20 right-0 w-72 h-72 bg-[#2bd6bf] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#00B3B3] opacity-5 rounded-full blur-3xl"></div>

      <div className={`max-w-7xl mx-auto w-full transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-3 rounded-xl shadow-lg">
                    <FaTachometerAlt className="text-2xl" />
                  </div>
                  <h1 className="text-[#134e5e] text-3xl md:text-4xl font-bold">
                    Admin Dashboard
                  </h1>
                </div>
                <p className="text-gray-600 mt-2 ml-12">
                  Monitor and manage your auction platform
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white/50 flex-1 min-w-[150px]">
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-[#00B3B3]">{totalUsers}</p>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white/50 flex-1 min-w-[200px] overflow-hidden">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-[#00B3B3] text-ellipsis overflow-hidden whitespace-nowrap">
                    {parseFloat(totalRevenue).toFixed(2)} RON
                  </p>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white/50 flex-1 min-w-[150px]">
                  <p className="text-sm text-gray-500">Pending Payments</p>
                  <p className="text-2xl font-bold text-[#00B3B3]">{pendingPayments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-[#00B3B3]/10 to-[#2bd6bf]/10 rounded-full blur-xl"></div>

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-2 rounded-full">
                  <FaChartBar />
                </div>
                <h2 className="text-[#134e5e] text-xl font-semibold">Monthly Revenue</h2>
              </div>

              <div className="relative z-10 h-[300px]">
                <PaymentGraph />
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-[#00B3B3]/10 to-[#2bd6bf]/10 rounded-full blur-xl"></div>

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-2 rounded-full">
                  <FaUsers />
                </div>
                <h2 className="text-[#134e5e] text-xl font-semibold">User Statistics</h2>
              </div>

              <div className="relative z-10 h-[300px]">
                <BiddersAuctioneersGraph />
              </div>
            </div>

         
            <div>
              <h3 className="text-[#111] text-xl font-semibold mb-2 min-[480px]:text-xl md:text-2xl lg:text-3xl">
                Payment Proofs
              </h3>
              <PaymentProofs />
            </div>

            
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-[#00B3B3]/10 to-[#2bd6bf]/10 rounded-full blur-xl"></div>

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-2 rounded-full">
                  <FaTrash />
                </div>
                <h2 className="text-[#134e5e] text-xl font-semibold">Manage Auctions</h2>
              </div>

              <div className="relative z-10">
                <AuctionItemDelete />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;