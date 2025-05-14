import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const About = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // miau
    const values = [
        {
            id: 1,
            title: "Integrity",
            description:
                "We prioritize honesty and transparency in all our dealings, ensuring a fair and ethical auction experience for everyone.",
            emoji: "🤝",
            color: "from-[#00B3B3] to-[#2bd6bf]",
        },
        {
            id: 2,
            title: "Innovation",
            description:
                "We continually enhance our platform with cutting-edge technology and features to provide users with a seamless and efficient auction process.",
            emoji: "💡",
            color: "from-[#2bd6bf] to-[#4ecca3]",
        },
        {
            id: 3,
            title: "Community",
            description:
                "We foster a vibrant community of buyers and sellers who share a passion for finding and offering exceptional items.",
            emoji: "🌍",
            color: "from-[#4ecca3] to-[#71b280]",
        },
        {
            id: 4,
            title: "Customer Focus",
            description:
                "We are committed to providing exceptional customer support and resources to help users navigate the auction process with ease.",
            emoji: "🎯",
            color: "from-[#71b280] to-[#00B3B3]",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { duration: 0.6 }
        }
    };

    return (
        <section className="w-full h-auto px-5 pt-24 pb-16 lg:pl-[320px] flex flex-col min-h-screen bg-gradient-to-b from-[#e0f7fa] via-[#f0f9f9] to-[#ffffff] relative overflow-hidden">
            {/* Background Elements */}
            {/* <div className="absolute top-20 right-0 w-72 h-72 bg-[#2bd6bf] opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#00B3B3] opacity-5 rounded-full blur-3xl"></div> */}
            
            {/* Titlu principal */}
            <motion.div 
                className="text-center mb-20 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="w-16 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto mb-6 rounded-full"></div>
                <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-5xl font-extrabold mb-6 md:text-7xl drop-shadow-xl">
                    About Us
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] mx-auto mt-6 mb-8 rounded-full"></div>
                
                <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                    Welcome to <span className="font-semibold text-[#00B3B3]">Retro Shop</span>, the ultimate destination for online auctions and bidding excitement. We are dedicated to providing a platform that connects buyers and sellers in a dynamic and engaging environment.
                </p>
            </motion.div>

            {/* Sectiunea Our Mission */}
            <motion.div 
                className="mb-20 max-w-6xl mx-auto w-full"
                variants={containerVariants}
                initial="hidden"
                animate={isLoaded ? "visible" : "hidden"}
            >
                <motion.div 
                    className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 relative overflow-hidden"
                    variants={itemVariants}
                >
                    <div className="absolute -top-6 -left-6 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-4 rounded-full flex items-center justify-center w-16 h-16 text-2xl font-bold shadow-lg">
                        M
                    </div>
                    
                    <h3 className="text-[#111] text-3xl font-bold mb-6 md:text-4xl ml-10">
                        Our <span className="text-[#00B3B3]">Mission</span>
                    </h3>
                    
                    <p className="text-lg text-gray-700 leading-relaxed">
                        At Retro Shop, our mission is to revolutionize the way people buy and sell products through online auctions. We aim to create a user-friendly platform that empowers individuals and businesses to participate in exciting bidding experiences, all while ensuring transparency, security, and trust.
                    </p>
                </motion.div>
            </motion.div>

            {/*Our Values */}
            <motion.div 
                className="mb-20"
                variants={containerVariants}
                initial="hidden"
                animate={isLoaded ? "visible" : "hidden"}
            >
                <motion.h3 
                    className="text-[#111] text-3xl font-bold mb-8 text-center md:text-4xl"
                    variants={itemVariants}
                >
                    Our <span className="text-[#00B3B3]">Values</span>
                </motion.h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {values.map((value, index) => (
                        <motion.div
                            key={value.id}
                            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 group transform hover:-translate-y-2"
                            variants={itemVariants}
                            whileHover={{ scale: 1.03 }}
                            style={{ transitionDelay: `${index * 0.1}s` }}
                        >
                            <div className={`bg-gradient-to-r ${value.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                {value.emoji}
                            </div>
                            <h4 className="text-[#00B3B3] text-xl font-bold mb-3 text-center group-hover:text-[#134e5e] transition-all duration-300">
                                {value.title}
                            </h4>
                            <p className="text-gray-700 text-center group-hover:text-gray-900 transition-all duration-300">
                                {value.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Sectiunea Our Story */}
            <motion.div 
                className="mb-20 max-w-6xl mx-auto w-full"
                variants={containerVariants}
                initial="hidden"
                animate={isLoaded ? "visible" : "hidden"}
            >
                <motion.div 
                    className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 relative overflow-hidden"
                    variants={itemVariants}
                >
                    <div className="absolute -top-6 -right-6 bg-gradient-to-r from-[#2bd6bf] to-[#00B3B3] text-white p-4 rounded-full flex items-center justify-center w-16 h-16 text-2xl font-bold shadow-lg">
                        S
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="w-full md:w-1/4 flex justify-center">
                            <div className="text-8xl">📖</div>
                        </div>
                        
                        <div className="w-full md:w-3/4">
                            <h3 className="text-[#111] text-3xl font-bold mb-6 md:text-4xl">
                                Our <span className="text-[#00B3B3]">Story</span>
                            </h3>
                            
                            <p className="text-lg text-gray-700 leading-relaxed">
                                Retro Shop was founded by a group of passionate individuals who recognized the potential of online auctions to transform the way people buy and sell products. With years of experience in e-commerce and technology, we set out to create a platform that combines innovation, integrity, and community engagement.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Sectiunea Join Us */}
            <motion.div 
                className="mb-20 max-w-6xl mx-auto w-full"
                variants={containerVariants}
                initial="hidden"
                animate={isLoaded ? "visible" : "hidden"}
            >
                <motion.div 
                    className="bg-gradient-to-r from-[#00B3B3]/10 to-[#2bd6bf]/10 backdrop-blur-md rounded-2xl p-8 shadow-xl transition-all duration-500 border border-white/50 relative overflow-hidden"
                    variants={itemVariants}
                >
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white p-5 rounded-full flex items-center justify-center w-20 h-20 text-3xl shadow-lg">
                        🤝
                    </div>
                    
                    <h3 className="text-[#111] text-3xl font-bold mb-6 text-center md:text-4xl mt-10">
                        Join <span className="text-[#00B3B3]">Us</span>
                    </h3>
                    
                    <p className="text-lg text-gray-700 max-w-4xl mx-auto text-center leading-relaxed">
                        We invite you to join our growing community of buyers and sellers at Retro Shop. Whether you're looking for unique items, collectibles, or simply want to experience the thrill of bidding, our platform has something for everyone. Sign up today and discover the excitement of online auctions with Retro Shop!
                    </p>
                    
                    <div className="mt-8 flex justify-center">
                        <a 
                            href="/sign-up" 
                            className="bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-white font-semibold rounded-full px-8 py-3 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Join Our Community
                        </a>
                    </div>
                </motion.div>
            </motion.div>

            <motion.div 
                className="text-center max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl mb-10 border border-white/50"
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
            >
                <div className="text-7xl mb-6">🙏</div>
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-2xl font-bold">
                    Thank you for choosing Retro Shop as your auction platform. 
                    <br />We look forward to serving you and making your auction experience unforgettable!
                </p>
            </motion.div>
        </section>
    );
};

export default About;