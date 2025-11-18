import React from "react";
import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  if (!orderDetails) return null;

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
      <div className="grid gap-6">
        {/* Order Summary */}
        <div className="grid gap-2">
          <div className="flex justify-between items-center mt-6">
            <p className="font-medium">Order ID</p>
            <Label>{orderDetails._id}</Label>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="font-medium">Order Date</p>
            <Label>
              {new Date(orderDetails.orderDate).toLocaleDateString()}
            </Label>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="font-medium">Total Amount</p>
            <Label>${orderDetails.totalAmount}</Label>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="font-medium">Order Status</p>
            <Badge
              className={`py-1 px-3 ${
                orderDetails.status === "Delivered"
                  ? "bg-green-500"
                  : orderDetails.status === "Cancelled"
                  ? "bg-red-600"
                  : "bg-black"
              }`}
            >
              {orderDetails.status}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Order Items Table */}
        <div className="grid gap-2">
          <div className="font-medium">Order Items</div>
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-left border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border-b">Product</th>
                  <th className="px-4 py-2 border-b">Quantity</th>
                  <th className="px-4 py-2 border-b">Price</th>
                  <th className="px-4 py-2 border-b">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.orderItems &&
                orderDetails.orderItems.length > 0 ? (
                  orderDetails.orderItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b">
                        {item.productId.title}
                      </td>
                      <td className="px-4 py-2 border-b">{item.quantity}</td>
                      <td className="px-4 py-2 border-b">
                        ${item.priceAtPurchase}
                      </td>
                      <td className="px-4 py-2 border-b">
                        ${item.priceAtPurchase * item.quantity}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-2 border-b text-center" colSpan={4}>
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* Shipping Info */}
        <div className="grid gap-2">
          <div className="font-medium">Shipping Info</div>
          <div className="grid gap-0.5 text-muted-foreground">
            <span>{orderDetails.addressId?.address}</span>
            <span>{orderDetails.addressId?.city}</span>
            <span>{orderDetails.addressId?.pincode}</span>
            <span>{orderDetails.addressId?.phone}</span>
            {orderDetails.addressId?.notes && (
              <span>{orderDetails.addressId.notes}</span>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
