import { deletePaymentProof, getSinglePaymentProofDetail, updatePaymentProof } from "@/store/slices/superAdminSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaCheck, FaTimes, FaEdit, FaTrash, FaEye, FaSpinner, FaSearch, FaFilter } from "react-icons/fa";

const PaymentProofs = () => {
  const { paymentProofs, singlePaymentProof, loading } = useSelector(
    (state) => state.superAdmin
  );
  const [openDrawer, setOpenDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const dispatch = useDispatch();

  const handlePaymentProofDelete = (id) => {
    if (confirm("Are you sure you want to delete this payment proof?")) {
      dispatch(deletePaymentProof(id));
    }
  };

  const handleFetchPaymentDetail = (id) => {
    dispatch(getSinglePaymentProofDetail(id));
  };

  useEffect(() => {
    if (singlePaymentProof && Object.keys(singlePaymentProof).length > 0) {
      setOpenDrawer(true);
    }
  }, [singlePaymentProof]);

  const filteredProofs = paymentProofs.filter(proof => {
    const matchesSearch = proof.userId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? proof.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium"><FaCheck className="text-xs" /> Approved</span>;
      case "Rejected":
        return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium"><FaTimes className="text-xs" /> Rejected</span>;
      case "Settled":
        return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"><FaCheck className="text-xs" /> Settled</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium"><FaSpinner className="text-xs animate-spin" /> Pending</span>;
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <input 
              type="text"
              placeholder="Search by user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent text-gray-700"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <FaSearch />
            </div>
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent appearance-none text-gray-700 bg-white"
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Settled">Settled</option>
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <FaFilter />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {filteredProofs.length} payment proof{filteredProofs.length !== 1 ? 's' : ''} found
          </p>
          {statusFilter && (
            <button 
              onClick={() => setStatusFilter("")}
              className="text-sm text-[#00B3B3] hover:underline flex items-center gap-1"
            >
              <FaTimes className="text-xs" /> Clear filter
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white">
                <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">User ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                <th className="py-3 px-4 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProofs.length > 0 ? (
                filteredProofs.map((element, index) => (
                  <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">
                      {element.userId}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(element.status)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm font-medium">
                      {element.amount ? `${element.amount} RON` : "-"}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="bg-[#00B3B3] text-white p-2 rounded hover:bg-[#009999] transition-all duration-300"
                          onClick={() => handleFetchPaymentDetail(element._id)}
                          title="Edit payment"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        
                        {element.proof?.url && (
                          <Link
                            to={element.proof.url}
                            target="_blank"
                            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-all duration-300"
                            title="View proof"
                          >
                            <FaEye className="text-sm" />
                          </Link>
                        )}
                        
                        <button
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-all duration-300"
                          onClick={() => handlePaymentProofDelete(element._id)}
                          title="Delete payment"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-500">
                    {searchTerm || statusFilter ? 
                      "No matching payment proofs found." : 
                      "No payment proofs are available."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <Drawer setOpenDrawer={setOpenDrawer} openDrawer={openDrawer} />
    </>
  );
};

export default PaymentProofs;

export const Drawer = ({ setOpenDrawer, openDrawer }) => {
  const { singlePaymentProof, loading } = useSelector(
    (state) => state.superAdmin
  );
  const [amount, setAmount] = useState(singlePaymentProof.amount || "");
  const [status, setStatus] = useState(singlePaymentProof.status || "");
  
  useEffect(() => {
    if (singlePaymentProof) {
      setAmount(singlePaymentProof.amount || "");
      setStatus(singlePaymentProof.status || "");
    }
  }, [singlePaymentProof]);

  const dispatch = useDispatch();
  const handlePaymentProofUpdate = () => {
    dispatch(updatePaymentProof(singlePaymentProof._id, status, amount));
  };
  
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      setOpenDrawer(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity duration-300 ${
        openDrawer && singlePaymentProof.userId ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleOutsideClick}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-transform duration-300 ${
        openDrawer && singlePaymentProof.userId ? "scale-100" : "scale-95"
      }`}>
        <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] p-4 rounded-t-2xl">
          <h3 className="text-white text-xl font-semibold">Update Payment Proof</h3>
          <p className="text-white/80 text-sm mt-1">
            Update payment status and amount details
          </p>
        </div>
        
        <div className="p-6">
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <input
                type="text"
                value={singlePaymentProof.userId || ""}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (RON)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent"
                placeholder="Enter amount"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent appearance-none"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Settled">Settled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
              <textarea
                rows={3}
                value={singlePaymentProof.comment || ""}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
              />
            </div>
            
            {singlePaymentProof.proof?.url && (
              <div>
                <Link
                  to={singlePaymentProof.proof.url}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] hover:from-[#2bd6bf] hover:to-[#00B3B3] text-white py-2 px-4 rounded-lg shadow transition-all duration-300"
                >
                  <FaEye /> View Payment Proof
                </Link>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] hover:from-[#2bd6bf] hover:to-[#00B3B3] text-white py-2 px-4 rounded-lg shadow transition-all duration-300"
                onClick={handlePaymentProofUpdate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <FaCheck /> Update
                  </>
                )}
              </button>
              
              <button
                type="button"
                className="inline-flex justify-center items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg shadow transition-all duration-300"
                onClick={() => setOpenDrawer(false)}
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};