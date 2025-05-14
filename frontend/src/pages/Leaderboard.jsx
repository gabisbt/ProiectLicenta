import Spinner from "@/custom-components/Spinner";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaTrophy, FaMedal, FaUser } from "react-icons/fa";

const Leaderboard = () => {
    const { loading, leaderboard } = useSelector((state) => state.user);

    const getRankBadge = (index) => {
        if (index === 0) return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><FaTrophy className="text-yellow-500" /> Gold</span>;
        if (index === 1) return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><FaMedal className="text-gray-500" /> Silver</span>;
        if (index === 2) return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><FaMedal className="text-amber-500" /> Bronze</span>;
        return null;
    };

    return (
        <section className="w-full ml-0 m-0 h-fit px-5 pt-20 lg:pl-[320px] flex flex-col bg-gradient-to-br from-[#f0f9ff] via-[#e0f7fa] to-[#e0f2f1] min-h-screen pb-16">
            <div className="max-w-5xl mx-auto w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto mb-4 rounded-full"></div>
                    <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-4xl font-extrabold mb-2 md:text-5xl lg:text-6xl drop-shadow-lg">
                    Bidders Leaderboard
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] mx-auto mt-4 mb-2 rounded-full"></div>
                    <p className="text-gray-700 mt-4 max-w-2xl mx-auto">
                    Our top bidders who have shown exceptional participation in auctions.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Spinner />
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
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
                                    {leaderboard.slice(0, 10).map((element, index) => (
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
                )}
            </div>
        </section>
    );
};

export default Leaderboard;