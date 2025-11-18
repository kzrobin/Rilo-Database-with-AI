import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  cartItems: [],
};

const baseUrl = import.meta.env.VITE_BASE_URL;

// get cart
export const getCart = createAsyncThunk(
  "cart/getCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/shop/cart`, {
        withCredentials: true,
      });

      return response.data.data.cart; // array
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// add to card
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${baseUrl}/shop/cart/`,
        { productId, quantity },
        {
          withCredentials: true,
        }
      );

      return response.data.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async ({ productId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseUrl}/shop/cart/${productId}`, {
        withCredentials: true,
      });

      return response.data.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // get cart
      .addCase(getCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log("Get cart")
        // console.log(action.payload);
        state.cartItems = action.payload || [];
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false;
        toast.error("Failed to fetch cart.");
      })

      // add or update item
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        toast.error(action.payload?.message || "Failed to update cart");
      })

      //  remove item
      .addCase(removeCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload;
        toast.success("Item removed");
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.isLoading = false;
        toast.error(action.payload?.message || "Failed to remove item");
      });
  },
});

export default shoppingCartSlice.reducer;
