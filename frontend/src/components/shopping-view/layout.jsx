import React from "react";
import { Outlet } from "react-router-dom";

const ShoppingLayout = () => {
  return (
    <div className="flex min-h-screen w-full">
      <main className="flex flex-1 bg-muted/40 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default ShoppingLayout;
