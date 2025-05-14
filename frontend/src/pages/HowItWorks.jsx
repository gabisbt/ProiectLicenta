import React, { useState, useEffect } from "react";
import {
    FaUser,
    FaGavel,
    FaEnvelope,
    FaDollarSign,
    FaFileInvoice,
    FaRedo,
    FaChevronDown,
} from "react-icons/fa";

const HowItWorks = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const steps = [
        {
            icon: <FaUser />,
            title: "User Registration",
            description:
                "Users must register or log in to perform operations such as posting auctions, bidding on items, accessing the dashboard, and sending payment proof.",
            color: "from-[#00B3B3] to-[#2bd6bf]",
        },
        {
            icon: <FaGavel />,
            title: "Role Selection",
            description:
                'Users can register as either a "Bidder" or "Auctioneer." Bidders can bid on items, while Auctioneers can post items.',
            color: "from-[#2bd6bf] to-[#4ecca3]",
        },
        {
            icon: <FaEnvelope />,
            title: "Winning Bid Notification",
            description:
                "After winning an item, the highest bidder will receive an email with the Auctioneer's payment method information, including bank transfer and PayPal.",
            color: "from-[#4ecca3] to-[#71b280]",
        },
        {
            icon: <FaDollarSign />,
            title: "Commission Payment",
            description:
                "If the Bidder pays, the Auctioneer must pay 5% of that payment to the platform. Failure to pay results in being unable to post new items, and a legal notice will be sent.",
            color: "from-[#71b280] to-[#134e5e]",
        },
        {
            icon: <FaFileInvoice />,
            title: "Proof of Payment",
            description:
                "The platform receives payment proof as a screenshot and the total amount sent. Once approved by the Administrator, the unpaid commission of the Auctioneer will be adjusted accordingly.",
            color: "from-[#134e5e] to-[#00B3B3]",
        },
        {
            icon: <FaRedo />,
            title: "Reposting Items",
            description:
                "If the Bidder does not pay, the Auctioneer can republish the item without any additional cost.",
            color: "from-[#00B3B3] to-[#2bd6bf]",
        },
    ];

    return (
        <section className="w-full h-auto px-5 pt-20 lg:pl-[320px] flex flex-col min-h-screen bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-20 right-0 w-72 h-72 bg-[#2bd6bf] opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#00B3B3] opacity-5 rounded-full blur-3xl"></div>
            
            {/* Header */}
            <div className={`text-center mb-16 transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
                <div className="inline-block mb-4 relative">
                    <div className="w-16 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto mb-6 rounded-full"></div>
                    <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-4xl font-extrabold mb-4 md:text-5xl lg:text-6xl relative drop-shadow-lg">
                        Discover How <span className="text-[#111]">SBTBid</span> Operates
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] mx-auto mt-6 rounded-full"></div>
                </div>
                <p className="text-gray-700 text-lg max-w-2xl mx-auto mb-8">
                    Understanding our auction platform is simple. Follow these steps to navigate through the bidding and selling process.
                </p>
                
                <div className="animate-bounce w-10 h-10 mx-auto mt-8 bg-white rounded-full flex items-center justify-center shadow-lg opacity-80">
                    <FaChevronDown className="text-[#00B3B3]" />
                </div>
            </div>
            
            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto z-10">
                {steps.map((element, index) => (
                    <div
                        key={index}
                        className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 relative overflow-hidden transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                        style={{ transitionDelay: `${index * 0.1}s` }}
                    >
                        {/* Step Number */}
                        <div className="absolute -top-8 -right-8 bg-gray-50/30 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center">
                            <span className="text-4xl font-bold text-gray-200/50 translate-x-3 translate-y-3">
                                {index + 1}
                            </span>
                        </div>

                        {/* Icon */}
                        <div className={`bg-gradient-to-r ${element.color} text-white p-4 text-2xl rounded-xl w-fit mb-5 shadow-lg`}>
                            {element.icon}
                        </div>

                        {/* Step Title */}
                        <h3 className="text-[#134e5e] text-xl font-bold mb-3 transition-all duration-300">
                            {element.title}
                        </h3>

                        {/* Step Description */}
                        <p className="text-base text-gray-700">
                            {element.description}
                        </p>
                        
                        {/* Hover Effect Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#00B3B3]/5 to-[#2bd6bf]/5 opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
                    </div>
                ))}
            </div>
            
            {/* Additional Information Section */}
            <div className={`bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-10 max-w-6xl mx-auto w-full transform transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <h2 className="text-2xl font-bold mb-6 text-[#134e5e]">Important Platform Benefits</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-4">
                        <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-3 rounded-full shrink-0">
                            <FaGavel />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-[#134e5e] mb-2">Transparent Bidding</h3>
                            <p className="text-gray-700">All bids are visible to all users, ensuring a fair and transparent auction process.</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-4">
                        <div className="bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] text-white p-3 rounded-full shrink-0">
                            <FaDollarSign />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-[#134e5e] mb-2">Fair Commission</h3>
                            <p className="text-gray-700">Our 5% commission is one of the lowest in the market, maximizing your profits.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;