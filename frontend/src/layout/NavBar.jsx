// import React from "react";
// import { RiAuctionFill } from "react-icons/ri";
// import { MdLeaderboard, MdDashboard } from "react-icons/md";
// import { SiGooglesearchconsole } from "react-icons/si";
// import { BsFillInfoSquareFill } from "react-icons/bs";
// import { FaFacebook, FaUserCircle } from "react-icons/fa";
// import { RiInstagramFill } from "react-icons/ri";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "@/store/slices/userSlice";
// import { Link } from "react-router-dom";

// const Navbar = () => {
//     const { isAuthenticated, user } = useSelector((state) => state.user);
//     const dispatch = useDispatch();

//     const handleLogout = () => {
//         dispatch(logout());
//     };

//     return (
//         <nav className="w-full bg-[#f6f4f0] border-b-[1px] border-b-stone-500 shadow-md fixed top-0 z-50">
//             <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
//                 {/* Logo */}
//                 <Link to="/" className="text-2xl font-semibold">
//                     SBT<span className="text-[#00B3B3]">Bid</span>
//                 </Link>

//                 {/* Links */}
//                 <ul className="flex items-center gap-6">
//                     <li>
//                         <Link
//                             to="/auctions"
//                             className="flex items-center gap-2 text-xl font-semibold hover:text-[#00B3B3] transition-all duration-150"
//                         >
//                             <RiAuctionFill /> Auctions
//                         </Link>
//                     </li>
//                     <li>
//                         <Link
//                             to="/leaderboard"
//                             className="flex items-center gap-2 text-xl font-semibold hover:text-[#00B3B3] transition-all duration-150"
//                         >
//                             <MdLeaderboard /> Leaderboard
//                         </Link>
//                     </li>
//                     {isAuthenticated && user && user.role === "Auctioneer" && (
//                         <>
//                             <li>
//                                 <Link
//                                     to="/submit-commission"
//                                     className="flex items-center gap-2 text-xl font-semibold hover:text-[#00B3B3] transition-all duration-150"
//                                 >
//                                     Submit Commission
//                                 </Link>
//                             </li>
//                             <li>
//                                 <Link
//                                     to="/create-auction"
//                                     className="flex items-center gap-2 text-xl font-semibold hover:text-[#00B3B3] transition-all duration-150"
//                                 >
//                                     Create Auction
//                                 </Link>
//                             </li>
//                             <li>
//                                 <Link
//                                     to="/view-my-auctions"
//                                     className="flex items-center gap-2 text-xl font-semibold hover:text-[#00B3B3] transition-all duration-150"
//                                 >
//                                     View My Auctions
//                                 </Link>
//                             </li>
//                         </>
//                     )}
//                     {isAuthenticated && user && user.role === "Super Admin" && (
//                         <li>
//                             <Link
//                                 to="/dashboard"
//                                 className="flex items-center gap-2 text-xl font-semibold hover:text-[#00B3B3] transition-all duration-150"
//                             >
//                                 <MdDashboard /> Dashboard
//                             </Link>
//                         </li>
//                     )}
//                 </ul>

//                 {/* Authentication Buttons */}
//                 <div className="flex items-center gap-4">
//                     {!isAuthenticated ? (
//                         <>
//                             <Link
//                                 to="/sign-up"
//                                 className="bg-[#2bd6bf] text-white font-semibold py-1 px-4 rounded-md hover:bg-[#00B3B3] transition-all duration-300"
//                             >
//                                 Sign Up
//                             </Link>
//                             <Link
//                                 to="/login"
//                                 className="text-[#2bd6bf] border-2 border-[#2bd6bf] font-semibold py-1 px-4 rounded-md hover:bg-[#2bd6bf] hover:text-white transition-all duration-300"
//                             >
//                                 Login
//                             </Link>
//                         </>
//                     ) : (
//                         <button
//                             onClick={handleLogout}
//                             className="bg-[#2bd6bf] text-white font-semibold py-1 px-4 rounded-md hover:bg-[#00B3B3] transition-all duration-300"
//                         >
//                             Logout
//                         </button>
//                     )}
//                 </div>
//             </div>
//         </nav>
//     );
// };

