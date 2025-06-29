import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

export const getUnpaidCommission = createAsyncThunk(
    "commission/getUnpaidCommission",
    async (_, { rejectWithValue }) => {
        try {
            console.log("Fetching unpaid commission...");
            const response = await axios.get(`http://localhost:5000/api/v1/user/commission/unpaid`, {
                withCredentials: true
            });
            console.log("API response:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching commission:", error);
            return rejectWithValue(error.response?.data || { message: "Failed to get commission data" });
        }
    }
);

const commissionSlice = createSlice({
    name: "commission",
    initialState: {
        unpaidCommission: 0, // Valoare implicită în loc de undefined
        loading: false,
        error: null
    },
    reducers: {
        postCommissionProofRequest(state) {
            state.loading = true;
        },
        postCommissionProofSuccess(state) {
            state.loading = false;
        },
        postCommissionProofFailed(state) {
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUnpaidCommission.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUnpaidCommission.fulfilled, (state, action) => {
                state.loading = false;
                // Asigură-te că extragi corect datele:
                state.unpaidCommission = action.payload.unpaidCommission;
                console.log("Commission data received:", action.payload);
            })
            .addCase(getUnpaidCommission.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    }
});

export const postCommissionProof = (data) => async (dispatch) => {
    dispatch(commissionSlice.actions.postCommissionProofRequest());
    try {
        const response = await axios.post(
            "http://localhost:5000/api/v1/commission/proof",
            data,
            {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        dispatch(commissionSlice.actions.postCommissionProofSuccess());
        toast.success(response.data.message);
    } catch (error) {
        dispatch(commissionSlice.actions.postCommissionProofFailed());
        toast.error(error.response?.data?.message || "An error occurred while uploading proof");
    }
};

export const { postCommissionProofRequest, postCommissionProofSuccess, postCommissionProofFailed } = commissionSlice.actions;

export default commissionSlice.reducer;