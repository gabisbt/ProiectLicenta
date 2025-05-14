import Card from "@/custom-components/Card";
import Spinner from "@/custom-components/Spinner";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";

const Auctions = () => {
    const { allAuctions, loading } = useSelector((state) => state.auction);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [sortBy, setSortBy] = useState("endTime"); 
    const [sortOrder, setSortOrder] = useState("asc");
    const [filteredAuctions, setFilteredAuctions] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Categorii
    const categories = ["All", "Electronics", "Furniture", "Art & Antiques", "Jewelry & Watches", 
                        "Automobiles", "Real Estate", "Collectibles", "Fashion & Accessories", 
                        "Sports Memorabilia", "Books & Manuscripts"];

    useEffect(() => {
        // Aplicarea filtrelor si sortarii
        let results = [...allAuctions];
        
        // Filtrarea dupa termenul de cautare
        if (searchTerm) {
            results = results.filter(auction => 
                auction.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filtrarea dupa categorie
        if (categoryFilter && categoryFilter !== "All") {
            results = results.filter(auction => 
                auction.category === categoryFilter
            );
        }
        
        // Sortarea rezultatelor
        results.sort((a, b) => {
            let aValue, bValue;
            
            if (sortBy === "startingBid") {
                aValue = parseFloat(a.startingBid);
                bValue = parseFloat(b.startingBid);
            } else if (sortBy === "endTime") {
                aValue = new Date(a.endTime);
                bValue = new Date(b.endTime);
            } else if (sortBy === "title") {
                aValue = a.title;
                bValue = b.title;
            }
            
            if (sortOrder === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        setFilteredAuctions(results);
    }, [allAuctions, searchTerm, categoryFilter, sortBy, sortOrder]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };

    return (
        <>
        {loading ? (
            <div className="w-full h-screen flex items-center justify-center">
                <Spinner />
            </div>
        ) : (
            <article className="w-full ml-0 m-0 min-h-screen px-5 pt-20 lg:pl-[320px] flex flex-col bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa] relative overflow-hidden">
                {/* Background elements */}
                {/* <div className="absolute top-20 right-0 w-72 h-72 bg-[#2bd6bf] opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#00B3B3] opacity-5 rounded-full blur-3xl"></div> */}
                
                <div className={`max-w-7xl mx-auto w-full transition-all duration-1000 pb-20 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="text-center mb-8">
                        <div className="w-16 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto mb-4 rounded-full"></div>
                        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-4xl font-extrabold mb-2 md:text-5xl lg:text-6xl drop-shadow-lg">
                            Explore Auctions
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] mx-auto mt-4 rounded-full"></div>
                        <p className="text-gray-700 mt-4 max-w-2xl mx-auto">
                            Discover unique items and place your bids on our exclusive auctions.
                        </p>
                    </div>

                    {/* Filters and search */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/50">
                        <div className="flex flex-col lg:flex-row gap-4 items-center">
                            {/* Search */}
                            <div className="relative w-full lg:w-1/3">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search auctions..."
                                    className="py-3 pl-10 pr-4 w-full bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                />
                            </div>

                            {/* Category filter */}
                            <div className="relative w-full lg:w-1/4">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaFilter className="text-gray-400" />
                                </div>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="py-3 pl-10 pr-4 w-full bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 appearance-none"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort options */}
                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 w-full lg:w-auto"
                                >
                                    <option value="endTime">End Time</option>
                                    <option value="startingBid">Starting Bid</option>
                                    <option value="title">Title</option>
                                </select>

                                <button 
                                    onClick={toggleSortOrder}
                                    className="bg-white/70 border border-gray-200 p-3 rounded-xl hover:bg-[#00B3B3]/10 transition-all duration-300"
                                >
                                    {sortOrder === "asc" ? (
                                        <FaSortAmountUp className="text-[#00B3B3]" />
                                    ) : (
                                        <FaSortAmountDown className="text-[#00B3B3]" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-600">
                            Showing <span className="font-semibold text-[#00B3B3]">{filteredAuctions.length}</span> {filteredAuctions.length === 1 ? 'auction' : 'auctions'}
                        </p>
                    </div>

                    {/* Auctions grid */}
                    {filteredAuctions.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAuctions.map((element) => (
                                <Card
                                    title={element.title}
                                    startTime={element.startTime}
                                    endTime={element.endTime}
                                    imgSrc={element.image?.url}
                                    startingBid={element.startingBid}
                                    id={element._id}
                                    key={element._id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl border border-white/30">
                            <img 
                                src="/noauction.jpg" 
                                alt="No auctions found" 
                                className="w-40 h-40 mb-6 opacity-70"
                            />
                            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No auctions found</h3>
                            <p className="text-gray-500 max-w-md text-center">
                                We couldn't find any auctions matching your criteria. Try adjusting your filters or search term.
                            </p>
                        </div>
                    )}
                </div>
            </article>
        )}
        </>
    );
};

export default Auctions;