// export default Navbar;

// import React from "react";
// import { RiAuctionFill } from "react-icons/ri";
// import { MdLeaderboard, MdDashboard } from "react-icons/md";
// import { SiGooglesearchconsole } from "react-icons/si";
// import { BsFillInfoSquareFill } from "react-icons/bs";
// import { FaFacebook, FaUserCircle } from "react-icons/fa";
// import { RiInstagramFill } from "react-icons/ri";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "@/store/slices/userSlice";
// import { Link } from "react-router-dom";

// const Navbar = () => {
//     const { isAuthenticated, user } = useSelector((state) => state.user);
//     const dispatch = useDispatch();

//     const handleLogout = () => {
//         dispatch(logout());
//     };

//     return (
//         <nav className="w-full bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] shadow-lg fixed top-0 z-50">
//             <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//                 {/* Logo */}
//                 <Link to="/" className="text-3xl font-bold text-white tracking-wide">
//                     SBT<span className="text-[#FFD700]">Bid</span>
//                 </Link>

//                 {/* Links */}
//                 <ul className="flex items-center gap-8">
//                     <li>
//                         <Link
//                             to="/auctions"
//                             className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
//                         >
//                             <RiAuctionFill /> Auctions
//                         </Link>
//                     </li>
//                     <li>
//                         <Link
//                             to="/leaderboard"
//                             className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
//                         >
//                             <MdLeaderboard /> Leaderboard
//                         </Link>
//                     </li>
//                     {isAuthenticated && user && user.role === "Auctioneer" && (
//                         <>
//                             <li>
//                                 <Link
//                                     to="/submit-commission"
//                                     className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
//                                 >
//                                     Submit Commission
//                                 </Link>
//                             </li>
//                             <li>
//                                 <Link
//                                     to="/create-auction"
//                                     className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
//                                 >
//                                     Create Auction
//                                 </Link>
//                             </li>
//                             <li>
//                                 <Link
//                                     to="/view-my-auctions"
//                                     className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
//                                 >
//                                     View My Auctions
//                                 </Link>
//                             </li>
//                         </>
//                     )}
//                     {isAuthenticated && user && user.role === "Super Admin" && (
//                         <li>
//                             <Link
//                                 to="/dashboard"
//                                 className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
//                             >
//                                 <MdDashboard /> Dashboard
//                             </Link>
//                         </li>
//                     )}
//                 </ul>

//                 {/* Authentication Buttons */}
//                 <div className="flex items-center gap-4">
//                     {!isAuthenticated ? (
//                         <>
//                             <Link
//                                 to="/sign-up"
//                                 className="bg-[#FFD700] text-[#1A202C] font-semibold py-2 px-6 rounded-full hover:bg-white hover:text-[#FFD700] transition-all duration-300 shadow-md"
//                             >
//                                 Sign Up
//                             </Link>
//                             <Link
//                                 to="/login"
//                                 className="text-white border-2 border-white font-semibold py-2 px-6 rounded-full hover:bg-white hover:text-[#1A202C] transition-all duration-300"
//                             >
//                                 Login
//                             </Link>
//                         </>
//                     ) : (
//                         <button
//                             onClick={handleLogout}
//                             className="bg-[#FFD700] text-[#1A202C] font-semibold py-2 px-6 rounded-full hover:bg-white hover:text-[#FFD700] transition-all duration-300 shadow-md"
//                         >
//                             Logout
//                         </button>
//                     )}
//                 </div>
//             </div>
//         </nav>
//     );
// };

// export default Navbar;

// import React from "react";
// import { RiAuctionFill } from "react-icons/ri";
// import { MdLeaderboard, MdDashboard } from "react-icons/md";
// import { SiGooglesearchconsole } from "react-icons/si";
// import { BsFillInfoSquareFill } from "react-icons/bs";
// import { FaFacebook, FaUserCircle } from "react-icons/fa";
// import { RiInstagramFill } from "react-icons/ri";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "@/store/slices/userSlice";
// import { Link } from "react-router-dom";

