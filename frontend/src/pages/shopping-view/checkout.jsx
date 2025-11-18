import { useDispatch, useSelector } from "react-redux";
import UserCartWrapper from "../../components/shopping-view/cart-wrapper";
import { useEffect, useState } from "react";
import { getCart } from "@/store/shop/cart-slice";
import { placeOrder } from "@/store/shop/order-slice";
import { toast } from "react-toastify";
import Address from "@/components/shopping-view/address";
import UserCartItemsContent from "@/components/shopping-view/card-items-content";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function ShoppingCheckout() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);
  const cartItems = useSelector((state) => state.cartProduct?.cartItems || []);
  console.log(cartItems);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, item) =>
            sum +
            (item.salePrice > 0 ? item.salePrice : item.price) * item.quantity,
          0
        )
      : 0;

  // Place order
  const handlePlaceOrder = () => {
    console.log(currentSelectedAddress._id);

    if (!currentSelectedAddress) {
      toast({
        title: "Please select an address to continue.",
        variant: "destructive",
      });
      return;
    }
    console.log(currentSelectedAddress._id);
    dispatch(placeOrder(currentSelectedAddress._id)).then((data) => {
      console.log(data);
      if (data?.playload) {
        toast({
          title: "Order placed successfully!",
        });
        dispatch(getCart());
      } else {
        toast({
          title: "Failed to place order.",
          variant: "destructive",
        });
      }
    });

    dispatch(getCart());
    const navitage = useNavigate();
    navitage("/shop/account");
    console.log("Added");
  };

  return (
    <div className="flex flex-col">
      {/* Checkout Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        {/* Address Selection */}
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />

        <div className="mt-8 space-y-4 w-full">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <UserCartItemsContent key={item.productId} cartItem={item} />
            ))
          ) : (
            <p>Add product to cart</p>
          )}
          <Button
            className="w-full"
            onClick={handlePlaceOrder}
            disabled={!currentSelectedAddress}
          >
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
