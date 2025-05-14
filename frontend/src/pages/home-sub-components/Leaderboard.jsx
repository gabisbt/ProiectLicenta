import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaTrophy, FaMedal, FaUser } from "react-icons/fa";

const Leaderboard = () => {
    const { leaderboard } = useSelector((state) => state.user);

    const getRankBadge = (index) => {
        if (index === 0) return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><FaTrophy className="text-yellow-500" /> Gold</span>;
        if (index === 1) return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><FaMedal className="text-gray-500" /> Silver</span>;
        if (index === 2) return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><FaMedal className="text-amber-500" /> Bronze</span>;
        return null;
    };

    return (
        <section className="my-12 px-4 max-w-5xl mx-auto">
            {/* Titlu */}
            <div className="mb-8 text-center">
                <h2 className="text-[#00B3B3] text-3xl font-bold mb-2">
                    Bidders Leaderboard
                </h2>
                <p className="text-gray-600">
                    Our top bidders who have shown exceptional participation in auctions.
                </p>
            </div>

            {/* Tabelul Leaderboard */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auctions Won</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {leaderboard.slice(0, 5).map((element, index) => (
                                <tr 
                                    key={element._id}
                                    className={`hover:bg-gray-50 ${index < 3 ? 'bg-gray-50' : ''}`}
                                >
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-900 mr-2">#{index + 1}</span>
                                            {getRankBadge(index)}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {element.profileImage?.url ? (
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                                        src={element.profileImage.url}
                                                        alt=""
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "https://placehold.co/100x100?text=User";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <FaUser className="text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {element.userName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-[#00B3B3]">
                                            {element.moneySpent} RON
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {element.auctionsWon}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            
                            {leaderboard.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                        No leaderboard data available yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Buton pentru leaderboard complet */}
            <div className="text-center">
                <Link
                    to="/leaderboard"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#00B3B3] hover:bg-[#009999] transition-colors"
                >
                    View Full Leaderboard
                </Link>
            </div>
        </section>
    );
};

export default Leaderboard;