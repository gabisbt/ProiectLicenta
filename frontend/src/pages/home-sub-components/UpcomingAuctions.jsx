import React from "react";
import { RiAuctionFill } from "react-icons/ri";
import { useSelector } from "react-redux";

const UpcomingAuctions = () => {
    const { allAuctions } = useSelector((state) => state.auction);

    const today = new Date();
    const todayString = today.toDateString();

    const auctionsStartingToday = allAuctions.filter((item) => {
        const auctionDate = new Date(item.startTime);
        return auctionDate.toDateString() === todayString;
    });

    return (
        <section className="my-12">
            {/* <h3 className="text-[#111] text-5xl font-extrabold mb-10 text-center tracking-wide">
                Auctions Starting Today
            </h3> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {auctionsStartingToday.map((element) => (
                    <div
                        key={element._id}
                        className="bg-gradient-to-br from-[#ffffff] via-[#f8f9fa] to-[#e9ecef] p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                    >
                        {/* Imaginea produsului */}
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-6">
                            <img
                                src={element.image?.url || "/placeholder-image.jpg"}
                                alt={element.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>

                        {/* Detalii licitație */}
                        <div className="flex flex-col gap-4">
                            <h4 className="text-xl font-bold text-[#111] truncate">
                                {element.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                                Starting Bid:{" "}
                                <span className="text-[#00BFA6] font-semibold">
                                    RON {element.startingBid}
                                </span>
                            </p>
                            <p className="text-sm text-gray-600">
                                Starting Time:{" "}
                                <span className="text-[#00BFA6] font-semibold">
                                    {new Date(element.startTime).toLocaleString()}
                                </span>
                            </p>
                        </div>

                        {/* Icon decorativ */}
                        <div className="absolute top-4 right-4 bg-[#00BFA6] text-white p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <RiAuctionFill size={24} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default UpcomingAuctions;