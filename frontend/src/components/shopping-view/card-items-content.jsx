import React from "react";
import { Button } from "../ui/button";
import { Trash, Minus, Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart, getCart, removeCartItem } from "@/store/shop/cart-slice";

const UserCartItemsContent = ({ cartItem }) => {
  const dispatch = useDispatch();

  const stock = cartItem.totalStock || cartItem.toalStock || 0;
  const quantity = cartItem.quantity;

  const handleIncrease = () => {
    if (quantity >= stock) return;
    const newQty = quantity + 1;

    dispatch(
      addToCart({ productId: cartItem.productId, quantity: newQty })
    ).then(() => {
      dispatch(getCart());
    });
  };

  const handleDecrease = () => {
    if (quantity <= 1) return;
    const newQty = quantity - 1;

    dispatch(
      addToCart({ productId: cartItem.productId, quantity: newQty })
    ).then(() => {
      dispatch(getCart());
    });
  };

  const handleDelete = () => {
    dispatch(removeCartItem({ productId: cartItem.productId })).then(() => {
      dispatch(getCart());
    });
  };

  const finalPrice =
    (cartItem.salePrice > 0 ? cartItem.salePrice : cartItem.price) *
    cartItem.quantity;

  return (
    <div className="flex items-center space-x-4 px-2 py-2 rounded-lg bg-white shadow-sm">
      <img
        src={cartItem?.image?.url}
        alt={cartItem?.title}
        className="w-20 h-20 rounded object-cover"
      />

      <div className="flex-1">
        <h3 className="font-bold">{cartItem?.title}</h3>

        {/* Quantity Buttons */}
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={quantity <= 1}
            onClick={handleDecrease}
          >
            <Minus className="w-4 h-4" />
          </Button>

          <span className="font-semibold">{quantity}</span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={quantity >= stock}
            onClick={handleIncrease}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Price + Delete */}
      <div className="flex flex-col items-end">
        <p className="font-semibold">${finalPrice.toFixed(2)}</p>

        <Trash
          size={20}
          className="cursor-pointer mt-1 text-red-500"
          onClick={handleDelete}
        />
      </div>
    </div>
  );
};

export default UserCartItemsContent;
