// import { deleteAuctionItem } from "@/store/slices/superAdminSlice";
// import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link } from "react-router-dom";

// const AuctionItemDelete = () => {
//   const { allAuctions } = useSelector((state) => state.auction);
//   const dispatch = useDispatch();

//   const handleAuctionDelete = (id) => {
//     dispatch(deleteAuctionItem(id));
//   };

//   return (
//     <>
//       <div className="overflow-x-auto mb-10">
//         <table className="min-w-full bg-white border-gray-300">
//           <thead className="bg-gray-800 text-white">
//             <tr>
//               <th className="py-2 px-4 text-left">Image</th>
//               <th className="py-2 px-4 text-left">Title</th>
//               <th className="py-2 px-4 text-left">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="text-gray-700">
//             {allAuctions.length > 0 ? (
//               allAuctions.map((element) => {
//                 return (
//                   <tr key={element._id}>
//                     <td className="py-2 px-4">
//                       <img
//                         src={element.image?.url}
//                         alt={element.title}
//                         className="h-12 w-12 object-cover rounded"
//                       />
//                     </td>
//                     <td className="py-2 px-4">{element.title}</td>
//                     <td className="py-2 px-4 flex space-x-2">
//                       <Link
//                         to={`/auction/details/${element._id}`}
//                         className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700 transition-all duration-300"
//                       >
//                         View
//                       </Link>
//                       <button
//                         className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-700 transition-all duration-300"
//                         onClick={() => handleAuctionDelete(element._id)}
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })
//             ) : (
//               <tr className="text-left text-xl text-sky-600 py-3">
//                 <td>No Auctions found.</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </>
//   );
// };

// export default AuctionItemDelete;

import { deleteAuctionItem } from "@/store/slices/superAdminSlice";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaSearch, FaEye, FaTrash, FaBox, FaExclamationTriangle } from "react-icons/fa";

const AuctionItemDelete = () => {
  const { allAuctions } = useSelector((state) => state.auction);
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");

  const handleAuctionDelete = (id, title) => {
    if (confirm(`Are you sure you want to delete the auction "${title}"? This action cannot be undone.`)) {
      dispatch(deleteAuctionItem(id));
    }
  };

  const filteredAuctions = allAuctions.filter(auction =>
    auction.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input 
            type="text"
            placeholder="Search auctions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent text-gray-700"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <FaSearch />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {filteredAuctions.length} auction{filteredAuctions.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Auctions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white">
                <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider w-20">Image</th>
                <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Starting Bid</th>
                <th className="py-3 px-4 text-center text-xs font-medium uppercase tracking-wider w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAuctions.length > 0 ? (
                filteredAuctions.map((element, index) => {
                  const now = new Date();
                  const startTime = new Date(element.startTime);
                  const endTime = new Date(element.endTime);
                  
                  let status;
                  if (now < startTime) {
                    status = { label: "Upcoming", color: "blue" };
                  } else if (now > endTime) {
                    status = { label: "Ended", color: "gray" };
                  } else {
                    status = { label: "Active", color: "green" };
                  }

                  return (
                    <tr key={element._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                      <td className="py-3 px-4">
                        {element.image?.url ? (
                          <img
                            src={element.image.url}
                            alt={element.title}
                            className="h-14 w-14 object-cover rounded-lg border border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="h-14 w-14 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                            <FaBox size={20} />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        <div className="line-clamp-2">{element.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(element.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 bg-${status.color}-100 text-${status.color}-700 px-2 py-1 rounded-full text-xs font-medium`}>
                          <span className={`w-2 h-2 rounded-full bg-${status.color}-500`}></span>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {element.startingBid} RON
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                        <Link
                          to={`/auction/details/${element._id}`}
                            className="bg-[#00B3B3] hover:bg-[#009999] text-white p-2 rounded transition-all duration-300 flex items-center gap-1"
                            title="View auction details"
                          >
                            <FaEye className="text-sm" />
                            <span>View</span>
                          </Link>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-all duration-300 flex items-center gap-1"
                            onClick={() => handleAuctionDelete(element._id, element.title)}
                            title="Delete this auction"
                          >
                            <FaTrash className="text-sm" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FaExclamationTriangle className="text-4xl mb-3 text-yellow-400" />
                      <p className="font-medium text-lg">No auctions found</p>
                      {searchTerm && (
                        <p className="text-sm mt-1">Try adjusting your search criteria</p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AuctionItemDelete;