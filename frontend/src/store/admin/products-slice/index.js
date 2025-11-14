import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL;

const initialState = {
  productsList: [],
  isLoading: false,
};

export const addNewProduct = createAsyncThunk(
  "products/addNewProduct",
  async (formData) => {
    const response = await axios.post(`${baseUrl}/admin/products`, formData, {
      withCredentials: true,
    });

    return response.data;
  }
);

export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async () => {
    const response = await axios.get(`${baseUrl}/admin/products`, {
      withCredentials: true,
    });
    console.log(response.data);
    return response.data;
  }
);

export const editProduct = createAsyncThunk(
  "products/editProduct",
  async ({ id, formData }) => {
    const response = await axios.put(
      `${baseUrl}/admin/products/${id}`,
      formData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id) => {
    const response = await axios.delete(`${baseUrl}/admin/products/${id}`, {
      withCredentials: true,
    });

    return response.data;
  }
);

const adminProductsSlice = createSlice({
  name: "adminProduct",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Products Handler
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productsList = action.payload.data?.products || [];
        console.log("All products");
        console.log(action.payload.data?.products);
      })
      .addCase(fetchAllProducts.rejected, (state) => {
        state.isLoading = false;
        state.productsList = [];
      });
  },
});

export default adminProductsSlice.reducer;
