import { useEffect, useState } from "react";
import CommonForm from "../common/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { addressFormControls } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewAddress,
  deleteAddress,
  updateAddress,
  getAddresses,
} from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import { toast } from "react-toastify";

const initialAddressFormData = {
  address: "",
  city: "",
  phone: "",
  pincode: "",
  notes: "",
};

function Address({ setCurrentSelectedAddress, selectedId }) {
  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addressList } = useSelector((state) => state.shopAddress);

  // Manage Add / Update Address
  function handleManageAddress(event) {
    event.preventDefault();

    if (addressList.length >= 3 && !currentEditedId) {
      toast.error("You can add max 3 addresses");
      return;
    }

    if (currentEditedId) {
      dispatch(updateAddress({ id: currentEditedId, formData })).then((res) => {
        if (res.payload) {
         
          setCurrentEditedId(null);
          setFormData(initialAddressFormData);
        }
      });
    } else {
      dispatch(addNewAddress(formData)).then((res) => {
        if (res.payload) {
          setFormData(initialAddressFormData);
        }
      });
    }
  }

  // Delete Address
  function handleDeleteAddress(address) {
    dispatch(deleteAddress(address._id)).then((res) => {
      if (res.payload) {
        dispatch(getAddresses())
      }
    });
  }

  // Edit Address
  function handleEditAddress(address) {
    setCurrentEditedId(address._id);
    setFormData({
      address: address.address,
      city: address.city,
      phone: address.phone,
      pincode: address.pincode,
      notes: address.notes || "",
    });
  }

  // Validate Form
  function isFormValid() {
    return Object.keys(formData)
      .filter((key) => key !== "notes")
      .every((key) => formData[key].trim() !== "");
  }

  // Fetch all addresses on mount
  useEffect(() => {
    dispatch(getAddresses());
    console.log(addressList);
  }, [dispatch]);

  return (
    <Card>
      <div className="mb-5 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {addressList?.length > 0 &&
          addressList.map((addr) => (
            <AddressCard
              key={addr._id}
              selectedId={selectedId}
              handleDeleteAddress={handleDeleteAddress}
              addressInfo={addr}
              handleEditAddress={handleEditAddress}
              setCurrentSelectedAddress={setCurrentSelectedAddress}
            />
          ))}
      </div>

      <CardHeader>
        <CardTitle>
          {currentEditedId ? "Edit Address" : "Add New Address"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <CommonForm
          formControls={addressFormControls}
          formData={formData}
          setFormData={setFormData}
          buttonText={currentEditedId ? "Edit" : "Add"}
          onSubmit={handleManageAddress}
          isBtnDisabled={!isFormValid()}
        />
      </CardContent>
    </Card>
  );
}

export default Address;
