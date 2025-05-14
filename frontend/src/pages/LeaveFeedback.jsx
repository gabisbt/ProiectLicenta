import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { createReview } from '../store/slices/reviewSlice';
import { toast } from 'react-toastify';

const LeaveFeedback = ({ recipientId, auctionId, reviewType, onComplete }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    dispatch(createReview({
      recipientId,
      auctionId,
      rating,
      comment,
      reviewType
    }))
    .unwrap()
    .then(() => {
      toast.success('Review submitted successfully!');
      if (onComplete) onComplete();
    })
    .catch((err) => {
      toast.error(err?.message || 'Failed to submit review');
    });
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
      <h3 className="text-[#134e5e] text-xl font-semibold mb-4">
        {reviewType === 'buyer-to-seller' ? 'Rate the seller' : 'Rate the buyer'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-gray-700 mb-2">Rating</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-2xl focus:outline-none transition-transform hover:scale-110"
              >
                {(hoveredRating || rating) >= value ? (
                  <FaStar className="text-yellow-400" />
                ) : (
                  <FaRegStar className="text-gray-300" />
                )}
              </button>
            ))}
            <span className="ml-2 text-gray-600 font-medium">
              {rating}/5
            </span>
          </div>
        </div>
        
        <div>
          <label className="text-gray-700">
            Comment (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full h-32 mt-2 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3B3]"
            placeholder="Share your experience..."
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] hover:from-[#2bd6bf] hover:to-[#00B3B3] text-white font-medium rounded-xl py-3 transition-all duration-300"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default LeaveFeedback;