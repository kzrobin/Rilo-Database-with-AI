import React, { useEffect, useState } from "react";
import ProductFilter from "../../components/shopping-view/filter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import { ArrowDownUp } from "lucide-react";
import { sortOptions } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFilterProducts,
  getProductDetail,
} from "@/store/shop/product-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { addToCart, getCart } from "@/store/shop/cart-slice";
import { toast } from "react-toastify";

const ShoppingListing = () => {
  const [sorted, setSorted] = useState("price-lowtohigh");
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { productsList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const dispatch = useDispatch();

  

  const handleGetProductDetails = (id) => {
    dispatch(getProductDetail(id));
  };

  const handleAddToCart = (id, quantity = 1) => {
    dispatch(addToCart({ productId: id, quantity })).then((data) => {
      dispatch(getCart());
      toast.success("Added to Cart");
    });
  };

  useEffect(() => {
    dispatch(fetchFilterProducts());
  }, [dispatch]);

  useEffect(() => {
    if (productDetails !== null) {
      setOpenDetailsDialog(true);
    }
  }, [productDetails]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 p-4 md:p-6">
      <ProductFilter />
      <div className="bg-background w-full rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-extrabold">All Products</h2>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground mr-2">
              {productsList.length} products
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowDownUp className="size-4" /> Sort by
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-[200px] bg-white shadow-2xl p-3 rounded-lg"
              >
                <DropdownMenuRadioGroup
                  value={sorted}
                  onValueChange={setSorted}
                >
                  {sortOptions.map((it) => (
                    <DropdownMenuRadioItem key={it.id} value={it.id}>
                      {it.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 px-2 py-2">
          {productsList.map((product) => (
            <div key={product._id}>
              <ShoppingProductTile
                product={product}
                handleGetProductDetails={handleGetProductDetails}
                handleAddToCart={handleAddToCart}
              />
            </div>
          ))}
        </div>
      </div>
      <ProductDetailsDialog
        open={openDetailsDialog}
        onOpenChange={setOpenDetailsDialog}
        product={productDetails}
        handleAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default ShoppingListing;
