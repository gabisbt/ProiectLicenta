import {configureStore} from "@reduxjs/toolkit"
import userReducer from "./slices/userSlice"
import commissionReducer from "./slices/commissionSlice"
import auctionReducer from "./slices/auctionSlice";
import bidReducer from "./slices/bidSlice";
import superAdminReducer from "./slices/superAdminSlice";
import favoriteReducer from "./slices/favoriteSlice";
import recommendationReducer from "./slices/recommendationSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        commission: commissionReducer,
        auction: auctionReducer, 
        bid: bidReducer,
        superAdmin: superAdminReducer,
        favorites: favoriteReducer,
        recommendation: recommendationReducer,
    },
});

export default store;