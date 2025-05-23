import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',  
  withCredentials: true  
});

const initialState = {
  favorites: [],
  loading: false,
  error: null
};

export const getFavorites = createAsyncThunk(
  'favorites/getFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/favorites');
      return response.data.favorites;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get favorites');
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'favorites/addToFavorites',
  async (auction, { rejectWithValue }) => {
    try {
      await api.post(`/favorites/add/${auction._id}`);
      return auction;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to favorites');
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'favorites/removeFromFavorites',
  async (auctionId, { rejectWithValue }) => {
    try {
      await api.delete(`/favorites/remove/${auctionId}`);
      return auctionId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from favorites');
    }
  }
);

export const checkFavorite = createAsyncThunk(
  'favorites/checkFavorite',
  async (auctionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/favorites/check/${auctionId}`);
      return { 
        auctionId,
        isFavorite: response.data.isFavorite 
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check favorite status');
    }
  }
);

// Adaugă acțiunea de reset
export const resetFavorites = createAsyncThunk(
  "favorites/resetFavorites",
  async (_, { rejectWithValue }) => {
    return []; // Returnează un array gol
  }
);

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.favorites = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFavorites.fulfilled, (state, action) => {
        state.favorites = Array.isArray(action.payload) 
          ? action.payload.filter(Boolean)
          : [];
        state.loading = false;
      })
      .addCase(getFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(addToFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        if (action.payload && action.payload._id) {
          if (!state.favorites.some(fav => fav && fav._id === action.payload._id)) {
            state.favorites.push(action.payload);
          }
        }
        state.loading = false;
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(removeFromFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter(fav => 
          fav && fav._id && fav._id !== action.payload
        );
        state.loading = false;
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkFavorite.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Adaugă un handler pentru resetFavorites
      .addCase(resetFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetFavorites.fulfilled, (state, action) => {
        state.favorites = [];
        state.loading = false;
        state.error = null;
      })
      .addCase(resetFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearFavorites } = favoriteSlice.actions;
export const selectFavorites = (state) => state.favorites.favorites;
export const selectFavoritesLoading = (state) => state.favorites.loading;
export const selectFavoritesError = (state) => state.favorites.error;

export default favoriteSlice.reducer;