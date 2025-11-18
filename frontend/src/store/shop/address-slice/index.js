import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const baseUrl = import.meta.env.VITE_BASE_URL;

const initialState = {
  isLoading: false,
  addressList: [],
  error: null,
};

// ========== ASYNC THUNKS ==========

// Add new address
export const addNewAddress = createAsyncThunk(
  "address/addNewAddress",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${baseUrl}/shop/address`, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // send cookies
      });
      toast.success("Address added successfully");
      return data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add address");
      return rejectWithValue(error?.response?.data);
    }
  }
);

// Get all addresses for user
export const getAddresses = createAsyncThunk(
  "address/getAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseUrl}/shop/address`, {
        withCredentials: true,
      });
      return data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch addresses"
      );
      return rejectWithValue(error?.response?.data);
    }
  }
);

// Update an address
export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${baseUrl}/shop/address/${id}`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      toast.success("Address updated successfully");
      return data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update address");
      return rejectWithValue(error?.response?.data);
    }
  }
);

// Delete an address
export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`${baseUrl}/shop/address/${id}`, {
        withCredentials: true,
      });
      toast.success("Address deleted successfully");
      return id; // return id to remove from state
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete address");
      return rejectWithValue(error?.response?.data);
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add new address
      .addCase(addNewAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addNewAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addressList = action.payload;
      })
      .addCase(addNewAddress.rejected, (state) => {
        state.isLoading = false;
      })

      // Get addresses
      .addCase(getAddresses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addressList = action.payload.data;
      })
      .addCase(getAddresses.rejected, (state) => {
        state.isLoading = false;
      })

      // Update address
      .addCase(updateAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addressList = action.payload.data;
      })
      .addCase(updateAddress.rejected, (state) => {
        state.isLoading = false;
      })

      // Delete address
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addressList = action.payload.data;
      })
      .addCase(deleteAddress.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default addressSlice.reducer;
