import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { deleteAuction, republishAuction } from "@/store/slices/auctionSlice";
import { FaRedo, FaCalendarAlt, FaClock } from "react-icons/fa";

const CardTwo = ({ imgSrc, title, startingBid, startTime, endTime, id, onRepublish }) => {
    const calculateTimeLeft = () => {
        const now = new Date();
        const startDifference = new Date(startTime) - now;
        const endDifference = new Date(endTime) - now;
        const hasEnded = new Date(endTime) < new Date();
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

    const dispatch = useDispatch();
    const handleDeleteAuction = () => {
        dispatch(deleteAuction(id));
    };

    const [openDrawer, setOpenDrawer] = useState(false);

    return (
        <>
            <div className="group bg-white  rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 dark:border-gray-700 relative">
                {/* Imagine licitație cu overlay dacă s-a terminat */}
                <div className="relative overflow-hidden w-full pt-[75%]">
                    <img
                        src={imgSrc || "/placeholder.png"}
                        alt={title}
                        className="absolute top-0 left-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    {Object.keys(timeLeft).length <= 1 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 text-white text-center py-1 px-2 text-sm font-medium">
                            Auction Ended
                        </div>
                    )}
                </div>

                {/* Conținut card */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-[#2bd6bf] text-lg mb-2 line-clamp-2 group-hover:text-[#00B3B3] transition-colors duration-300">
                            {title}
                        </h3>
                        <p className="text-gray-900 dark:text-gray-900 mb-1 text-sm">
                            Starting Bid: <span className="text-[#00B3B3] font-semibold">{startingBid} RON</span>
                        </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        {Object.keys(timeLeft).length > 1 ? (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">{timeLeft.type}</span>
                                <span className="text-sm font-semibold text-[#00B3B3]">{formatTimeLeft(timeLeft)}</span>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-800 dark:text-gray-800">Status</span>
                                <span className="text-sm font-semibold text-red-500">Ended</span>
                            </div>
                        )}
                    </div>

                    {/* Butoane pentru acțiuni */}
                    <div className="mt-4 flex flex-col gap-2">
                        <Link
                            className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white text-center py-2 px-4 rounded-lg font-medium hover:shadow-md transition-all duration-300"
                            to={`/auction/details/${id}`}
                        >
                            View Auction
                        </Link>
                        <button
                            className="bg-red-500 text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-all duration-300"
                            onClick={handleDeleteAuction}
                        >
                            Delete Auction
                        </button>
                        <button
                            disabled={new Date(endTime) > Date.now()}
                            onClick={() => setOpenDrawer(true)}
                            className="bg-blue-500 text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Republish Auction
                        </button>
                    </div>
                </div>
            </div>
            <Drawer id={id} openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
        </>
    );
};

export default CardTwo;

const Drawer = ({ setOpenDrawer, openDrawer, id }) => {
    // Conținutul drawer-ului rămâne neschimbat
    const dispatch = useDispatch();
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 7); // Default to 7 days from now
        return date;
    });
    const { loading } = useSelector((state) => state.auction);

    const handleRepublishAuction = () => {
        if (startTime >= endTime) {
            alert("End time must be after start time");
            return;
        }

        const data = {
            startTime: startTime,
            endTime: endTime,
        };

        dispatch(republishAuction(id, data));
        setOpenDrawer(false);
    };

    return (
        <section
            className={`fixed ${
                openDrawer && id ? "bottom-0" : "-bottom-full"
            } left-0 w-full transition-all duration-300 h-full flex items-center justify-center backdrop-blur-sm z-50`}
        >
            <div className="bg-white/95 rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all duration-300 scale-100 border border-white/50 dark:border-gray-700/50 relative overflow-hidden m-4">

                <div className="relative z-10">
                    <div className="mb-8 text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-[#00B3B3]/20 to-[#2bd6bf]/20 rounded-full flex items-center justify-center mx-auto mb-5 p-5 shadow-inner">
                            <FaRedo className="text-[#00B3B3] text-3xl" />
                        </div>
                        <h3 className="text-2xl dark:text-gray-800 font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf]">
                            Republish Auction
                        </h3>
                        <div className="w-16 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto my-3 rounded-full"></div>
                        <p className="text-gray-600 dark:text-gray-800 mt-2">
                            Let's republish auction with the same details but new starting and ending time.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 mb-8">
                        <div className="flex flex-col gap-2 group">
                            <label className="text-gray-700 dark:text-gray-800 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300 font-medium">
                                <FaCalendarAlt className="text-[#00B3B3]" /> Auction Start Time
                            </label>
                            <div className="relative">
                                <DatePicker
                                    selected={startTime}
                                    onChange={(date) => setStartTime(date)}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    dateFormat="MMMM d, yyyy h:mm aa"
                                    className="w-full py-3 px-4 bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 shadow-sm dark:text-white"
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
                            <label className="text-gray-700 dark:text-gray-800 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300 font-medium">
                                <FaCalendarAlt className="text-[#00B3B3]" /> Auction End Time
                            </label>
                            <div className="relative">
                                <DatePicker
                                    selected={endTime}
                                    onChange={(date) => setEndTime(date)}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    dateFormat="MMMM d, yyyy h:mm aa"
                                    className="w-full py-3 px-4 bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 shadow-sm dark:text-white"
                                    placeholderText="Select end date and time"
                                    required
                                    minDate={startTime || new Date()}
                                />
                                <div className="absolute right-3 top-3 text-[#00B3B3] pointer-events-none">
                                    <FaClock />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#00B3B3]/5 dark:bg-[#00B3B3]/10 border border-[#00B3B3]/20 rounded-lg p-3 mb-6">
                        <p className="text-sm text-[#00B3B3] flex items-start gap-2">
                            <FaClock className="mt-0.5 flex-shrink-0" />
                            <span>We recommend auctions to last between 3-7 days for optimal bidding activity.</span>
                        </p>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={() => setOpenDrawer(false)}
                            className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-800 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-sm"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRepublishAuction}
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                        >
                            {loading ? (
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
        </section>
    );
};