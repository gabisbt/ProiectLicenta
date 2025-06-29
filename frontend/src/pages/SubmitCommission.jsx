import { postCommissionProof, getUnpaidCommission } from "@/store/slices/commissionSlice";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaFileInvoiceDollar, FaMoneyBillWave, FaFileUpload, FaCommentDots, FaPaperPlane, FaInfoCircle } from "react-icons/fa";

const SubmitCommission = () => {
    const [proof, setProof] = useState("");
    const [amount, setAmount] = useState("");
    const [comment, setComment] = useState("");
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const dispatch = useDispatch();
    const { unpaidCommission, loading } = useSelector((state) => state.commission);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        dispatch(getUnpaidCommission());
    }, [dispatch]);

    const proofHandler = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProof(file);
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setPreviewUrl(fileReader.result);
            };
            fileReader.readAsDataURL(file);
        }
    };

    const handlePaymentProof = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("proof", proof);
        formData.append("amount", amount);
        formData.append("comment", comment);
        dispatch(postCommissionProof(formData));
    };

    return (
        <section className="w-full h-auto px-5 pt-20 lg:pl-[320px] flex flex-col min-h-screen bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa] relative overflow-hidden">

            <div className={`max-w-4xl mx-auto w-full transform transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto mb-4 rounded-full"></div>
                    <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-4xl font-extrabold mb-2 md:text-5xl lg:text-6xl drop-shadow-lg">
                        Commission Payment
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] mx-auto mt-4 mb-2 rounded-full"></div>
                    <p className="text-gray-700 mt-4 max-w-2xl mx-auto">
                        Submit your commission payment proof to maintain your good standing on our platform.
                    </p>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 relative overflow-hidden">

                    <div className="relative z-10 mb-8 bg-gradient-to-r from-[#00B3B3]/5 to-[#2bd6bf]/5 rounded-xl p-6 border border-[#00B3B3]/10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-2 rounded-full">
                                <FaFileInvoiceDollar />
                            </div>
                            <h3 className="text-[#134e5e] text-xl font-semibold">Commission Information</h3>
                        </div>

                        <p className="text-gray-700 mb-4">
                            Your unpaid commission is calculated as 5% of the final bid amount for your successful auctions.
                        </p>

                        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50">
                            <div className="flex items-center gap-2">
                                <FaInfoCircle className="text-[#00B3B3] text-xl" />
                                <span className="font-medium text-gray-700">Total Unpaid Commission:</span>
                            </div>
                            <div className="text-xl font-bold text-[#00B3B3]">
                                {loading ?
                                    <span className="animate-pulse">Loading...</span> :
                                    `${unpaidCommission || 0} RON`
                                }
                            </div>
                        </div>
                    </div>


                    <form className="relative z-10 flex flex-col gap-6" onSubmit={handlePaymentProof}>
                        <div className="flex flex-col gap-2 group">
                            <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                <FaMoneyBillWave className="text-[#00B3B3]" /> Payment Amount
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300"
                                required
                                placeholder="Enter the amount in RON"
                            />
                        </div>

                        <div className="flex flex-col gap-2 group">
                            <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                <FaFileUpload className="text-[#00B3B3]" /> Payment Proof Screenshot
                            </label>

                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <label className="bg-white border border-gray-200 hover:border-[#00B3B3] rounded-xl px-4 py-3 flex items-center gap-2 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md flex-grow">
                                    <FaFileUpload className="text-[#00B3B3]" />
                                    <span className="text-gray-700">{proof ? proof.name : "Upload Payment Screenshot"}</span>
                                    <input
                                        type="file"
                                        onChange={proofHandler}
                                        className="hidden"
                                        accept="image/*"
                                        required
                                    />
                                </label>

                                {previewUrl && (
                                    <div className="w-32 h-32 border-2 border-[#00B3B3]/30 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={previewUrl}
                                            alt="Payment proof preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-gray-500 italic">
                                Please upload a clear screenshot of your payment confirmation.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 group">
                            <label className="text-gray-700 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                                <FaCommentDots className="text-[#00B3B3]" /> Additional Comments (Optional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                className="w-full py-3 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent transition-all duration-300 resize-none"
                                placeholder="Add any additional information about your payment"
                            />
                        </div>

                        <button
                            className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] hover:from-[#2bd6bf] hover:to-[#00B3B3] text-white font-semibold text-lg py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-3 mt-4"
                            type="submit"
                            disabled={loading}
                        >
                            <span>{loading ? "Submitting Payment..." : "Submit Payment Proof"}</span>
                            {!loading && <FaPaperPlane className="animate-pulse" />}
                        </button>
                    </form>
                </div>


                <div className="mt-6 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 text-center text-gray-600 text-sm">
                    <p>Note: Your payment proof will be reviewed by our team. You will be notified once it's approved.</p>
                </div>
            </div>
        </section>
    );
};

export default SubmitCommission;