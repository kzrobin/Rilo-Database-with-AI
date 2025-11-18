import { Link, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { CodeSquare, LogOut, Menu, Shirt, ShoppingCart } from "lucide-react";

import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";

import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import UserCartWrapper from "./cart-wrapper";
import { logout } from "../../store/auth-slice/index";
import { getCart } from "@/store/shop/cart-slice";
import { collapseToast } from "react-toastify";

useSelector;
// ------------------------------
// Mobile-only Cart Button
// ------------------------------
const UserCartWrapperMobile = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="icon"
        className="relative"
      >
        <ShoppingCart className="w-5 h-5" />
      </Button>
      <UserCartWrapper />
    </Sheet>
  );
};

const HeaderRight = ({ user }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const cartItems = useSelector((state) => state.cartProduct?.cartItems || []);
  useEffect(() => {
    dispatch(getCart());
    console.log(cartItems);
  }, [dispatch]);

  // Get cartItems safely from redux

  const img = user?.profilePicture;
  const initials =
    `${user?.fullname?.firstname?.[0]?.toUpperCase() || ""}${
      user?.fullname?.lastname?.[0]?.toUpperCase() || ""
    }` || "U";

  return (
    <div className="flex items-center gap-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <ShoppingCart />
          </Button>
        </SheetTrigger>

        <UserCartWrapper cartItems={cartItems} />
      </Sheet>

      {/* Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="w-9 h-9 cursor-pointer">
            <AvatarImage src={img} alt="User" className="rounded-full" />
            <AvatarFallback className="bg-black text-white rounded-full flex items-center justify-center font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56 mr-2" align="start">
          <DropdownMenuLabel>
            {user?.fullname?.firstname} {user?.fullname?.lastname}
          </DropdownMenuLabel>

          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link to="/shop/account">My Account</Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => dispatch(logout())}>
              Logout
              <LogOut className="ml-auto w-4 h-4" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// ------------------------------
// Navbar Items
// ------------------------------
const MenuItems = ({ isMobile = false }) => {
  const location = useLocation();

  return (
    <nav
      className={
        isMobile ? "flex flex-col gap-4 mt-6" : "flex gap-8 items-center"
      }
    >
      {shoppingViewHeaderMenuItems.map((menu) => {
        const active = location.pathname === menu.path;
        return (
          <Link
            key={menu.id}
            to={menu.path}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              active ? "text-primary font-semibold" : "text-muted-foreground"
            }`}
          >
            {menu.label}
          </Link>
        );
      })}
    </nav>
  );
};

// ------------------------------
// MAIN HEADER
// ------------------------------
const ShoppingHeader = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const initials =
    `${user?.fullname?.firstname?.[0]?.toUpperCase() || ""}${
      user?.fullname?.lastname?.[0]?.toUpperCase() || ""
    }` || "U";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/shop/home" className="flex items-center gap-2">
          <Shirt className="h-6 w-6" />
          <span className="font-bold text-lg">Railo Cloth</span>
        </Link>

        {/* MOBILE Left: Menu + Cart */}
        <div className="flex lg:hidden items-center gap-3">
          {/* Cart Icon (mobile) */}
          <UserCartWrapperMobile />

          {/* Menu trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-full max-w-xs p-6">
              {/* Mobile Profile */}
              {isAuthenticated && user && (
                <Link
                  to="/shop/account"
                  className="flex items-center gap-3 mb-6"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={user.profilePicture}
                      className="rounded-full"
                    />
                    <AvatarFallback className="bg-primary text-white font-semibold rounded-full flex items-center justify-center">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {user.fullname.firstname} {user.fullname.lastname}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      View Profile
                    </p>
                  </div>
                </Link>
              )}

              <MenuItems isMobile />

              {isAuthenticated && (
                <button
                  onClick={() => dispatch(logout())}
                  className="text-red-600 font-medium mt-4 text-left"
                >
                  Logout
                </button>
              )}
            </SheetContent>
          </Sheet>
        </div>

        {/* DESKTOP Menu */}
        <div className="hidden lg:flex">
          <MenuItems />
        </div>

        {/* DESKTOP Right side */}
        <div className="hidden lg:block">
          {isAuthenticated && <HeaderRight user={user} />}
        </div>
      </div>
    </header>
  );
};

export default ShoppingHeader;