// const Navbar = () => {
//     const { isAuthenticated, user } = useSelector((state) => state.user);
//     const dispatch = useDispatch();

//     const handleLogout = () => {
//         dispatch(logout());
//     };

//     return (
//         <nav className="w-full bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] shadow-lg fixed top-0 z-50">
//             <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//                 {/* Logo */}
//                 <Link to="/" className="text-3xl font-bold text-white tracking-wide">
//                     SBT<span className="text-[#FFD700]">Bid</span>
//                 </Link>

//                 {/* Links */}
//                 <ul className="flex items-center gap-8">
//                     <li>
//                         <Link
//                             to="/auctions"
//                             className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
//                         >
//                             <RiAuctionFill /> Auctions
//                         </Link>
//                     </li>
//                     <li>
//                         <Link
//                             to="/leaderboard"
//                             className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
//                         >
//                             <MdLeaderboard /> Leaderboard
//                         </Link>
//                     </li>
//                     <li>
//                         <Link
//                             to="/how-it-works-info"
//                             className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
//                         >
//                             <SiGooglesearchconsole /> How It Works
//                         </Link>
//                     </li>
//                     <li>
//                         <Link
//                             to="/about"
//                             className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
//                         >
//                             <BsFillInfoSquareFill /> About Us
//                         </Link>
//                     </li>
//                     {isAuthenticated && user && user.role === "Auctioneer" && (
//                         <>
//                             <li>
//                                 <Link
//                                     to="/submit-commission"
//                                     className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
//                                 >
//                                     Submit Commission
//                                 </Link>
//                             </li>
//                             <li>
//                                 <Link
//                                     to="/create-auction"
//                                     className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
//                                 >
//                                     Create Auction
//                                 </Link>
//                             </li>
//                             <li>
//                                 <Link
//                                     to="/view-my-auctions"
//                                     className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
//                                 >
//                                     View My Auctions
//                                 </Link>
//                             </li>
//                         </>
//                     )}
//                     {isAuthenticated && user && user.role === "Super Admin" && (
//                         <li>
//                             <Link
//                                 to="/dashboard"
//                                 className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
//                             >
//                                 <MdDashboard /> Dashboard
//                             </Link>
//                         </li>
//                     )}
//                 </ul>

//                 {/* Authentication Buttons */}
//                 <div className="flex items-center gap-4">
//                     {!isAuthenticated ? (
//                         <>
//                             <Link
//                                 to="/sign-up"
//                                 className="bg-[#FFD700] text-[#1A202C] font-semibold py-2 px-6 rounded-full hover:bg-white hover:text-[#FFD700] transition-all duration-300 shadow-md"
//                             >
//                                 Sign Up
//                             </Link>
//                             <Link
//                                 to="/login"
//                                 className="text-white border-2 border-white font-semibold py-2 px-6 rounded-full hover:bg-white hover:text-[#1A202C] transition-all duration-300"
//                             >
//                                 Login
//                             </Link>
//                         </>
//                     ) : (
//                         <button
//                             onClick={handleLogout}
//                             className="bg-[#FFD700] text-[#1A202C] font-semibold py-2 px-6 rounded-full hover:bg-white hover:text-[#FFD700] transition-all duration-300 shadow-md"
//                         >
//                             Logout
//                         </button>
//                     )}
//                 </div>
//             </div>
//         </nav>
//     );
// };

// export default Navbar;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { RiAuctionFill } from "react-icons/ri";
import { MdLeaderboard, MdDashboard } from "react-icons/md";
import { SiGooglesearchconsole } from "react-icons/si";
import { BsFillInfoSquareFill } from "react-icons/bs";
import { FaFacebook, FaUserCircle } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/userSlice";

