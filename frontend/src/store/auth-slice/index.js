import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL;

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
};

export const checkAuth = createAsyncThunk("/check-auth", async () => {
  try {
    const response = await axios.post(`${baseUrl}/users/check-auth`, {
      withCredentials: true,
    });
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseUrl}/users/register`, formData, {
        withCredentials: true,
      });
      return response.data; // expect { user: {...}, token: ... } or similar
    } catch (error) {
      // Pass backend error to rejected case
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseUrl}/users/login`, formData, {
        withCredentials: true,
      });
      return response.data; // expect { user: {...}, token: ... } or similar
    } catch (error) {
      // Pass backend error to rejected case
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || null; // depends on API
        console.log(action.payload); // checking console
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || null; // depends on API
        console.log(action.payload); // checking console
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || null; // depends on API
        console.log(action.payload); // checking console
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
