import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaSearch, FaTrash, FaRegCalendarAlt, FaGavel, FaSun, FaMoon } from "react-icons/fa";
import {
  removeFromFavorites,
  getFavorites
} from "@/store/slices/favoriteSlice";
import Spinner from "@/custom-components/Spinner";
import Card from "@/custom-components/Card";
import { toast } from "react-toastify";

const Favorites = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark mode state

  const favorites = useSelector((state) => state.favorites?.favorites || []);
  const loading = useSelector((state) => state.favorites?.loading || false);

  const favoritesLoaded = useRef(false);

  const dispatch = useDispatch();
  const navigateTo = useNavigate();


  useEffect(() => {
    if (!isAuthenticated) {
      navigateTo("/login");
      return;
    }

    if (user && user.role !== "Bidder") {
      navigateTo("/");
      return;
    }
  }, [isAuthenticated, user, navigateTo]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "Bidder" && !favoritesLoaded.current) {
      dispatch(getFavorites());
      favoritesLoaded.current = true;
    }
  }, [dispatch, isAuthenticated, user]);

  // Animatie
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Filtreaza favoritele în functie de termenul de cautare
  useEffect(() => {
    // Verificăm că favorites există și este un array
    if (Array.isArray(favorites)) {
      setFilteredFavorites(
        favorites.filter(item =>
          item?.title?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [favorites, searchTerm]);

  // Verifica daca o licitatie este activa
  const isAuctionActive = (auction) => {
    try {
      if (!auction?.startTime || !auction?.endTime) return false;

      const now = Date.now();
      const startTime = new Date(auction.startTime).getTime();
      const endTime = new Date(auction.endTime).getTime();

      if (isNaN(startTime) || isNaN(endTime)) return false;

      return now >= startTime && now <= endTime;
    } catch {
      return false;
    }
  };

  // Handler pentru eliminarea din favorite
  const handleRemoveFromFavorites = (id, title) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from favorites?`)) {
      dispatch(removeFromFavorites(id))
        .unwrap()
        .then(() => {
          toast.success("Item removed from favorites");
        })
        .catch((error) => {
          console.error("Error removing from favorites:", error);
          toast.error("Failed to remove from favorites");
        });
    }
  };

  // Add this useEffect to detect system dark mode or let user toggle it
  useEffect(() => {
    // Check system preference initially
    const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMedia.matches);
    
    // Listen for changes
    const darkModeHandler = (e) => setIsDarkMode(e.matches);
    darkModeMedia.addEventListener('change', darkModeHandler);
    
    // Cleanup
    return () => darkModeMedia.removeEventListener('change', darkModeHandler);
  }, []);
  
  // Add a toggle function you can use with a button if needed
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <section className="w-full h-auto px-5 pt-20 lg:pl-[320px] flex flex-col min-h-screen bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa] relative overflow-hidden pb-10">
      {/* Background Elements */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-[#2bd6bf] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#00B3B3] opacity-5 rounded-full blur-3xl"></div>

      <div className={`max-w-7xl mx-auto w-full transform transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-8">
          <div className="w-16 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto mb-4 rounded-full"></div>
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-4xl font-extrabold mb-2 md:text-5xl lg:text-6xl drop-shadow-lg flex items-center justify-center gap-3">
            <FaHeart className="text-red-500" /> My Favorites
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] mx-auto mt-4 rounded-full"></div>
          <p className="text-gray-700 mt-4 max-w-2xl mx-auto">
            Your collection of saved auction items that you're interested in.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your favorites..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent text-gray-700 bg-white/70"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : (
          <div>
            {/* Results count */}
            <div className="mb-6">
              <p className="text-gray-600">
                You have <span className="font-semibold text-[#00B3B3]">{filteredFavorites.length}</span> favorite {filteredFavorites.length === 1 ? 'auction' : 'auctions'}
                {searchTerm && (
                  <span> matching "<span className="font-medium">{searchTerm}</span>"</span>
                )}
              </p>
            </div>

            {filteredFavorites.length > 0 ? (
              // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">  
              {filteredFavorites.map((auction, index) => (
                  <div 
                    key={auction._id || `favorite-${index}`} 
                    className={`relative group transition-all duration-300 ${
                      isDarkMode ? 'ring-2 ring-gray-800 shadow-xl rounded-lg' : ''
                    }`}
                  >
                    {/* Card Component */}
                    <Card
                      title={auction.title || "Untitled Auction"}
                      startTime={auction.startTime}
                      endTime={auction.endTime}
                      imgSrc={auction.image?.url}
                      startingBid={auction.startingBid}
                      id={auction._id}
                    />

                    {/* Remove Button (appears on hover) */}
                    <button
                      onClick={() => handleRemoveFromFavorites(auction._id, auction.title || "Untitled")}
                      className="absolute top-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                      title="Remove from favorites"
                    >
                      <FaTrash className="text-red-500" />
                    </button>

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      {isAuctionActive(auction) ? (
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <FaGavel /> Active
                        </div>
                      ) : auction.startTime && new Date(auction.startTime) > new Date() ? (
                        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <FaRegCalendarAlt /> Upcoming
                        </div>
                      ) : (
                        <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <FaRegCalendarAlt /> Ended
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 shadow-md">
                <div className="bg-red-100/50 p-6 rounded-full mb-6">
                  <FaHeart className="text-red-400 text-5xl" />
                </div>
                <h3 className="text-2xl font-semibold text-[#134e5e] mb-3">No Favorites Found</h3>
                <p className="text-gray-600 text-center max-w-md mb-8">
                  {searchTerm
                    ? "No favorites match your search criteria. Try a different search term."
                    : "You haven't added any auctions to your favorites yet. Browse auctions and click the heart icon to add them here."}
                </p>
                <Link
                  to="/auctions"
                  className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] hover:from-[#2bd6bf] hover:to-[#00B3B3] text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-500 transform hover:scale-[1.02] flex items-center gap-2"
                >
                  <FaGavel /> Browse Auctions
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Favorites;