import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginFromContols } from "@/config";
import CommonForm from "@/components/common/form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { loginUser } from "@/store/auth-slice";

const initialState = {
  email: "",
  password: "",
};

const AuthLogin = () => {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();

    console.log(formData);

    try {
      await dispatch(loginUser(formData))
        .unwrap()
        .then((data) => {
          console.log(data);
        });
      navigate("/shop/home");
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
          Sign In to your account
        </h1>
      </div>
      <div>
        <CommonForm
          formControls={loginFromContols}
          buttonText={"Sign In"}
          onSubmit={onSubmit}
          formData={formData}
          setFormData={setFormData}
        />
      </div>
      <div className="flex justify-center">
        {" "}
        <p>Don't have a account?</p>
        <Link
          to="/auth/register"
          className="font-medium ml-2 text-primary hover:underline"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default AuthLogin;
