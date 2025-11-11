import React, { useState } from "react";
import { Link } from "react-router-dom";

import { loginFromContols } from "@/config";

import CommonForm from "@/components/common/form";

const initialState = {
  email: "",
  password: "",
};

const AuthLogin = () => {
  const [formData, setFormData] = useState(initialState);

  function onSubmit() {}

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
