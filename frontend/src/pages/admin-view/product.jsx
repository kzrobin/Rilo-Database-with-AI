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
import {
  fetchAllProducts,
  addNewProduct,
  deleteProduct,
  editProduct,
} from "@/store/admin/products-slice";
import { toast } from "react-toastify";
import { CodeSquare } from "lucide-react";

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
  const { productsList } = useSelector((state) => state.adminProducts);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllProducts());
    console.log("Check product list");
    console.log(productsList);
  }, []);

  const onSubmit = (event) => {
    event.preventDefault();

    const preparedData = {
      ...formData,
      image: { url: uploadedImageUrl },
      price: parseFloat(formData.price) || 0,
      salePrice: parseFloat(formData.salePrice) || 0,
      totalStock: parseInt(formData.totalStock) || 0,
    };

    dispatch(
      addNewProduct({ ...preparedData, image: { url: uploadedImageUrl } })
    ).then((data) => {
      console.log(data);
      setImageFile(null);
      setFormData({
        image: "",
        title: "",
        description: "",
        category: "",
        price: 0,
        salePrice: 0,
        totalStock: 0,
      });
      dispatch(fetchAllProducts());
      console.log(productsList);
      setOpenCreateProductsDialog(false);
      toast.success("Product added Successfully");
    });
  };

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Add new product
        </Button>
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => setOpenCreateProductsDialog(false)}
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
            ></ProductImageUpload>
            <div className="py-6">
              <CommonForm
                formData={formData}
                setFormData={setFormData}
                formControls={addProductFormElements}
                buttonText={"Add"}
                onSubmit={onSubmit}
              />
            </div>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
};

export default AdminProducts;
