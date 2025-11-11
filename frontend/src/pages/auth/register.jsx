import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerFormControls } from "@/config"; // ✅ renamed for clarity
import CommonForm from "@/components/common/form";
import { useDispatch } from "react-redux";
import { registerUser } from "@/store/auth-slice";

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

    try {
      await dispatch(registerUser(formData)).unwrap();
      navigate("/shop");
    } catch (error) {
      console.error("Registration failed:", error);
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
