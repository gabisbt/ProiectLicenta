import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams(); // Preia token-ul din URL
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            const response = await axios.put(
                `http://localhost:5000/api/v1/user/reset-password/${token}`,
                { password },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            setMessage(response.data.message);
        } catch (error) {
            setMessage(
                error.response?.data?.message || "An error occurred. Please try again."
            );
        }
    };

    return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-[#00B3B3] mb-4">
                    Reset Your Password
                </h2>
                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B3B3]"
                        placeholder="Enter new password"
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B3B3]"
                        placeholder="Confirm new password"
                    />
                    <button
                        type="submit"
                        className="bg-[#2bd6bf] text-white py-2 px-4 rounded-lg hover:bg-[#00B3B3] transition-all duration-300"
                    >
                        Reset Password
                    </button>
                </form>
                {message && (
                    <p className="text-center text-red-500 mt-4">{message}</p>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;