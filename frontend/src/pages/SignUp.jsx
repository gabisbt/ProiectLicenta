import { register } from "@/store/slices/userSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUserTag, FaLock, FaCamera, FaUpload, FaMoneyCheckAlt, FaPaypal, FaArrowRight } from "react-icons/fa";

const SignUp = () => {
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [role, setRole] = useState("");
    const [password, setPassword] = useState("");
    const [bankAccountName, setBankAccountName] = useState("");
    const [bankAccountNumber, setBankAccountNumber] = useState("");
    const [bankName, setBankName] = useState("");
    const [paypalEmail, setPaypalEmail] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [profileImagePreview, setProfileImagePreview] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    const { loading, isAuthenticated } = useSelector(state => state.user);
    const navigateTo = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleRegister = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("userName", userName);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("password", password);
        formData.append("address", address);
        formData.append("role", role);
        formData.append("profileImage", profileImage);
        role === "Auctioneer" &&
            (formData.append("bankAccountName", bankAccountName),
                formData.append("bankAccountNumber", bankAccountNumber),
                formData.append("bankName", bankName),
                formData.append("paypalEmail", paypalEmail));
        dispatch(register(formData));
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigateTo("/");
        }
    }, [dispatch, loading, isAuthenticated]);


    const imageHandler = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setProfileImagePreview(reader.result);
            setProfileImage(file);
        };
    };


    return (
        <>
            <section className="w-full h-auto px-5 pt-20 pb-10 lg:pl-[320px] flex flex-col min-h-screen bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa] relative overflow-hidden">
                {/* Background Elements */}
                {/* <div className="absolute top-20 right-0 w-72 h-72 bg-[#2bd6bf] opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#00B3B3] opacity-5 rounded-full blur-3xl"></div> */}

                <div className={`max-w-4xl mx-auto w-full transform transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="text-center mb-8">
                        <div className="w-16 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto mb-4 rounded-full"></div>
                        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-4xl font-extrabold mb-2 md:text-5xl lg:text-6xl drop-shadow-lg">
                            Create an Account
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] mx-auto mt-4 rounded-full"></div>
                        <p className="text-gray-700 mt-4 max-w-2xl mx-auto">
                            Join our exclusive auction community to start buying or selling unique items.
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 relative overflow-hidden">

                        <form className="relative z-10 flex flex-col gap-8" onSubmit={handleRegister}>
                            {/* Personal Details Section */}
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-2 rounded-full">
                                        <FaUser />
                                    </div>
                                    <h2 className="text-[#134e5e] text-xl font-semibold">Personal Details</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2 group">
                                        <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                            <FaUser className="text-[#00B3B3]" /> Full Name
                                        </label>
                                        <input 
                                            type="text" 
                                            value={userName} 
                                            onChange={(e) => setUserName(e.target.value)}
                                            className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                            required
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 group">
                                        <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                            <FaEnvelope className="text-[#00B3B3]" /> Email
                                        </label>
                                        <input 
                                            type="email" 
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                            required
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 group">
                                        <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                            <FaPhone className="text-[#00B3B3]" /> Phone
                                        </label>
                                        <input 
                                            type="tel" 
                                            value={phone} 
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                            required
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 group">
                                        <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                            <FaMapMarkerAlt className="text-[#00B3B3]" /> Address
                                        </label>
                                        <input 
                                            type="text" 
                                            value={address} 
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                            required
                                            placeholder="Enter your address"
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 group">
                                        <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                            <FaUserTag className="text-[#00B3B3]" /> Role
                                        </label>
                                        <select 
                                            value={role} 
                                            onChange={(e) => setRole(e.target.value)}
                                            className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                            required
                                        >
                                            <option value="">Select Role</option>
                                            <option value="Auctioneer">Auctioneer</option>
                                            <option value="Bidder">Bidder</option>
                                        </select>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 group">
                                        <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                            <FaLock className="text-[#00B3B3]" /> Password
                                        </label>
                                        <input 
                                            type="password" 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                            required
                                            placeholder="Create a password"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 mt-6">
                                    <label className="text-gray-700 flex items-center gap-2">
                                        <FaCamera className="text-[#00B3B3]" /> Profile Image
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-[#00B3B3]/30">
                                            {profileImagePreview ? (
                                                <img 
                                                    src={profileImagePreview} 
                                                    alt="Profile preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <FaUser className="text-gray-300 text-3xl" />
                                            )}
                                        </div>
                                        <label className="bg-white border border-gray-200 hover:border-[#00B3B3] rounded-xl px-4 py-3 flex items-center gap-2 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md">
                                            <FaUpload className="text-[#00B3B3]" />
                                            <span className="text-gray-700">Upload Profile Image</span>
                                            <input 
                                                type="file" 
                                                onChange={imageHandler} 
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Section */}
                            <div className={`transition-all duration-500 ${role === "Auctioneer" ? "opacity-100" : "opacity-50"}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-2 rounded-full">
                                        <FaMoneyCheckAlt />
                                    </div>
                                    <div>
                                        <h2 className="text-[#134e5e] text-xl font-semibold">Payment Method Details</h2>
                                        <p className="text-sm text-gray-500">Required only for Auctioneers</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2 group md:col-span-2">
                                        <label className="text-gray-700 font-medium">Bank Details</label>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-sm text-gray-500">Bank</label>
                                                <select 
                                                    value={bankName} 
                                                    onChange={(e) => setBankName(e.target.value)}
                                                    className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                                    disabled={role !== "Auctioneer"}
                                                >
                                                    <option value="">Select Bank</option>
                                                    <option value="BT">BT</option>
                                                    <option value="BCR">BCR</option>
                                                    <option value="BRD">BRD</option>
                                                    <option value="ING">ING</option>
                                                    <option value="Raiffeisen Bank">Raiffeisen Bank</option>
                                                    <option value="UniCredit Bank">UniCredit Bank</option>
                                                    <option value="Alpha Bank">Alpha Bank</option>
                                                </select>
                                            </div>
                                            
                                            <div className="flex flex-col gap-1">
                                                <label className="text-sm text-gray-500">IBAN</label>
                                                <input 
                                                    type="text" 
                                                    value={bankAccountNumber} 
                                                    onChange={(e) => setBankAccountNumber(e.target.value)}
                                                    className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                                    disabled={role !== "Auctioneer"}
                                                    placeholder="ROXX XXXX XXXX XXXX XXXX XXXX"
                                                />
                                            </div>
                                            
                                            <div className="flex flex-col gap-1">
                                                <label className="text-sm text-gray-500">Account Name</label>
                                                <input 
                                                    type="text" 
                                                    value={bankAccountName} 
                                                    onChange={(e) => setBankAccountName(e.target.value)}
                                                    className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                                    disabled={role !== "Auctioneer"}
                                                    placeholder="Name on bank account"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 group md:col-span-2">
                                        <div className="flex items-center gap-2">
                                            <FaPaypal className="text-[#00B3B3]" />
                                            <label className="text-gray-700 font-medium">PayPal Details</label>
                                        </div>
                                        <input 
                                            type="email" 
                                            value={paypalEmail} 
                                            onChange={(e) => setPaypalEmail(e.target.value)}
                                            className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                            disabled={role !== "Auctioneer"}
                                            placeholder="PayPal email address"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] hover:from-[#2bd6bf] hover:to-[#00B3B3] text-white font-semibold text-lg py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-3 mt-4"
                                type="submit" 
                                disabled={loading}
                            >
                                <span>{loading ? "Creating Account..." : "Create Account"}</span>
                                {!loading && <FaArrowRight />}
                            </button>
                            
                            <p className="text-center text-gray-600">
                                Already have an account? {" "}
                                <Link to="/login" className="text-[#00B3B3] font-semibold hover:underline">
                                    Sign In
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
};

export default SignUp;