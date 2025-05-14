import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const userSlice = createSlice({
    name: "user",
    initialState: {
        loading: false,
        isAuthenticated: false,
        user: {},
        leaderboard: [],
    },
    reducers: {
        registerRequest(state, action) {
            state.loading = true;
            state.isAuthenticated = false;
            state.user = {};
        },
        registerSuccess(state, action) {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
        },
        registerFailed(state, action) {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = {};
        },

        loginRequest(state, action) {
            state.loading = true;
            state.isAuthenticated = false;
            state.user = {};
        },
        loginSuccess(state, action) {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
        },
        loginFailed(state, action) {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = {};
        },

        fetchUserRequest(state, action) {
            state.loading = true;
            state.isAuthenticated = false;
            state.user = {};
        },
        fetchUserSuccess(state, action) {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
        },
        fetchUserFailed(state, action) {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = {};
        },

        logoutSuccess(state, action) {
            state.isAuthenticated = false;
            state.user = {};
        },
        logoutFailed(state, action) {
            state.loading = false;
            state.isAuthenticated = state.isAuthenticated;
            state.user = state.user;
        },

        fetchLeaderboardRequest(state, action) {
            state.loading = true;
            state.leaderboard = [];
        },
        fetchLeaderboardSuccess(state, action) {
            state.loading = false;
            state.leaderboard = action.payload;
        },
        fetchLeaderboardFailed(state, action) {
            state.loading = false;
            state.leaderboard = [];
        },
        clearAllErrors(state, action) {
            state.user = state.user;
            state.isAuthenticated = state.isAuthenticated;
            state.leaderboard = state.leaderboard;
            state.loading = false;
        },
    },
});

export const register = (data) => async (dispatch) => {
    dispatch(userSlice.actions.registerRequest());
    try {
        const response = await axios.post(
            "http://localhost:5000/api/v1/user/register",
            data,
            {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        dispatch(userSlice.actions.registerSuccess(response.data));
        toast.success(response.data.message);
        dispatch(userSlice.actions.clearAllErrors());
    } catch (error) {
        dispatch(userSlice.actions.registerFailed());
        toast.error(error.response.data.message);
        dispatch(userSlice.actions.clearAllErrors());
    }
};

//pt logare basic
// export const login = (data) => async (dispatch) => {
//     dispatch(userSlice.actions.loginRequest());
//     try {
//         const response = await axios.post(
//             "http://localhost:5000/api/v1/user/login",
//             data,
//             {
//                 withCredentials: true,
//                 headers: { "Content-Type": "application/json" },
//             }
//         );
//         dispatch(userSlice.actions.loginSuccess(response.data));
//         toast.success(response.data.message);
//         dispatch(userSlice.actions.clearAllErrors());
//     } catch (error) {
//         dispatch(userSlice.actions.loginFailed());
//         toast.error(error.response.data.message);
//         dispatch(userSlice.actions.clearAllErrors());
//     }
// };

export const login = (data) => async (dispatch) => {
    dispatch(userSlice.actions.loginRequest());
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/user/login",
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      
      // Salvează token-ul în localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      
      dispatch(userSlice.actions.loginSuccess(response.data));
      toast.success(response.data.message);
      dispatch(userSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(userSlice.actions.loginFailed());
      toast.error(error.response.data.message);
      dispatch(userSlice.actions.clearAllErrors());
    }
  };

//pt logout basic
// export const logout = () => async (dispatch) => {   
//     try {
//         const response = await axios.get("http://localhost:5000/api/v1/user/logout", { withCredentials: true });
//         dispatch(userSlice.actions.logoutSuccess());
//         toast.success(response.data.message);
//         dispatch(userSlice.actions.clearAllErrors());
//     } catch (error) {
//         dispatch(userSlice.actions.logoutFailed());
//         toast.error(error.response.data.message);
//         dispatch(userSlice.actions.clearAllErrors());       
//     }
// };

export const logout = () => async (dispatch) => {   
    try {
      const response = await axios.get("http://localhost:5000/api/v1/user/logout", { withCredentials: true });
      
      // Elimină token-ul din localStorage
      localStorage.removeItem("token");
      
      dispatch(userSlice.actions.logoutSuccess());
      toast.success(response.data.message);
      dispatch(userSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(userSlice.actions.logoutFailed());
      toast.error(error.response.data.message);
      dispatch(userSlice.actions.clearAllErrors());       
    }
  };

//pt a lua userul logat basic
// export const fetchUser = () => async (dispatch) => {
//     dispatch(userSlice.actions.fetchUserRequest());
//     try {
//         const response = await axios.get("http://localhost:5000/api/v1/user/me", { withCredentials: true });
//         dispatch(userSlice.actions.fetchUserSuccess(response.data.user));
//         dispatch(userSlice.actions.clearAllErrors());
//     } catch (error) {
//         dispatch(userSlice.actions.fetchUserFailed());
//         dispatch(userSlice.actions.clearAllErrors());       
//         console.log(error);
//     }
// };

export const fetchUser = () => async (dispatch) => {
    dispatch(userSlice.actions.fetchUserRequest());
    
    // Obține token-ul din localStorage
    const token = localStorage.getItem("token");
    
    try {
      // Adaugă token-ul în header-ul cererii
      const response = await axios.get("http://localhost:5000/api/v1/user/me", { 
        withCredentials: true,
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      
      dispatch(userSlice.actions.fetchUserSuccess(response.data.user));
      dispatch(userSlice.actions.clearAllErrors());
    } catch (error) {
      // Dacă token-ul este invalid sau expirat, șterge-l
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem("token");
      }
      
      dispatch(userSlice.actions.fetchUserFailed());
      dispatch(userSlice.actions.clearAllErrors());
      console.log(error);
    }
  };

export const fetchLeaderboard = () => async (dispatch) => {
    dispatch(userSlice.actions.fetchLeaderboardRequest());
    try {
        const response = await axios.get("http://localhost:5000/api/v1/user/leaderboard", { withCredentials: true });
        dispatch(userSlice.actions.fetchLeaderboardSuccess(response.data.leaderboard));
        dispatch(userSlice.actions.clearAllErrors());
    } catch (error) {
        dispatch(userSlice.actions.fetchLeaderboardFailed());
        dispatch(userSlice.actions.clearAllErrors());       
        console.log(error);
    }
};

export default userSlice.reducer;