import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL;

const initialState = {
  isLoading: false,
  productsList: [],
  productDetails: null,
};

// Fetch Filter Products
export const fetchFilterProducts = createAsyncThunk(
  "products/fetchFilterProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/shop/products`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get Product Detail
export const getProductDetail = createAsyncThunk(
  "products/details",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/shop/products/${id}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const shopProductsSlice = createSlice({
  name: "shopProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Filter Products
      .addCase(fetchFilterProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFilterProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log("AddCase");
        const list = action.payload?.data?.products;
        state.productsList = Array.isArray(list) ? list : [];
      })
      .addCase(fetchFilterProducts.rejected, (state) => {
        state.isLoading = false;
        state.productsList = [];
      })

      // Product Details
      .addCase(getProductDetail.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProductDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        // console.log(action.payload.data);
        state.productDetails = action.payload?.data || null;
        console.log(state.productDetails);
      })
      .addCase(getProductDetail.rejected, (state) => {
        state.isLoading = false;
        state.productDetails = null;
      });
  },
});

export default shopProductsSlice.reducer;