const Navbar = () => {
    const { isAuthenticated, user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <>
            {/* Navbar */}
            <nav className="w-full bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] shadow-lg fixed top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="text-3xl font-bold text-white tracking-wide">
                        SBT<span className="text-[#FFD700]">Bid</span>
                    </Link>

                    {/* Links for large screens */}
                    <ul className="hidden lg:flex items-center gap-8">
                        <li>
                            <Link
                                to="/auctions"
                                className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
                            >
                                <RiAuctionFill /> Auctions
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/leaderboard"
                                className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
                            >
                                <MdLeaderboard /> Leaderboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/how-it-works-info"
                                className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
                            >
                                <SiGooglesearchconsole /> How It Works
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/about"
                                className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
                            >
                                <BsFillInfoSquareFill /> About Us
                            </Link>
                        </li>
                        {isAuthenticated && user && user.role === "Auctioneer" && (
                            <>
                                <li>
                                    <Link
                                        to="/submit-commission"
                                        className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
                                    >
                                        Submit Commission
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/create-auction"
                                        className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
                                    >
                                        Create Auction
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/view-my-auctions"
                                        className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
                                    >
                                        View My Auctions
                                    </Link>
                                </li>
                            </>
                        )}
                        {isAuthenticated && user && user.role === "Super Admin" && (
                            <li>
                                <Link
                                    to="/dashboard"
                                    className="flex items-center gap-2 text-lg font-medium text-white hover:text-[#FFD700] transition-all duration-300"
                                >
                                    <MdDashboard /> Dashboard
                                </Link>
                            </li>
                        )}
                    </ul>

                    {/* Authentication Buttons for large screens */}
                    <div className="hidden lg:flex items-center gap-4">
                        {!isAuthenticated ? (
                            <>
                                <Link
                                    to="/sign-up"
                                    className="bg-[#FFD700] text-[#1A202C] font-semibold py-2 px-6 rounded-full hover:bg-white hover:text-[#FFD700] transition-all duration-300 shadow-md"
                                >
                                    Sign Up
                                </Link>
                                <Link
                                    to="/login"
                                    className="text-white border-2 border-white font-semibold py-2 px-6 rounded-full hover:bg-white hover:text-[#1A202C] transition-all duration-300"
                                >
                                    Login
                                </Link>
                            </>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="bg-[#FFD700] text-[#1A202C] font-semibold py-2 px-6 rounded-full hover:bg-white hover:text-[#FFD700] transition-all duration-300 shadow-md"
                            >
                                Logout
                            </button>
                        )}
                    </div>

                    {/* Hamburger Menu for small screens */}
                    <div
                        className="lg:hidden text-white text-3xl cursor-pointer"
                        onClick={() => setIsOpen(true)}
                    >
                        <GiHamburgerMenu />
                    </div>
                </div>
            </nav>

            {/* SideDrawer */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setIsOpen(false)}
                    ></div>

                    {/* Drawer */}
                    <div className="fixed top-0 left-0 h-full w-[75%] max-w-[300px] bg-white shadow-lg z-50 transform translate-x-0 transition-transform duration-300">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-xl font-bold text-[#00B3B3]">Menu</h2>
                            <IoMdClose
                                className="text-2xl text-[#00B3B3] cursor-pointer"
                                onClick={() => setIsOpen(false)}
                            />
                        </div>
                        <ul className="p-4 space-y-4">
                            <li>
                                <Link
                                    to="/auctions"
                                    className="text-lg font-medium text-gray-700 hover:text-[#00B3B3]"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Auctions
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/leaderboard"
                                    className="text-lg font-medium text-gray-700 hover:text-[#00B3B3]"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Leaderboard
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/how-it-works-info"
                                    className="text-lg font-medium text-gray-700 hover:text-[#00B3B3]"
                                    onClick={() => setIsOpen(false)}
                                >
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className="text-lg font-medium text-gray-700 hover:text-[#00B3B3]"
                                    onClick={() => setIsOpen(false)}
                                >
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                </>
            )}
        </>
    );
};

export default Navbar;