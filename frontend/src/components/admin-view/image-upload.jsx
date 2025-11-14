import { Label } from "@radix-ui/react-label";
import React, { useEffect, useRef } from "react";
import { Input } from "../ui/input";
import { FileIcon, UploadCloud, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "react-toastify";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

const ProductImageUpload = ({
  imageFile,
  setImageFile,
  uploadedImageUrl,
  setUploadedImageUrl,
  imageLoadingState = false,
  setImageLoadingState,
}) => {
  const inputRef = useRef(null);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const handleImageFileChange = (event) => {
    console.log(event.target.files);

    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) setImageFile(selectedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };
  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) setImageFile(droppedFile);
  };

  const handleImageRemove = () => {
    setImageFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    const uploadImage = async () => {
      if (imageFile !== null) {
        try {
          setImageLoadingState(true);
          const data = new FormData();
          data.append("my_file", imageFile);
          const response = await axios.post(
            `${baseUrl}/admin/upload-image`,
            data
          );

          console.log(response);
          if (response?.data?.result?.url) {
            setUploadedImageUrl(response.data.result.url);
            setImageLoadingState(false);
          }
        } catch (error) {
          toast.error("Failed to upload image");
          setImageFile(null);
          setUploadedImageUrl("");
          setImageLoadingState(false);
          // console.log(error);
        }
      } else {
        setUploadedImageUrl("");
        setImageLoadingState(false);
      }
    };

    uploadImage();
  }, [imageFile]);

  return (
    <div className="w-full max-w-md max-w-auto mt-4">
      <Label className="text-lg font-semibold mb-2 block text-center">
        Upload Image
      </Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-lg p-4"
      >
        <Input
          type="file"
          id="image-upload"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
        />

        {!imageFile ? (
          <Label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center h-32 cursor-pointer"
          >
            <UploadCloud className="w-10 h-10" />
            <span className="">Drag & drop or Click to upload image</span>
          </Label>
        ) : imageLoadingState ? (
          <Skeleton className="h-10 bg-gray-100" />
        ) : (
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <FileIcon className="w-7 text-primary mr-2 h-8" />
            </div>
            <p className="text-sm font-medium">{imageFile.name}</p>
            <Button
              variant={"ghost"}
              size={"icon"}
              className="text-muted-foreground hover:text-foreground ml-3.5"
              onClick={handleImageRemove}
            >
              <XIcon className="w-3 h-3 " />
              <span className="sr-only ml-3.5">Remove file</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageUpload;
