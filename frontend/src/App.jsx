import { Route, Router, Routes } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import AdminLayout from "./components/admin-view/layout";
import AdminDashbroad from "./pages/admin-view/dashbroad";
import AdminOrder from "./pages/admin-view/order";
import AdminProduct from "./pages/admin-view/product";
import NotFound from "./pages/NotFound";
import ShoppingLayout from "./components/shopping-view/layout";
import ShoppingListing from "./pages/shopping-view/listing";
import ShoppingAccount from "./pages/shopping-view/account";
import ShoppingCheckout from "./pages/shopping-view/checkout";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import store from "./store/store";
import { checkAuth } from "./store/auth-slice";
import { useEffect } from "react";
import ShoppingHome from "./pages/shopping-view/home";

// import { ChatWidget } from './components/admin-view/Chatbot/ChatWidget';

function App() {
  const { isAuthenticated, user, isLoading } = useSelector(
    (state) => state.auth
  );

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col overflow-hidden bg-white ">
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route
          path="auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
        </Route>
        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashbroad />} />
          <Route path="products" element={<AdminProduct />} />
          <Route path="order" element={<AdminOrder />} />
        </Route>

        <Route
          path="shop"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ShoppingLayout />
            </CheckAuth>
          }
        >
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="account" element={<ShoppingAccount />} />
          <Route path="checkout" element={<ShoppingCheckout />} />
        </Route>
        <Route path="unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </div>
  );
}

export default App;
