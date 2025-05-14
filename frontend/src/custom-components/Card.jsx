import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Card = ({ imgSrc, title, startingBid, startTime, endTime, id }) => {
    const calculateTimeLeft = () => {
        const now = new Date();
        const startDifference = new Date(startTime) - now;
        const endDifference = new Date(endTime) - now;
        let timeLeft = {};

        if (startDifference > 0) {
            timeLeft = {
                type: "Starts in",
                days: Math.floor(startDifference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((startDifference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((startDifference / 1000 / 60) % 60),
                seconds: Math.floor((startDifference / 1000) % 60),
            };
        } else if (endDifference > 0) {
            timeLeft = {
                type: "Ends in",
                days: Math.floor(endDifference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((endDifference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((endDifference / 1000 / 60) % 60),
                seconds: Math.floor((endDifference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        });
        return () => clearTimeout(timer);
    }, [timeLeft]);

    const formatTimeLeft = ({ days, hours, minutes, seconds }) => {
        const pad = (num) => String(num).padStart(2, "0");
        return `(${days} Days) ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    return (
        <Link 
            to={`/auction/item/${id}`} 
            className="basis-full bg-white dark:bg-gray-100 rounded-md group sm:basis-56 lg:basis-60 2xl:basis-80 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
            {/* Container pentru imagine cu aspect ratio fix */}
            <div className="relative w-full pt-[75%] overflow-hidden">
                <img 
                    src={imgSrc} 
                    alt={title} 
                    className="absolute top-0 left-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                {/* Status badge pentru licitații încheiate */}
                {Object.keys(timeLeft).length <= 1 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 text-white text-center py-1 px-2 text-sm font-medium">
                        Auction Ended
                    </div>
                )}
            </div>

            {/* Informații licitație */}
            <div className="px-4 pt-4 pb-4">
                <h5 className="font-semibold text-[18px] text-gray-800 dark:text-[#00B3B3] group-hover:text-[#d6482b] mb-2 line-clamp-2">
                    {title}
                </h5>
                
                {startingBid && (
                    <p className="text-stone-600 dark:text-gray-800 font-light mb-1">
                        Starting Bid:{" "}
                        <span className="text-[#00B3B3] dark:text-[#00B3B3] font-bold ml-1">
                            {startingBid} RON
                        </span>
                    </p>
                )}
                
                {/* Timp rămas până la start/end */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    {Object.keys(timeLeft).length > 1 ? (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{timeLeft.type}</span>
                            <span className="text-sm font-semibold text-[#00B3B3] dark:text-[#00B3B3]">
                                {formatTimeLeft(timeLeft)}
                            </span>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                            <span className="text-sm font-semibold text-red-500">Ended</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default Card;