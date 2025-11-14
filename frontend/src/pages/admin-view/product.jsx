import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import React, { Fragment, useEffect, useState } from "react";
import { addProductFormElements } from "@/config";
import ProductImageUpload from "@/components/admin-view/image-upload";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts, addNewProduct } from "@/store/admin/products-slice";
import { toast } from "react-toastify";

import AdminProductTile from "@/components/admin-view/product-tile";

const initialFormData = {
  image: "",
  title: "",
  description: "",
  category: "",
  price: 0,
  salePrice: 0,
  totalStock: 0,
};

const AdminProducts = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const { productsList } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();

  // Fetch products on first load
  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const onSubmit = (event) => {
    event.preventDefault();

    const preparedData = {
      ...formData,
      image: { url: uploadedImageUrl },
      price: Number(formData.price) || 0,
      salePrice: Number(formData.salePrice) || 0,
      totalStock: Number(formData.totalStock) || 0,
    };

    dispatch(addNewProduct(preparedData)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Product added successfully");

        // Reset everything
        setImageFile(null);
        setUploadedImageUrl("");
        setFormData(initialFormData);

        // Refresh list
        dispatch(fetchAllProducts());

        setOpenCreateProductsDialog(false);
      } else {
        toast.error("Failed to add product");
      }
    });
  };

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Add new product
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
        {productsList && productsList.length > 0 ? (
          productsList.map((product) => (
            <AdminProductTile
              setCurrentEditedId={setCurrentEditedId}
              setOpenCreateProductsDialog={setOpenCreateProductsDialog}
              key={product._id}
              product={product}
              setFormData={setFormData}
            />
          ))
        ) : (
          <div>No products found</div>
        )}
      </div>

      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={(open) => {
          setOpenCreateProductsDialog(open);
          setCurrentEditedId(null);
          setFormData(initialFormData);
          setImageFile(null);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>Add new Product</SheetTitle>

            <ProductImageUpload
              imageFile={imageFile}
              setImageFile={setImageFile}
              uploadedImageUrl={uploadedImageUrl}
              setUploadedImageUrl={setUploadedImageUrl}
              imageLoadingState={imageLoadingState}
              setImageLoadingState={setImageLoadingState}
              currentEditedId={currentEditedId}
              isEdidtMode={currentEditedId !== null}
            />

            <div className="py-6">
              <CommonForm
                formData={formData}
                setFormData={setFormData}
                formControls={addProductFormElements}
                buttonText="Add"
                onSubmit={onSubmit}
                isBtnDisabled={imageLoadingState}
              />
            </div>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
};

export default AdminProducts;
