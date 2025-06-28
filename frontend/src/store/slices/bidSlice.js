import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuctionDetail } from "./auctionSlice";

const bidSlice = createSlice({
    name: "bid",
    initialState: {
        loading: false,
    },
    reducers: {
        bidRequest(state, action) {
            state.loading = true;
        },
        bidSuccess(state, action) {
            state.loading = false;
        },
        bidFailed(state, action) {
            state.loading = false;
        },
        buyNowRequest(state, action) {
            state.loading = true;
        },
        buyNowSuccess(state, action) {
            state.loading = false;
        },
        buyNowFailed(state, action) {
            state.loading = false;
        },
    },
});

export const placeBid = (id, data) => async (dispatch) => {
    dispatch(bidSlice.actions.bidRequest());
    try {
        const response = await axios.post(`http://localhost:5000/api/v1/bid/place/${id}`, data, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        });
        dispatch(bidSlice.actions.bidSuccess());
        toast.success(response.data.message);
        dispatch(getAuctionDetail(id))
    } catch (error) {
        dispatch(bidSlice.actions.bidFailed());
        toast.error(error.response.data.message);
    }
};

export const buyNowAuction = (id) => async (dispatch) => {
    dispatch(bidSlice.actions.buyNowRequest());
    try {
        // Modifică URL-ul pentru a se potrivi cu ruta definită în backend
        const response = await axios.post(`http://localhost:5000/api/v1/bid/buy-now/${id}`, {}, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        });
        dispatch(bidSlice.actions.buyNowSuccess());
        toast.success(response.data.message || "Item purchased successfully with Buy Now option");
        dispatch(getAuctionDetail(id));
        return response.data;
    } catch (error) {
        dispatch(bidSlice.actions.buyNowFailed());
        toast.error(error.response?.data?.message || "Failed to process Buy Now purchase");
        throw error.response?.data || error;
    }
};

export default bidSlice.reducer;