import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: true,
        error: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
         clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      state.initialized = false;
      state.loading = false;
    },
    setInitialized: (state) => {
      state.initialized = true;
      state.loading = false;
    },
    }
})

export const { setUser, setLoading, setError, clearError, logout, setInitialized } = authSlice.actions
export default authSlice.reducer