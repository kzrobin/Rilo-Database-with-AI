import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerFormControls } from "@/config"; // ✅ renamed for clarity
import CommonForm from "@/components/common/form";
import { useDispatch } from "react-redux";
import { registerUser, loginUser } from "@/store/auth-slice";
import { toast } from "react-toastify";

const initialState = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
};

const AuthRegister = () => {
  const [formData, setFormData] = useState(initialState);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();

    console.log(formData);

    try {
      await dispatch(registerUser(formData))
        .unwrap()
        .then((data) => {
          console.log(data);
        });
      navigate("/shop");
      toast.success("Wellcome to Rilo Cloths");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error?.message || "An error occured");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sign Up
        </h1>
      </div>

      <div>
        <CommonForm
          formControls={registerFormControls}
          buttonText="Sign Up"
          onSubmit={onSubmit}
          formData={formData}
          setFormData={setFormData}
        />
      </div>

      <div className="flex justify-center">
        <p>Already have an account?</p>
        <Link
          to="/auth/login"
          className="font-medium ml-2 text-primary hover:underline"
        >
          Log in
        </Link>
      </div>
    </div>
  );
};

export default AuthRegister;
