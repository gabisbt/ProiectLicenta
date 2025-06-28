import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Card from '@/custom-components/Card';
import { FaArrowLeft, FaUser, FaGavel, FaCheckCircle, FaEnvelope } from 'react-icons/fa';

const SellerAuctions = () => {
    const { sellerId } = useParams();
    const [auctions, setAuctions] = useState([]);
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [error, setError] = useState(null);
    const [statistics, setStatistics] = useState({ total: 0, active: 0, ended: 0 });

    useEffect(() => {
        fetchSellerAuctions();
    }, [sellerId, activeTab]);

    const fetchSellerAuctions = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔍 Fetching auctions for seller:', sellerId);
            console.log('🔍 Active tab:', activeTab);
            
            // Schimbă logica pentru a trimite parametrul corect
            const statusParam = activeTab === 'all' ? '' : activeTab;
            const url = statusParam 
                ? `http://localhost:5000/api/v1/auctionitem/seller/${sellerId}?status=${statusParam}`
                : `http://localhost:5000/api/v1/auctionitem/seller/${sellerId}`;
                
            console.log('🔗 Requesting URL:', url);
            
            const response = await axios.get(url);
            
            console.log('Response:', response.data);
            console.log('Auctions received:', response.data.auctions?.length);
            console.log('Statistics:', response.data.statistics);
            
            setAuctions(response.data.auctions || []);
            setSeller(response.data.seller);
            setStatistics(response.data.statistics || { total: 0, active: 0, ended: 0 });
            
        } catch (error) {
            console.error('Error fetching seller auctions:', error);
            setError('Nu am putut încărca licitațiile acestui vânzător.');
        } finally {
            setLoading(false);
        }
    };

    // Foloseste statisticile primite de la backend
    const activeAuctions = statistics.active;
    const endedAuctions = statistics.ended;
    const totalAuctions = statistics.total;

    if (loading) {
        return (
            <section className="w-full h-auto px-5 pt-20 lg:pl-[320px] flex flex-col min-h-screen bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa]">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00B3B3] mx-auto mb-4"></div>
                        <p className="text-[#134e5e] text-lg">Loading auctions...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-full h-auto px-5 pt-20 lg:pl-[320px] flex flex-col min-h-screen bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa]">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 text-lg">{error}</p>
                        <Link 
                            to="/auctions" 
                            className="inline-block mt-4 bg-[#00B3B3] text-white px-6 py-2 rounded-lg hover:bg-[#009999] transition-colors"
                        >
                            Back to auctions
                        </Link>
                    </div>
                </div>
            </section>
        );
    }
    
    // Debug temporar
    console.log('🔍 Debug info:', {
        activeTab,
        auctionsCount: auctions.length,
        statistics,
        seller: seller?.userName
    });

    return (
        <section className="w-full h-auto px-5 pt-20 lg:pl-[320px] flex flex-col min-h-screen bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa] pb-10">
            <div className="max-w-7xl mx-auto w-full">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6 bg-white/50 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm">
                    <Link
                        to="/auctions"
                        className="text-[#00B3B3] font-medium transition-all duration-300 hover:text-[#2bd6bf] flex items-center gap-2"
                    >
                        <FaArrowLeft className="text-sm" /> Back to auctions
                    </Link>
                </div>

                {/* Header cu informatii vanzator */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 mb-8">
                    <div className="flex items-center gap-6 mb-6">
                        {/* Avatar vanzator */}
                        <div className="w-20 h-20 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] rounded-full flex items-center justify-center overflow-hidden">
                            {seller?.profileImage?.url ? (
                                <img 
                                    src={seller.profileImage.url} 
                                    alt={seller.userName} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FaUser className="text-white text-2xl" />
                            )}
                        </div>
                        
                        {/* Informatii vanzator */}
                        <div className="flex-1">
                            <h1 className="text-[#134e5e] text-3xl font-bold mb-2">
                                {seller?.userName || 'Utilizator Necunoscut'}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <FaEnvelope className="text-[#00B3B3]" />
                                    <span>{seller?.email || 'Email indisponibil'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaGavel className="text-[#00B3B3]" />
                                    <span>Total auctions: {auctions.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistici */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                    <FaGavel className="text-white text-xl" />
                                </div>
                                <div>
                                    <p className="text-green-800 font-bold text-2xl">{activeAuctions}</p>
                                    <p className="text-green-600 font-medium">Active Auctions</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                    <FaCheckCircle className="text-white text-xl" />
                                </div>
                                <div>
                                    <p className="text-blue-800 font-bold text-2xl">{endedAuctions}</p>
                                    <p className="text-blue-600 font-medium">Ended Auctions</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs pentru filtrare */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-white/50 inline-flex">
                        <button 
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                                activeTab === 'all' 
                                    ? 'bg-[#00B3B3] text-white shadow-md' 
                                    : 'text-[#134e5e] hover:bg-[#00B3B3]/10'
                            }`}
                            onClick={() => setActiveTab('all')}
                        >
                            All ({totalAuctions})
                        </button>
                        <button 
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                                activeTab === 'active' 
                                    ? 'bg-[#00B3B3] text-white shadow-md' 
                                    : 'text-[#134e5e] hover:bg-[#00B3B3]/10'
                            }`}
                            onClick={() => setActiveTab('active')}
                        >
                            Active ({activeAuctions})
                        </button>
                        <button 
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                                activeTab === 'ended' 
                                    ? 'bg-[#00B3B3] text-white shadow-md' 
                                    : 'text-[#134e5e] hover:bg-[#00B3B3]/10'
                            }`}
                            onClick={() => setActiveTab('ended')}
                        >
                            Ended ({endedAuctions})
                        </button>
                    </div>
                </div>

                {/* Lista licitațiilor */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {auctions.length > 0 ? (
                        auctions.map((auction) => (
                            <Card 
                                key={auction._id} 
                                imgSrc={auction.image?.url}
                                title={auction.title}
                                startingBid={auction.startingBid}
                                currentBid={auction.currentBid}
                                startTime={auction.startTime}
                                endTime={auction.endTime}
                                id={auction._id}
                            />
                        ))
                    ) : (
                        <div className="col-span-full">
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-white/50 text-center">
                                <FaGavel className="text-gray-300 text-6xl mx-auto mb-4" />
                                <h3 className="text-[#134e5e] text-xl font-semibold mb-2">
                                    There are no auctions{activeTab === 'all' ? '' : activeTab}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {activeTab === 'all' 
                                        ? 'This user has not created any auctions yet..' 
                                        : `This user has no auctions. ${activeTab}.`
                                    }
                                </p>
                                <Link 
                                    to="/auctions"
                                    className="inline-block bg-[#00B3B3] text-white px-6 py-3 rounded-lg hover:bg-[#009999] transition-colors font-medium"
                                >
                                    
                                    Explore other auctions
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default SellerAuctions;