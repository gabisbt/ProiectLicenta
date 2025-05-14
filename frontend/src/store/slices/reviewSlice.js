// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// // URL de bază pentru API
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// // Acțiune asincronă pentru a prelua review-urile unui utilizator
// export const getUserReviews = createAsyncThunk(
//   "reviews/getUserReviews",
//   async (userId, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.get(`${API_URL}/reviews/user/${userId}`);
//       return data.reviews;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Couldn't fetch user reviews"
//       );
//     }
//   }
// );

// // Acțiune asincronă pentru a prelua statisticile de rating pentru un utilizator
// export const getUserRatingStats = createAsyncThunk(
//   "reviews/getUserRatingStats",
//   async (userId, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.get(`${API_URL}/reviews/stats/${userId}`);
//       return data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Couldn't fetch rating statistics"
//       );
//     }
//   }
// );

// // Acțiune asincronă pentru a crea un review nou
// export const createReview = createAsyncThunk(
//   "reviews/createReview",
//   async (reviewData, { rejectWithValue }) => {
//     try {
//       const config = {
//         headers: {
//           "Content-Type": "application/json",
//         },
//         withCredentials: true,
//       };

//       const { data } = await axios.post(
//         `${API_URL}/reviews`,
//         reviewData,
//         config
//       );
//       return data.review;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to submit review"
//       );
//     }
//   }
// );

// // Acțiune asincronă pentru a prelua review-urile pentru o licitație
// export const getAuctionReviews = createAsyncThunk(
//   "reviews/getAuctionReviews",
//   async (auctionId, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.get(`${API_URL}/reviews/auction/${auctionId}`);
//       return data.reviews;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Couldn't fetch auction reviews"
//       );
//     }
//   }
// );

// // Slice pentru review-uri
// const reviewSlice = createSlice({
//   name: "review",
//   initialState: {
//     reviews: [],
//     auctionReviews: [],
//     ratingStats: null,
//     loading: false,
//     success: false,
//     error: null,
//   },
//   reducers: {
//     clearErrors: (state) => {
//       state.error = null;
//     },
//     clearSuccess: (state) => {
//       state.success = false;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // getUserReviews
//       .addCase(getUserReviews.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(getUserReviews.fulfilled, (state, action) => {
//         state.loading = false;
//         state.reviews = action.payload;
//       })
//       .addCase(getUserReviews.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // getUserRatingStats
//       .addCase(getUserRatingStats.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(getUserRatingStats.fulfilled, (state, action) => {
//         state.loading = false;
//         state.ratingStats = action.payload;
//       })
//       .addCase(getUserRatingStats.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // createReview
//       .addCase(createReview.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(createReview.fulfilled, (state, action) => {
//         state.loading = false;
//         state.success = true;
//         state.reviews.push(action.payload);
//       })
//       .addCase(createReview.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // getAuctionReviews
//       .addCase(getAuctionReviews.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(getAuctionReviews.fulfilled, (state, action) => {
//         state.loading = false;
//         state.auctionReviews = action.payload;
//       })
//       .addCase(getAuctionReviews.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearErrors, clearSuccess } = reviewSlice.actions;
// export default reviewSlice.reducer;