import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000"; 

export const getPersonalizedRecommendations = createAsyncThunk(
  "recommendations/getPersonalized",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/recommendations/personalized`,
        {
          withCredentials: true,
          headers: {
            Authorization: localStorage.getItem("token")
              ? `Bearer ${localStorage.getItem("token")}`
              : undefined,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch recommendations"
      );
    }
  }
);

export const getSimilarAuctions = createAsyncThunk(
  "recommendations/getSimilar",
  async (auctionId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/recommendations/similar/${auctionId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: localStorage.getItem("token")
              ? `Bearer ${localStorage.getItem("token")}`
              : undefined,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch similar auctions"
      );
    }
  }
);

const recommendationSlice = createSlice({
  name: "recommendation",
  initialState: {
    personalizedRecommendations: [],
    userProfile: null, 
    loading: false,
    error: null,
  },
  reducers: {
    clearRecommendations: (state) => {
      state.personalizedRecommendations = [];
      state.userProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPersonalizedRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getPersonalizedRecommendations.fulfilled,
        (state, action) => {
          state.loading = false;
          state.personalizedRecommendations = action.payload.recommendations || [];
          state.userProfile = action.payload.userProfile || null; // Adaugă aceasta
        }
      )
      .addCase(getPersonalizedRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getSimilarAuctions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSimilarAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.similarAuctions = action.payload.similarAuctions;
        state.error = null;
      })
      .addCase(getSimilarAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRecommendations } = recommendationSlice.actions;
export default recommendationSlice.reducer;