import React, { useState } from "react";
import { Link } from "react-router-dom";

import { registerFromContols } from "@/config";

import CommonForm from "@/components/common/form";

const initialState = {
  firstname: "",
  lastname: "",
  userName: "",
  email: "",
  password: "",
};

const AuthRegister = () => {
  const [formData, setFormData] = useState(initialState);

  function onSubmit() {}

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sign Up
        </h1>
      </div>
      <div>
        <CommonForm
          formControls={registerFromContols}
          buttonText={"Sign Up"}
          onSubmit={onSubmit}
          formData={formData}
          setFormData={setFormData}
        />
      </div>
      <div className="flex justify-center">
        {" "}
        <p>Already have an acoount?</p>
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
