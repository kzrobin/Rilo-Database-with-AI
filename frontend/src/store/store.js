import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import adminProductsReducer from "./admin/products-slice";
import shopProductsReducer from "./shop/product-slice";
import cartProductReducer from "./shop/cart-slice";
import shopAddressReducer from "./shop/address-slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminProducts: adminProductsReducer,
    shopProducts: shopProductsReducer,
    cartProduct: cartProductReducer,
    shopAddress: shopAddressReducer,
  },
});

export default store;
