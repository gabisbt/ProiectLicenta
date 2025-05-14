import React, { useState, useEffect } from "react";
import { RiAuctionFill, RiInstagramFill } from "react-icons/ri";
import { MdLeaderboard, MdDashboard } from "react-icons/md";
import { SiGooglesearchconsole } from "react-icons/si";
import { BsFillInfoSquareFill } from "react-icons/bs";
import { FaFacebook, FaUserCircle, FaEye, FaSignOutAlt, FaChevronRight, FaHeart } from "react-icons/fa";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { IoIosCreate } from "react-icons/io";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/userSlice";
import { Link, useLocation } from "react-router-dom";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useTheme } from "../context/ThemeContext.jsx";

const SideDrawer = () => {
    const [show, setShow] = useState(false);
    const [activeLink, setActiveLink] = useState("");
    const { isAuthenticated, user } = useSelector(state => state.user);
    const { favorites = [] } = useSelector(state => state.favorites || { favorites: [] });
    const { darkMode, toggleTheme } = useTheme();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location]);

    const handleLogout = () => {
        dispatch(logout());
    };

    const menuItems = [
        {
            title: "Auctions",
            path: "/auctions",
            icon: <RiAuctionFill className="text-2xl" />,
            showAlways: true
        },
        {
            title: "Leaderboard",
            path: "/leaderboard",
            icon: <MdLeaderboard className="text-2xl" />,
            showAlways: true
        },
        {
            title: "My Favorites",
            path: "/favorites",
            icon: <FaHeart className="text-2xl" />,
            role: "Bidder",
            badge: favorites?.length || 0
        },
        {
            title: "Submit Commission",
            path: "/submit-commission",
            icon: <FaFileInvoiceDollar className="text-2xl" />,
            role: "Auctioneer"
        },
        {
            title: "Create Auction",
            path: "/create-auction",
            icon: <IoIosCreate className="text-2xl" />,
            role: "Auctioneer"
        },
        {
            title: "View My Auctions",
            path: "/view-my-auctions",
            icon: <FaEye className="text-2xl" />,
            role: "Auctioneer"
        },
        {
            title: "Dashboard",
            path: "/dashboard",
            icon: <MdDashboard className="text-2xl" />,
            role: "Super Admin"
        }
    ];

    const secondaryMenuItems = [
        {
            title: "Profile",
            path: "/me",
            icon: <FaUserCircle className="text-2xl" />,
            authenticated: true
        },
        {
            title: "How it works",
            path: "/how-it-works-info",
            icon: <SiGooglesearchconsole className="text-2xl" />,
            showAlways: true
        },
        {
            title: "About Us",
            path: "/about",
            icon: <BsFillInfoSquareFill className="text-2xl" />,
            showAlways: true
        }
    ];

    const isMenuItemVisible = (item) => {
        if (item.showAlways) return true;
        if (item.authenticated && isAuthenticated) return true;
        if (item.role && isAuthenticated && user && user.role === item.role) return true;
        return false;
    };

    return (
        <>
            {/* Hamburger Menu Button */}
            <button
                onClick={() => setShow(!show)}
                className="fixed right-5 top-5 bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] text-white text-3xl p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-[101] lg:hidden"
            >
                {show ? <IoClose /> : <HiMenuAlt3 />}
            </button>

            {/* Sidebar Overlay - Mobile Only */}
            {show && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99] lg:hidden"
                    onClick={() => setShow(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`w-[100%] sm:w-[320px] fixed top-0 z-[100] h-full
        ${show ? "left-0" : "left-[-100%]"} 
        lg:left-0 transition-all duration-300 ease-in-out
        bg-gradient-to-b from-white to-[#f8fdfd] dark:from-gray-900 dark:to-gray-800
        shadow-2xl border-r border-[#e0f7fa]/50 dark:border-gray-700`}
            >

                <div className="h-full flex flex-col justify-between p-6 overflow-y-auto">
                    {/* Header and Navigation */}
                    <div>
                        {/* Logo */}
                        <Link to="/" className="block mb-8" onClick={() => setShow(false)}>
                            <h4 className="text-3xl font-bold flex items-center">
                                <span className="bg-gradient-to-r from-[#134e5e] to-[#2bd6bf] text-transparent bg-clip-text">
                                    Retro
                                </span>
                                <span className="text-[#00B3B3] ml-1">Shop</span>
                                <div className="w-2 h-2 rounded-full bg-[#2bd6bf] ml-1 animate-pulse"></div>
                            </h4>
                        </Link>

                        {/* Primary Navigation */}
                        <nav className="mb-8">
                            <ul className="space-y-2">
                                {menuItems.map((item, index) => (
                                    isMenuItemVisible(item) && (
                                        <li key={index}>
                                            <Link
                                                to={item.path}
                                                onClick={() => setShow(false)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                                                    ${activeLink === item.path
                                                        ? "bg-gradient-to-r from-[#2bd6bf]/10 to-[#00B3B3]/10 text-[#00B3B3] border-l-4 border-[#00B3B3]"
                                                        : "hover:bg-[#f0f9ff] hover:text-[#00B3B3]"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`${activeLink === item.path ? "text-[#00B3B3]" : item.path === "/favorites" ? "text-red-500" : "text-gray-600"}`}>
                                                        {item.icon}
                                                    </span>
                                                    <span className="font-medium text-lg">{item.title}</span>
                                                    {/* Badge pentru favorite */}
                                                    {item.path === "/favorites" && item.badge > 0 && (
                                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] flex items-center justify-center">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                {activeLink === item.path && <FaChevronRight className="text-[#00B3B3]" />}
                                            </Link>
                                        </li>
                                    )
                                ))}
                            </ul>
                        </nav>

                        {/* Auth Buttons */}
                        {!isAuthenticated ? (
                            <div className="flex flex-col gap-3 my-6">
                                <Link
                                    to="/sign-up"
                                    onClick={() => setShow(false)}
                                    className="bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] text-white font-semibold text-lg py-3 px-6 rounded-xl shadow-md hover:shadow-lg hover:from-[#00B3B3] hover:to-[#2bd6bf] transition-all duration-300 text-center"
                                >
                                    Sign Up
                                </Link>
                                <Link
                                    to="/login"
                                    onClick={() => setShow(false)}
                                    className="bg-white text-[#00B3B3] border border-[#00B3B3] font-semibold text-lg py-3 px-6 rounded-xl shadow-sm hover:shadow-md hover:bg-[#f0f9ff] transition-all duration-300 text-center"
                                >
                                    Login
                                </Link>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setShow(false);
                                }}
                                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white font-semibold text-lg py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 my-6"
                            >
                                <FaSignOutAlt /> Logout
                            </button>
                        )}

                        <div className="h-px bg-gradient-to-r from-transparent via-[#2bd6bf]/30 to-transparent my-6"></div>

                        {/* Secondary Navigation */}
                        <nav>
                            <ul className="space-y-2">
                                {secondaryMenuItems.map((item, index) => (
                                    isMenuItemVisible(item) && (
                                        <li key={index}>
                                            <Link
                                                to={item.path}
                                                onClick={() => setShow(false)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                                                    ${activeLink === item.path
                                                        ? "bg-gradient-to-r from-[#2bd6bf]/10 to-[#00B3B3]/10 text-[#00B3B3] border-l-4 border-[#00B3B3]"
                                                        : "hover:bg-[#f0f9ff] hover:text-[#00B3B3]"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`${activeLink === item.path ? "text-[#00B3B3]" : "text-gray-600"}`}>
                                                        {item.icon}
                                                    </span>
                                                    <span className="font-medium text-lg">{item.title}</span>
                                                </div>
                                                {activeLink === item.path && <FaChevronRight className="text-[#00B3B3]" />}
                                            </Link>
                                        </li>
                                    )
                                ))}
                            </ul>
                        </nav>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-3 mb-4">
                            <Link
                                to="/contact"
                                onClick={() => setShow(false)}
                                className="bg-gradient-to-r from-[#2bd6bf]/10 to-[#00B3B3]/10 text-[#00B3B3] p-3 rounded-full hover:shadow-md transition-all duration-300 flex items-center justify-center"
                            >
                                Contact
                            </Link>

                            {/* Dark Mode Toggle Button */}
                            <button
                                onClick={toggleTheme}
                                className="bg-gradient-to-r from-[#2bd6bf]/10 to-[#00B3B3]/10 text-[#00B3B3] dark:text-[#22d3ee] p-3 rounded-full hover:shadow-md transition-all duration-300 flex items-center justify-center"
                                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {darkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

const Header = () => {
    return (
        <header className="fixed w-full top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                    {/* Logo și alte elemente */}
                </div>

                <div className="flex items-center gap-4">
                    {/* Alte butoane */}
                </div>
            </div>
        </header>
    );
};

export { Header };
export default SideDrawer;