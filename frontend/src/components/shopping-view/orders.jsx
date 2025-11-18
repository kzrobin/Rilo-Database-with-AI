import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrders,
  getOrderById,
  clearOrderDetails,
} from "../../store/shop/order-slice";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import ShoppingOrderDetailsView from "./order-details";

const ShoppingOrders = () => {
  const dispatch = useDispatch();
  const { orderList, orderDetails, isLoading } = useSelector(
    (state) => state.shopOrder
  );

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  const handleFetchOrderDetails = async (orderId) => {
    await dispatch(getOrderById(orderId));
    setOpenDetailsDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDetailsDialog(false);
    dispatch(clearOrderDetails());
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Order History</h2>

      {isLoading ? (
        <p className="text-center">Loading orders...</p>
      ) : orderList && orderList.length > 0 ? (
        <div className="space-y-3">
          {/* Headers for larger screens */}
          <div className="hidden sm:grid grid-cols-4 gap-6 font-semibold border-b pb-2 mb-2">
            <span>Order ID</span>
            <span>Date</span>
            <span>Status</span>
            <span>Total Amount</span>
          </div>

          {/* Order List */}
          {orderList.map((order) => (
            <div
              key={order._id}
              className="border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:shadow-md transition"
              onClick={() => handleFetchOrderDetails(order._id)}
            >
              {/* LEFT: ID + Date */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 w-full">
                <span className="font-mono text-sm sm:text-base break-all">
                  {order._id.slice(0, 8)}..
                </span>

                <span className="text-sm sm:text-base mt-1 sm:mt-0">
                  {new Date(order.orderDate).toLocaleDateString()}
                </span>
              </div>

              {/* RIGHT: Status + Total */}
              <div className="flex items-center gap-3 mt-3 sm:mt-0 sm:justify-end w-full sm:w-auto">
                <Badge
                  className={`py-1 px-3 text-xs sm:text-sm ${
                    order.status === "Delivered"
                      ? "bg-green-500"
                      : order.status === "Cancelled"
                      ? "bg-red-600"
                      : "bg-yellow-500"
                  }`}
                >
                  {order.status}
                </Badge>

                <span className="font-medium text-sm sm:text-base">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">No orders found.</p>
      )}

      {/* Order Details Modal */}
      <Dialog open={openDetailsDialog} onOpenChange={handleCloseDialog}>
        <ShoppingOrderDetailsView orderDetails={orderDetails} />
      </Dialog>
    </div>
  );
};

export default ShoppingOrders;
