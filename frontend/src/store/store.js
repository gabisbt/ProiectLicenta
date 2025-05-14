import {configureStore} from "@reduxjs/toolkit"
import userReducer from "./slices/userSlice"
import commissionReducer from "./slices/commissionSlice"
import auctionReducer from "./slices/auctionSlice";
import bidReducer from "./slices/bidSlice";
import superAdminReducer from "./slices/superAdminSlice";
import favoriteReducer from "./slices/favoriteSlice";
// import reviewReducer from "./slices/reviewSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        commission: commissionReducer,
        auction: auctionReducer, 
        bid: bidReducer,
        superAdmin: superAdminReducer,
        favorites: favoriteReducer,
        // review: reviewReducer,
    },
});

export default store;