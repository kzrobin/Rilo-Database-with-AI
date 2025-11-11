import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function CheckAuth({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Default route
  if (location.pathname === "/") {
    if (!isAuthenticated) return <Navigate to="/auth/login" />;
    return user?.role === "admin" ? (
      <Navigate to="/admin/dashboard" />
    ) : (
      <Navigate to="/shop/listing" />
    );
  }

  // Block unauthenticated access
  if (
    !isAuthenticated &&
    !(
      location.pathname.startsWith("/auth/login") ||
      location.pathname.startsWith("/auth/register")
    )
  ) {
    return <Navigate to="/auth/login" />;
  }

  // Block logged-in users from visiting login/register
  if (
    isAuthenticated &&
    (location.pathname.startsWith("/auth/login") ||
      location.pathname.startsWith("/auth/register"))
  ) {
    return user?.role === "admin" ? (
      <Navigate to="/admin/dashboard" />
    ) : (
      <Navigate to="/shop/listing" />
    );
  }

  // Restrict normal users from admin pages
  if (
    isAuthenticated &&
    user?.role !== "admin" &&
    location.pathname.includes("/admin")
  ) {
    return <Navigate to="/unauth-page" />;
  }

  // Restrict admins from shop pages
  if (
    isAuthenticated &&
    user?.role === "admin" &&
    location.pathname.includes("/shop")
  ) {
    return <Navigate to="/admin/dashboard" />;
  }

  return <>{children}</>;
}

export default CheckAuth;
