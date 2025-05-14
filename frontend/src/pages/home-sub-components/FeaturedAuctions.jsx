import React from "react";
import { Link } from "react-router-dom";

const FeaturedAuctions = ({ allAuctions }) => {
    if (!allAuctions || allAuctions.length === 0) {
        return <p className="text-center text-gray-500">No auctions available at the moment.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {allAuctions.slice(0, 6).map((element) => (
                <div
                    key={element._id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                    {/* Auction Image */}
                    <div className="relative">
                        <img
                            src={element.image?.url || "https://via.placeholder.com/400x300"}
                            alt={element.title}
                            className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-[#A2D9FF] to-[#00BFA6] text-white text-sm font-semibold px-3 py-1 rounded-full shadow-md">
                            Starting Bid: {element.startingBid} RON
                        </div>
                    </div>

                    {/* Auction Details */}
                    <div className="p-6">
                        <h4 className="text-xl font-bold text-[#1A202C] mb-2">
                            {element.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-4">
                            Ends on: {new Date(element.endTime).toLocaleDateString()}
                        </p>
                        <Link
                            to={`/auction/item/${element._id}`}
                            className="inline-block bg-gradient-to-r from-[#A2D9FF] to-[#00BFA6] text-white font-semibold text-sm px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            View Auction
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FeaturedAuctions;