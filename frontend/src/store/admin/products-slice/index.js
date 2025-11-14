import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL;

const initialState = {
  productsList: [],
  isLoading: false,
};


// Add New Product
export const addNewProduct = createAsyncThunk(
  "products/addNewProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseUrl}/admin/products`, formData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch All Products
export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/admin/products`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Edit Product
export const editProduct = createAsyncThunk(
  "products/editProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${baseUrl}/admin/products/${id}`,
        formData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete Product
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async ({ id, rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseUrl}/admin/products/${id}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


const adminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All Products
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // console.log(action.payload?.data?.products);
        const list = action.payload?.data?.products;
        // console.log(list)

        state.productsList = Array.isArray(list) ? list : [];
      })
      .addCase(fetchAllProducts.rejected, (state) => {
        state.isLoading = false;
        state.productsList = [];
      })

      // Add Product
      .addCase(addNewProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addNewProduct.fulfilled, (state, action) => {
        state.isLoading = false;

        const newProduct =
          action.payload?.data?.product || action.payload?.product;

        if (newProduct) {
          state.productsList.push(newProduct);
        }
      })
      .addCase(addNewProduct.rejected, (state) => {
        state.isLoading = false;
      })

      // Edit Product
      .addCase(editProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.isLoading = false;

        const updatedProduct =
          action.payload?.data?.product || action.payload?.product;

        if (updatedProduct) {
          state.productsList = state.productsList.map((p) =>
            p._id === updatedProduct._id ? updatedProduct : p
          );
        }
      })
      .addCase(editProduct.rejected, (state) => {
        state.isLoading = false;
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;

        const deletedId = action.payload?.data?.id || action.payload?.id;

        if (deletedId) {
          state.productsList = state.productsList.filter(
            (p) => p._id !== deletedId
          );
        }
      })
      .addCase(deleteProduct.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default adminProductsSlice.reducer;
