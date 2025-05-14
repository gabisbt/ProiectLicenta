import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaStar, FaRegStar, FaUser } from 'react-icons/fa';
import { getUserReviews, getUserRatingStats } from '../store/slices/reviewSlice';
import Spinner from './Spinner';

const UserRatings = ({ userId }) => {
  const dispatch = useDispatch();
  const { reviews, stats, loading } = useSelector((state) => state.reviews);

  useEffect(() => {
    if (userId) {
      dispatch(getUserRatingStats(userId));
      dispatch(getUserReviews({ userId }));
    }
  }, [userId, dispatch]);

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? (
              <FaStar className="text-yellow-400" />
            ) : (
              <FaRegStar className="text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
        <h3 className="text-[#134e5e] text-xl font-semibold mb-4">
          Rating Summary
        </h3>
        
        {stats && (
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-[#00B3B3]">
                {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
              </div>
              <div className="mt-2">
                {renderStars(Math.round(stats.averageRating || 0))}
              </div>
              <div className="text-gray-600 mt-1">
                {stats.totalReviews || 0} reviews
              </div>
            </div>
            
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3 mb-2">
                  <div className="flex items-center w-16">
                    {star} <FaStar className="text-yellow-400 ml-1" />
                  </div>
                  <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf]" 
                      style={{ 
                        width: `${stats.totalReviews ? (stats.distribution[star] / stats.totalReviews * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                  <div className="w-10 text-gray-600 text-sm">
                    {stats.distribution[star] || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div>
        <h3 className="text-[#134e5e] text-xl font-semibold mb-4">
          Recent Reviews
        </h3>
        
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white/50">
                <div className="flex justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {review.reviewer.profileImage ? (
                      <img 
                        src={review.reviewer.profileImage} 
                        alt={review.reviewer.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <FaUser className="text-gray-500" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{review.reviewer.userName}</div>
                      <div className="text-gray-500 text-sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                  </div>
                </div>
                
                {review.comment && (
                  <p className="text-gray-700 mt-2">{review.comment}</p>
                )}
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    For auction: 
                    <span className="text-[#00B3B3] font-medium">
                      {review.auction.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white/50 rounded-xl">
            <p className="text-gray-600">No reviews yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRatings;