import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import FeaturedAuctions from "./home-sub-components/FeaturedAuctions";
import UpcomingAuctions from "./home-sub-components/UpcomingAuctions";
import Leaderboard from "./home-sub-components/Leaderboard";
import { FaGavel, FaChevronDown } from "react-icons/fa";

const Home = () => {
    const { isAuthenticated } = useSelector((state) => state.user);
    const { allAuctions } = useSelector((state) => state.auction);
    const howItWorksRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const scrollToSection = () => {
        howItWorksRef.current.scrollIntoView({ behavior: "smooth" });
    };

    const howItWorks = [
        { title: "Post Items", description: "Auctioneer posts items for bidding." },
        { title: "Place Bids", description: "Bidders place bids on listed items." },
        {
            title: "Win Notification",
            description: "Highest bidder receives a winning email.",
        },
        {
            title: "Payment & Fees",
            description: "Bidder pays; auctioneer pays 5% fee.",
        },
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="w-full h-screen flex flex-col justify-center items-center relative overflow-hidden lg:pl-[320px]">
                {/* Fundalul */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#134e5e] via-[#2bd6bf] to-[#71b280] opacity-90 z-0"></div>

                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#A2D9FF] opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-[#00BFA6] opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* Main Content */}
                <div className={`relative z-10 mx-auto max-w-4xl bg-white/10 backdrop-blur-lg rounded-2xl p-10 border border-white/20 shadow-2xl transform transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 to-transparent rounded-2xl opacity-50 z-0"></div>

                    <div className="relative z-10 text-center px-6">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-1 bg-gradient-to-r from-[#A2D9FF] to-[#00BFA6]"></div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#134e5e] to-[#00B3B3]">Exclusive Auctions</span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#007264] to-[#009882]">for Collectors</span></h1>

                        <p className="text-lg md:text-2xl font-medium mb-10 text-white/90">
                            Discover rare and unique items in a world of luxury and transparent bidding.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
                            {!isAuthenticated && (
                                <>
                                    <Link
                                        to="/sign-up"
                                        className="bg-gradient-to-r from-[#2bd6bf] to-[#00BFA6] text-white font-semibold rounded-full px-10 py-4 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105 hover:from-[#00BFA6] hover:to-[#2bd6bf] w-full sm:w-auto"
                                    >
                                        Get Started
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="bg-white/10 backdrop-blur-md text-white border border-white/30 font-semibold rounded-full px-10 py-4 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105 hover:bg-white/20 w-full sm:w-auto"
                                    >
                                        Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/*Scroll Down Button */}
                <div
                    className={`absolute bottom-10 left-[60%] transform -translate-x-1/2 cursor-pointer z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onClick={scrollToSection}
                >
                    <div className="flex flex-col items-center">
                        <span className="text-white/80 text-lg font-medium mb-2">Explore More</span>
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg animate-bounce">
                            <FaChevronDown className="text-white/80" />
                        </div>
                    </div>
                </div>
            </section>

            <section
                ref={howItWorksRef}
                className="w-full px-5 py-24 lg:pl-[320px] flex flex-col min-h-screen bg-gradient-to-b from-[#e0f7fa] via-[#b2ebf2] to-[#80deea] relative overflow-hidden"
            >
                {/* Background Elements */}
                <div className="absolute top-20 right-10 w-72 h-72 bg-[#2bd6bf] opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#00B3B3] opacity-5 rounded-full blur-3xl"></div>

                <div className="text-center mb-16 relative z-10">
                    <div className="w-16 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto mb-6 rounded-full"></div>
                    <h2 className="text-[#134e5e] text-5xl font-extrabold mb-5">
                        How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf]">Works</span>
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] mx-auto mt-6 mb-8 rounded-full"></div>
                    <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                        Follow these simple steps to participate in our exclusive auctions and discover unique items.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto z-10">
                    {howItWorks.map((element, index) => (
                        <div
                            key={element.title}
                            className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 relative overflow-hidden transform hover:-translate-y-2 group"
                            style={{ transitionDelay: `${index * 0.1}s` }}
                        >
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-r from-[#00B3B3]/10 to-[#2bd6bf]/10 rounded-full blur-xl group-hover:scale-110 transition-all duration-500"></div>

                            <div className="relative z-10">
                                <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white rounded-full shadow-lg mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                                    <span className="text-3xl font-bold">{index + 1}</span>
                                </div>

                                <h3 className="font-bold text-2xl text-[#134e5e] text-center mb-4 group-hover:text-[#00B3B3] transition-all duration-300">
                                    {element.title}
                                </h3>

                                <p className="text-gray-600 text-center text-lg">
                                    {element.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>


                <div className="mt-24 relative z-10 max-w-6xl mx-auto w-full">
                    <div className="text-center mb-12">
                        <h3 className="text-[#134e5e] text-4xl font-extrabold mb-4">
                            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf]">Auctions</span>
                        </h3>
                        <div className="w-20 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto"></div>
                    </div>
                    <div className="bg-white/30 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50">
                        <FeaturedAuctions allAuctions={allAuctions} />
                    </div>
                </div>



                <div className="mt-24 relative z-10 max-w-6xl mx-auto w-full">
                    <div className="text-center mb-12">
                        <h3 className="text-[#134e5e] text-4xl font-extrabold mb-4">
                            Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf]">Auctions</span>
                        </h3>
                        <div className="w-20 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto"></div>
                    </div>
                    <div className="bg-white/30 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50">
                        <UpcomingAuctions />
                    </div>
                </div>


                <div className="mt-24 mb-16 relative z-10 max-w-6xl mx-auto w-full">
                    <div className="text-center mb-12">
                        <h3 className="text-[#134e5e] text-4xl font-extrabold mb-4">
                            Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf]">Bidders</span>
                        </h3>
                        <div className="w-20 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto"></div>
                    </div>
                    <div className="bg-white/30 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50">
                        <Leaderboard />
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;