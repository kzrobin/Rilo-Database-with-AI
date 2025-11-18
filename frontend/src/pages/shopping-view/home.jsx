import { Button } from "@/components/ui/button";
import bannerOne from "../../assets/banner-1.webp";
import bannerTwo from "../../assets/banner-2.webp";
import bannerThree from "../../assets/banner-3.webp";
import {
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  ShirtIcon,
  ShoppingBasket,
  UmbrellaIcon,
  WashingMachine,
  WatchIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFilterProducts,
  getProductDetail,
} from "../../store/shop/product-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, getCart } from "@/store/shop/cart-slice";
import { toast } from "react-toastify";
import ProductDetailsDialog from "@/components/shopping-view/product-details";

const categoriesWithIcon = [
  { id: "men", label: "Men", icon: ShirtIcon },
  { id: "women", label: "Women", icon: CloudLightning },
  { id: "kids", label: "Kids", icon: BabyIcon },
  { id: "accessories", label: "Accessories", icon: WatchIcon },
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productsList, productDetails } = useSelector(
    (state) => state.shopProducts
  );

  const handleGetProductDetails = (id) => {
    dispatch(getProductDetail(id));
  };

  const featureImageList = [bannerOne, bannerTwo, bannerThree];
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redirect to listing page with filter
  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleAddToCart(productId) {
    dispatch(
      addToCart({
        productId,
        quantity: 1,
      })
    ).then((data) => {
      console.log(data);
      if (data?.payload) {
        dispatch(getCart());
        toast.success("Product added to cart");
        console.log("done");
      }
    });
  }

  // Open dialog when product detail loads
  useEffect(() => {
    if (productDetails) setOpenDetailsDialog(true);
  }, [productDetails]);

  // Auto slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featureImageList.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Fetch products on page load
  useEffect(() => {
    dispatch(fetchFilterProducts());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SLIDER */}
      <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[600px] overflow-hidden">
        {featureImageList.map((slide, index) => (
          <img
            key={index}
            src={slide}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Prev Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prev) =>
                (prev - 1 + featureImageList.length) % featureImageList.length
            )
          }
          className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>

        {/* Next Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % featureImageList.length)
          }
          className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* CATEGORY SECTION */}
      {/* CATEGORY SECTION */}
      <section className="py-10 bg-gray-50 w-full">
        <div className="container w-full mx-auto px-3 sm:px-4 ">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
            Shop by category
          </h2>

          <div
            className=" w-full
        grid 
        grid-cols-2 
        sm:grid-cols-3 
        md:grid-cols-4 
        lg:grid-cols-4 
        gap-4 sm:gap-6 
      "
          >
            {categoriesWithIcon.map((category) => (
              <Card
                key={category.id}
                onClick={() =>
                  handleNavigateToListingPage(category, "category")
                }
                className="cursor-pointer hover:shadow-xl transition-all"
              >
                <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6">
                  <category.icon className="w-10 h-10 sm:w-12 sm:h-12 mb-3 text-primary" />
                  <span className="font-semibold text-sm sm:text-base">
                    {category.label}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE PRODUCTS */}
      <section className="py-10">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
            Feature Products
          </h2>

          <div
            className="
    w-full
    grid
    grid-cols-2 
    sm:grid-cols-3 
    md:grid-cols-4 
    lg:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]
    justify-center
    justify-items-center
    gap-4 sm:gap-6
  "
          >
            {productsList?.length > 0 &&
              productsList.map((product) => (
                <ShoppingProductTile
                  key={product.id}
                  product={product}
                  handleAddToCart={handleAddToCart}
                  handleGetProductDetails={handleGetProductDetails}
                />
              ))}
          </div>
        </div>
      </section>

      {/* PRODUCT DETAILS DIALOG */}
      <ProductDetailsDialog
        open={openDetailsDialog}
        onOpenChange={setOpenDetailsDialog}
        product={productDetails}
        handleAddToCart={handleAddToCart}
      />
    </div>
  );
}

export default ShoppingHome;
