import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { build } from "vite";
const baseUrl = import.meta.env.VITE_BASE_URL;

const initialState = {
  isAuthenticated: false,
  isLoding: null,
  user: null,
};

export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData) => {
    const response = await axios.post(`${baseUrl}/users/register`, formData, {
      withCredentials: true,
    });
    return response.data;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {},
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending, (state) => {
      state.isLoding = true;
    });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
