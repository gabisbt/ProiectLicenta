import { login } from '@/store/slices/userSlice';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope, FaLock, FaSignInAlt, FaKey, FaArrowLeft } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetMessage, setResetMessage] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    const { loading, isAuthenticated } = useSelector((state) => state.user);

    const navigateTo = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        dispatch(login(formData));
    };

    const handleForgotPassword = async () => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/v1/user/forgot-password",
                { email: resetEmail }
            );
            setResetMessage("A reset link has been sent to your email.");
            setTimeout(() => setResetMessage(""), 5000); // Mesajul dispare după 5 secunde
        } catch (error) {
            setResetMessage(
                error.response?.data?.message || "An error occurred. Please try again."
            );
            setTimeout(() => setResetMessage(""), 5000);
        }
        setShowForgotPassword(false);
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigateTo("/");
        }
    }, [dispatch, isAuthenticated, loading]);

    return (
        <>
            <section className="w-full h-screen flex items-center justify-center relative overflow-hidden lg:pl-[320px]">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#A2D9FF] via-[#6FD3D3] to-[#00BFA6] opacity-90 z-0"></div>

                {/* Background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#A2D9FF] opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-[#00BFA6] opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* Login card */}
                <div
                    className={`relative z-10 mx-auto w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl transform transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 to-transparent rounded-2xl opacity-50 z-0"></div>

                    <div className="relative z-10 p-8">
                        <div className="w-16 h-1 bg-gradient-to-r from-[#A2D9FF] to-[#00BFA6] mx-auto mb-6 rounded-full"></div>
                        <h1 className="text-[#00B3B3] text-3xl md:text-4xl font-extrabold text-center mb-8 drop-shadow-lg">
                            Welcome Back
                        </h1>

                        <form onSubmit={handleLogin} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2 group">
                                <label className="text-gray-700 font-medium flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                    <FaEnvelope className="text-[#00B3B3]" /> Email
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full py-3 px-4 bg-white/70 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 backdrop-blur-sm shadow-sm"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 group">
                                <label className="text-gray-700 font-medium flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                    <FaLock className="text-[#00B3B3]" /> Password
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full py-3 px-4 bg-white/70 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 backdrop-blur-sm shadow-sm"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                className="relative overflow-hidden bg-gradient-to-r from-[#2bd6bf] to-[#00BFA6] hover:from-[#00BFA6] hover:to-[#2bd6bf] text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                                type="submit"
                                disabled={loading}
                            >
                                <span className="relative z-10">{loading ? "Logging In..." : "Login"}</span>
                                {!loading && <FaSignInAlt className="relative z-10" />}
                                <div className="absolute top-0 left-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full transition-transform duration-1000 group-hover:translate-x-0"></div>
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/30">
                            <p className="text-center text-gray-700">
                                Don't have an account?{" "}
                                <Link to="/sign-up" className="text-[#00B3B3] font-semibold hover:underline">
                                    Sign Up
                                </Link>
                            </p>
                            <p className="text-center text-gray-700 mt-2">
                                Forgot your password?{" "}
                                <span
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-[#00B3B3] font-semibold hover:underline cursor-pointer"
                                >
                                    Reset it here
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Forgot password modal */}
            {showForgotPassword && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    style={{ marginLeft: "320px" }} 
                >
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                        <h2 className="text-2xl font-bold text-center text-[#00B3B3] mb-4">
                            Reset Password
                        </h2>
                        <p className="text-gray-600 text-center mb-4">
                            Enter your email address to receive a reset link.
                        </p>
                        <input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B3B3] transition-all duration-300 mb-4"
                            placeholder="Enter your email"
                        />
                        <div className="flex justify-between">
                            <button
                                onClick={() => setShowForgotPassword(false)}
                                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleForgotPassword}
                                className="bg-[#2bd6bf] text-white py-2 px-4 rounded-lg hover:bg-[#00B3B3] transition-all duration-300"
                            >
                                Send Reset Link
                            </button>
                        </div>
                    </div>
                </div>

            )}

            {/* Notification for reset password */}
            {resetMessage && (
                <div className="fixed bottom-6 left-[58%] transform -translate-x-1/2 bg-white px-6 py-4 rounded-xl shadow-2xl text-center text-gray-700 border-l-4 border-[#00B3B3] flex items-center animate-slideUp z-50 max-w-md">
                    <div className="bg-[#00B3B3]/10 rounded-full p-2 mr-3">
                        <FaEnvelope className="text-[#00B3B3]" />
                    </div>
                    <span>{resetMessage}</span>
                </div>
            )}
        </>
    );
};

export default Login;