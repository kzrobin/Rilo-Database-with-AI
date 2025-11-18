import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { StarIcon } from "lucide-react";
import { Input } from "../ui/input";

const ProductDetailsDialog = ({
  open,
  onOpenChange,
  product,
  handleAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
    setQuantity(1);
  }, [open]);

  if (!product) return null;

  const handleQtyChange = (type) => {
    if (type === "inc") {
      if (quantity < product.totalStock) setQuantity(quantity + 1);
    } else {
      if (quantity > 1) setQuantity(quantity - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:p-10 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw]">
        {/* ---------- Image Section ---------- */}
        <div className="relative overflow-hidden rounded-xl border bg-muted">
          <img
            src={product.image?.url}
            alt={product?.title}
            className="aspect-square object-cover w-full"
          />
        </div>

        {/* ---------- Content Section ---------- */}
        <div className="flex flex-col h-full">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-3xl font-semibold">
              {product?.title}
            </DialogTitle>
            <DialogDescription className="text-lg text-muted-foreground">
              {product?.description}
            </DialogDescription>
          </DialogHeader>

          {/* ---------- Price ---------- */}
          <div className="flex items-center gap-4 mb-4">
            <p
              className={`text-3xl font-bold ${
                product?.salePrice > 0
                  ? "line-through text-gray-400"
                  : "text-primary"
              }`}
            >
              ৳ {product?.price}
            </p>

            {product?.salePrice > 0 && (
              <p className="text-3xl font-bold text-primary">
                ৳ {product?.salePrice}
              </p>
            )}
          </div>

          {/* ---------- Stock ---------- */}
          <div className="mb-4">
            {product.totalStock > 0 ? (
              <Badge
                variant="secondary"
                className="text-green-600 border-green-600"
              >
                In Stock: {product.totalStock}
              </Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          {/* ---------- Quantity Selector ---------- */}
          <div className="flex items-center gap-4 mb-6">
            <p className="font-medium">Quantity:</p>

            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQtyChange("dec")}
                className="rounded-none"
              >
                -
              </Button>

              <div className="px-4 py-2 font-semibold text-lg">{quantity}</div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQtyChange("inc")}
                className="rounded-none"
              >
                +
              </Button>
            </div>
          </div>

          {/* review */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <StarIcon className="w-5 h-5 text-yellow-300 fill-amber-300" />
              <StarIcon className="w-5 h-5 text-yellow-400 fill-amber-400" />
              <StarIcon className="w-5 h-5 text-yellow-500 fill-amber-500" />
              <StarIcon className="w-5 h-5 text-yellow-600 fill-amber-600" />
              <StarIcon className="w-5 h-5 text-yellow-600 fill-amber-700" />
            </div>
            <span className="text-sm text-gray-600">(4.5)</span>
          </div>

          {/* ---------- Bottom Add-to-Cart ---------- */}
          <div className="mt-auto pt-4">
            <Button
              className="w-full h-12 text-lg"
              disabled={product.totalStock === 0}
              onClick={() => handleAddToCart(product?._id, quantity)}
            >
              Add to Cart
            </Button>
          </div>
          <div className="max-h-[300px] overflow-auto p-4 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Reviews</h2>

            <div className="space-y-4 mt-2">
              {/* Single Review */}
              <div className="flex gap-4 p-3 bg-gray-50 rounded-lg shadow-sm">
                <Avatar className="w-12 h-12 rounded-full border border-gray-200">
                  <AvatarFallback className=" bg-black text-white rounded-full backdrop-blur-sm font-semibold flex items-center justify-center w-full h-full ">
                    Kz
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">Kz Robin</h3>
                    <span className="text-sm text-gray-500">2 days ago</span>
                  </div>

                  <div className="flex items-center gap-1 mb-2">
                    <StarIcon className="w-5 h-5 text-yellow-300 fill-amber-300" />
                    <StarIcon className="w-5 h-5 text-yellow-400 fill-amber-400" />
                    <StarIcon className="w-5 h-5 text-yellow-500 fill-amber-500" />
                    <StarIcon className="w-5 h-5 text-yellow-600 fill-amber-600" />
                    <StarIcon className="w-5 h-5 text-yellow-600 fill-amber-700" />
                  </div>
                  <p className="text-gray-700">
                    This is an awesome product! Highly recommend to anyone
                    looking for quality and durability.
                  </p>
                </div>
              </div>

              {/* Repeat for more reviews */}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Input placeholder="write a review" />
            <Button>Submit </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
