import { createAuction } from "@/store/slices/auctionSlice";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { 
    FaTags, 
    FaFileAlt, 
    FaCalendarAlt, 
    FaImage, 
    FaBox, 
    FaCoins,
    FaInfoCircle,
    FaPlus,
    FaShoppingCart 
  } from "react-icons/fa";
  import { toast } from "react-toastify";

const CreateAuction = () => {
    const [image, setImage] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [startingBid, setStartingBid] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);
    const [buyNowPrice, setBuyNowPrice] = useState("");

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const auctionCategories = [
        "Electronics",
        "Furniture",
        "Art & Antiques",
        "Jewelry & Watches",
        "Automobiles",
        "Real Estate",
        "Collectibles",
        "Fashion & Accessories",
        "Sports Memorabilia",
        "Books & Manuscripts",
    ];

    const imageHandler = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImage(file);
                setImagePreview(reader.result);
            };
        }
    };

    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auction);

    const handleCreateAuction = (e) => {
        e.preventDefault();
        
        // Afiseaza datele inainte de trimitere pentru debugging
        console.log("Sending data:", {
            title,
            description,
            category,
            condition,
            startingBid,
            buyNowPrice,
            startTime, 
            endTime
        });
        
        const formData = new FormData();
        formData.append("image", image);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("condition", condition);
        formData.append("startingBid", startingBid);
        formData.append("startTime", startTime);
        formData.append("endTime", endTime);
        
        if (buyNowPrice && parseFloat(buyNowPrice) > 0) {
            console.log("Adding Buy Now price:", buyNowPrice);
            formData.append("buyNowPrice", buyNowPrice);
        }
        
        dispatch(createAuction(formData));
    };

    const { isAuthenticated, user } = useSelector((state) => state.user);
    const navigateTo = useNavigate();
    useEffect(() => {
        if (!isAuthenticated || user.role !== "Auctioneer") {
            navigateTo("/");
        }
    }, [isAuthenticated]);

    return (
        <article className="w-full h-auto px-5 pt-20 lg:pl-[320px] flex flex-col bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa] min-h-screen relative overflow-hidden">

            <div className={`max-w-5xl mx-auto w-full transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="text-center mb-8">
                    <div className="w-16 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto mb-4 rounded-full"></div>
                    <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-4xl font-extrabold mb-2 md:text-5xl lg:text-6xl drop-shadow-lg">
                        Create Auction
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] mx-auto mt-4 rounded-full"></div>
                    <p className="text-gray-700 mt-4 max-w-2xl mx-auto">
                        List your item for auction and let the bidding begin. Provide detailed information to attract more bidders.
                    </p>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 relative overflow-hidden mb-10">
                    <form className="relative z-10 flex flex-col gap-8 w-full" onSubmit={handleCreateAuction}>
                        {/* Basic Info Section */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-2 rounded-full">
                                    <FaInfoCircle />
                                </div>
                                <h2 className="text-[#134e5e] text-xl font-semibold">Basic Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2 group">
                                    <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                        <FaTags className="text-[#00B3B3]" /> Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                        placeholder="Enter auction title"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2 group">
                                    <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                        <FaTags className="text-[#00B3B3]" /> Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {auctionCategories.map((element) => (
                                            <option key={element} value={element}>
                                                {element}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2 group">
                                    <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                        <FaBox className="text-[#00B3B3]" /> Condition
                                    </label>
                                    <select
                                        value={condition}
                                        onChange={(e) => setCondition(e.target.value)}
                                        className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                        required
                                    >
                                        <option value="">Select Condition</option>
                                        <option value="New">New</option>
                                        <option value="Used">Used</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2 group">
                                    <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                        <FaCoins className="text-[#00B3B3]" /> Starting Bid
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={startingBid}
                                            onChange={(e) => setStartingBid(e.target.value)}
                                            className="w-full py-3 px-4 pl-10 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                            placeholder="Enter starting bid"
                                            required
                                            min="1"
                                            step="0.01"
                                        />
                                        {/* <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></span> */}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 group">
                                    <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                        <FaShoppingCart className="text-[#00B3B3]" /> Buy Now Price (Optional)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={buyNowPrice}
                                            onChange={(e) => setBuyNowPrice(e.target.value)}
                                            className="w-full py-3 px-4 pl-10 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                            placeholder="Enter buy now price (optional)"
                                            min={startingBid || "0"}
                                            step="0.01"
                                        />
                                        {/* <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">RON</span> */}
                                    </div>
                                    <p className="text-sm text-gray-500 ml-1">Set a price that allows buyers to purchase the item immediately.</p>
                                </div>


                            </div>
                        </div>

                        {/* Description Section */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-2 rounded-full">
                                    <FaFileAlt />
                                </div>
                                <h2 className="text-[#134e5e] text-xl font-semibold">Item Description</h2>
                            </div>

                            <div className="flex flex-col gap-2 group">
                                <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                    <FaFileAlt className="text-[#00B3B3]" /> Detailed Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                    rows={6}
                                    placeholder="Provide a detailed description of your item including features, history, condition details, etc."
                                    required
                                />
                                <p className="text-sm text-gray-500 ml-1">A detailed description increases your chances of attracting serious bidders.</p>
                            </div>
                        </div>

                        {/* Auction Schedule Section */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-2 rounded-full">
                                    <FaCalendarAlt />
                                </div>
                                <h2 className="text-[#134e5e] text-xl font-semibold">Auction Schedule</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2 group">
                                    <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                        <FaCalendarAlt className="text-[#00B3B3]" /> Auction Starting Time
                                    </label>
                                    <DatePicker
                                        selected={startTime}
                                        onChange={(date) => setStartTime(date)}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                        placeholderText="Select start date and time"
                                        required
                                        minDate={new Date()}
                                    />
                                </div>

                                <div className="flex flex-col gap-2 group">
                                    <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                        <FaCalendarAlt className="text-[#00B3B3]" /> Auction End Time
                                    </label>
                                    <DatePicker
                                        selected={endTime}
                                        onChange={(date) => setEndTime(date)}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                        placeholderText="Select end date and time"
                                        required
                                        minDate={startTime || new Date()}
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2 ml-1">We recommend auctions to last between 3-7 days for optimal bidding activity.</p>
                        </div>

                        {/* Image Upload Section */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-2 rounded-full">
                                    <FaImage />
                                </div>
                                <h2 className="text-[#134e5e] text-xl font-semibold">Item Images</h2>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-gray-700 flex items-center gap-2">
                                    <FaImage className="text-[#00B3B3]" /> Upload High-Quality Images
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label
                                        htmlFor="dropzone-file"
                                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white/50 hover:bg-white/70 transition-all duration-300 group overflow-hidden"
                                    >
                                        <div className="flex flex-col items-center justify-center p-6 text-center">
                                            {imagePreview ? (
                                                <div className="relative w-full h-full">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-auto max-w-full max-h-48 rounded-lg shadow-md mx-auto transition-all duration-300 group-hover:scale-105"
                                                    />
                                                    <p className="mt-4 text-sm text-gray-500">Click to change image</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="mb-4 bg-[#00B3B3]/10 p-4 rounded-full">
                                                        <FaImage className="w-8 h-8 text-[#00B3B3]" />
                                                    </div>
                                                    <p className="mb-2 text-sm text-gray-700 font-medium">
                                                        <span className="font-semibold text-[#00B3B3]">Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG or JPEG (Recommended: high-quality images with good lighting)
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            id="dropzone-file"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={imageHandler}
                                            required={!image}
                                        />
                                    </label>
                                </div>
                                <p className="text-sm text-gray-500 ml-1">Clear, high-quality images significantly improve your auction's success rate.</p>
                            </div>
                        </div>

                        <div className="flex justify-center pt-4">
                            <button
                                className="relative overflow-hidden bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] hover:from-[#2bd6bf] hover:to-[#00B3B3] text-white font-semibold text-lg py-4 px-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-3 w-full sm:w-auto min-w-[200px]"
                                type="submit"
                                disabled={loading}
                            >
                                <span className="relative z-10">{loading ? "Creating Auction..." : "Create Auction"}</span>
                                {!loading && (
                                    <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                    </svg>
                                )}
                                <div className="absolute top-0 left-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tips Card */}
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-md mb-10">
                    <h3 className="text-[#134e5e] text-xl font-semibold mb-3 flex items-center gap-2">
                        <FaInfoCircle className="text-[#00B3B3]" /> Tips for a Successful Auction
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 pl-1">
                        <li>Use descriptive titles with keywords that buyers might search for</li>
                        <li>Include detailed and honest descriptions of your item's condition</li>
                        <li>Upload clear, high-quality images from multiple angles</li>
                        <li>Set a reasonable starting bid to attract initial bidders</li>
                        <li>Choose auction duration carefully - longer isn't always better</li>
                    </ul>
                </div>
            </div>
        </article>
    );
};

export default CreateAuction;