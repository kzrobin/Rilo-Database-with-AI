import React from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const ShoppingProductTile = ({
  product,
  handleGetProductDetails,
  handleAddToCart,
}) => {
  const isOutOfStock = product?.totalStock === 0;

  return (
    <Card
      className="w-full mx-auto max-w-sm cursor-pointer"
      onClick={() => handleGetProductDetails?.(product?._id)}
    >
      <div>
        {/* Product Image */}
        <div className="relative">
          <img
            src={product?.image?.url}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-2xl"
          />

          {product?.salePrice > 0 && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Sale
            </Badge>
          )}
        </div>

        {/* Product Content */}
        <CardContent className="p-4">
          <h2 className="font-bold text-lg">{product?.title}</h2>

          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              {product?.category}
            </span>
          </div>

          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through" : ""
              } text-lg font-semibold text-primary`}
            >
              ৳{product?.price}
            </span>

            {product?.salePrice > 0 && (
              <span className="text-lg font-semibold text-primary">
                ৳{product?.salePrice}
              </span>
            )}
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="w-full">
          <Button
            className="w-full"
            disabled={isOutOfStock}
            variant={isOutOfStock ? "secondary" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) handleAddToCart(product?._id);
            }}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default ShoppingProductTile;
