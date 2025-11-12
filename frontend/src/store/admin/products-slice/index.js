import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const uploadProductImage = createAsyncThunk(
  "adminProducts/uploadImage",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("my_file", file);

      const { data } = await axios.post(
        `${BASE_URL}/admin/upload-image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      return data.result; // { url, public_id }
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Image upload failed" }
      );
    }
  }
);

/**
 * Create new product
 */
export const addNewProduct = createAsyncThunk(
  "adminProducts/addNewProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}/admin/products`,
        productData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      return data.data; // the created product
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to add product" }
      );
    }
  }
);

/**
 * Fetch all products (with optional filters)
 */
export const fetchAllProducts = createAsyncThunk(
  "adminProducts/fetchAllProducts",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(filters).toString();
      const { data } = await axios.get(
        `${BASE_URL}/admin/products${query ? `?${query}` : ""}`,
        { withCredentials: true }
      );
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to fetch products" }
      );
    }
  }
);

/**
 * Update existing product
 */
export const updateProduct = createAsyncThunk(
  "adminProducts/updateProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}/admin/products/${id}`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to update product" }
      );
    }
  }
);

/**
 * Delete product
 */
export const deleteProduct = createAsyncThunk(
  "adminProducts/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`${BASE_URL}/admin/products/${id}`, {
        withCredentials: true,
      });
      return { id, message: data.message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to delete product" }
      );
    }
  }
);

/* ------------------------------------------------------------------ */
/*  INITIAL STATE                                                     */
/* ------------------------------------------------------------------ */

const initialState = {
  productList: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  error: null,
  successMessage: null,
};


const adminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    /* ---------- UPLOAD IMAGE ---------- */
    builder
      .addCase(uploadProductImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadProductImage.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(uploadProductImage.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message || "Image upload failed";
      });

    /* ---------- ADD PRODUCT ---------- */
    builder
      .addCase(addNewProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addNewProduct.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.productList.unshift(payload); // add to top
        state.successMessage = "Product added successfully!";
      })
      .addCase(addNewProduct.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message || "Failed to add product";
      });

    /* ---------- FETCH ALL ---------- */
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.productList = payload.data;
        state.pagination = payload.pagination;
      })
      .addCase(fetchAllProducts.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.productList = [];
        state.error = payload?.message || "Failed to load products";
      });

    /* ---------- UPDATE PRODUCT ---------- */
    builder
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateProduct.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        const index = state.productList.findIndex((p) => p._id === payload._id);
        if (index !== -1) state.productList[index] = payload;
        state.successMessage = "Product updated!";
      })
      .addCase(updateProduct.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message || "Update failed";
      });

    /* ---------- DELETE PRODUCT ---------- */
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.productList = state.productList.filter(
          (p) => p._id !== payload.id
        );
        state.successMessage = payload.message || "Product deleted";
      })
      .addCase(deleteProduct.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message || "Delete failed";
      });
  },
});

export const { clearMessages } = adminProductsSlice.actions;

export default adminProductsSlice.reducer;

// Selectors
export const selectAdminProducts = (state) => ({
  productList: state.adminProducts.productList,
  pagination: state.adminProducts.pagination,
  isLoading: state.adminProducts.isLoading,
  error: state.adminProducts.error,
  successMessage: state.adminProducts.successMessage,
});
