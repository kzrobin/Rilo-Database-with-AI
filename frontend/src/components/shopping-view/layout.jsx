import React from "react";
import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import ShoppingListing from "../../pages/shopping-view/listing";

const ShoppingLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <ShoppingHeader />
      <main className="flex flex-col w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default ShoppingLayout;
