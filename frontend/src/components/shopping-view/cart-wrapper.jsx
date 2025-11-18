import React, { useEffect } from "react";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";
import UserCartItemsContent from "./card-items-content";
import { useDispatch, useSelector } from "react-redux";
import { getCart } from "@/store/shop/cart-slice";
import { useNavigate } from "react-router-dom";

const UserCartWrapper = ({ setOpen }) => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  // Safe selector (prevents undefined errors)
  const cartItems = useSelector((state) => state.cartProduct?.cartItems || []);

  // Correct total calculation
  const totalAmount =
    cartItems.length > 0
      ? cartItems.reduce((sum, item) => {
          const price = item.salePrice > 0 ? item.salePrice : item.price;
          return sum + price * item.quantity;
        }, 0)
      : 0;

  return (
    <SheetContent className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Your Cart</SheetTitle>
      </SheetHeader>

      {/* Cart Items */}
      <div className="mt-8 space-y-4 w-full">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <UserCartItemsContent key={item.productId} cartItem={item} />
          ))
        ) : (
          <p>Add product to cart</p>
        )}
      </div>

      <div className="mt-8 flex justify-between font-bold w-full text-lg px-6">
        <span>Total </span>
        <span> ৳{totalAmount}</span>
      </div>

      <Button
        className="w-full mt-6"
        onClick={() => {
          navigate("/shop/checkout");
          setOpen(false);
        }}
      >
        Check out
      </Button>
    </SheetContent>
  );
};

export default UserCartWrapper;
