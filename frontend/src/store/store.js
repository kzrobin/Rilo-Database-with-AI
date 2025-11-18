import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import adminProductsReducer from "./admin/products-slice";
import shopProductsReducer from "./shop/product-slice";
import cartProductReducer from "./shop/cart-slice";
import shopAddressReducer from "./shop/address-slice";
import shopOrderReducer from "./shop/order-slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminProducts: adminProductsReducer,
    shopProducts: shopProductsReducer,
    cartProduct: cartProductReducer,
    shopAddress: shopAddressReducer,
    shopOrder: shopOrderReducer,
  },
});

export default store;
