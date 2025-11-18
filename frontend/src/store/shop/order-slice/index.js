import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Base URL
const baseUrl = import.meta.env.VITE_BASE_URL;

const initialState = {
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
  error: null,
};

export const placeOrder = createAsyncThunk(
  "order/placeOrder",
  async (addressId, { rejectWithValue, getState }) => {
    try {
      console.log(addressId);
      const response = await axios.post(
        `${baseUrl}/shop/orders`,
        { addressId },
        {
          withCredentials: true, // ✅ credentials included
        }
      );
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getOrders = createAsyncThunk(
  "order/getOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/shop/orders`, {
        withCredentials: true, // ✅ include cookies/session
      });
      return response.data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getOrderById = createAsyncThunk(
  "order/getOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/shop/orders/${orderId}`, {
        withCredentials: true, // ✅ include cookies/session
      });
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearOrderDetails: (state) => {
      state.orderDetails = null;
      state.orderId = null;
    },
    clearOrderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderId = action.payload._id;
        state.orderDetails = action.payload;
        state.orderList.unshift(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Orders
      .addCase(getOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Order by ID
      .addCase(getOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderDetails, clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
