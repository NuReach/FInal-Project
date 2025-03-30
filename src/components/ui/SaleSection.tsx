import { Link, useNavigate } from "react-router-dom";
import Heading from "./Heading";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../service/useAuth";
import supabase from "../../supabaseClient";
import { useState } from "react";
import { Button } from "./button";
import { Cart } from "../../Schema";
import { toast } from "react-toastify";

export const SaleSection: React.FC = () => {
  const { data: auth } = useAuth();
  const user_id = auth?.user?.id;
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const limit = 6;
  const offset = (page - 1) * limit;

  const navigate = useNavigate();

  const { data: ordersUser, isLoading: orderLoading } = useQuery({
    queryKey: ["sales", user_id, page],
    queryFn: async () => {
      // Fetch orders first
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(`*, order_items(*, products(*)), coupons(*)`)
        .eq("seller_id", user_id)
        .order("order_date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (ordersError) throw new Error(ordersError.message);

      // Extract unique buyer & seller IDs
      const buyerIds = [
        ...new Set(orders.map((order) => order.user_id).filter(Boolean)),
      ];
      const sellerIds = [
        ...new Set(orders.map((order) => order.seller_id).filter(Boolean)),
      ];

      // Fetch buyer roles
      const { data: buyerRoles, error: buyerError } = await supabase
        .from("user_roles")
        .select("*")
        .in("user_id", buyerIds);

      if (buyerError) throw new Error(buyerError.message);

      // Fetch seller roles
      const { data: sellerRoles, error: sellerError } = await supabase
        .from("user_roles")
        .select("*")
        .in("user_id", sellerIds);

      if (sellerError) throw new Error(sellerError.message);

      // Create lookup maps
      const buyerMap = Object.fromEntries(
        buyerRoles.map((role) => [role.user_id, role])
      );
      const sellerMap = Object.fromEntries(
        sellerRoles.map((role) => [role.user_id, role])
      );

      // Merge buyer & seller roles into orders
      const enrichedOrders = orders.map((order) => ({
        ...order,
        buyer: buyerMap[order.user_id] || null,
        seller: sellerMap[order.seller_id] || null,
      }));

      return enrichedOrders;
    },
  });

  console.log(ordersUser);

  const { data: orderCount } = useQuery({
    queryKey: ["ordersCount", user_id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("user_id", user_id);

      if (error) throw new Error(error.message);

      return count || 0;
    },
  });

  const totalPages = Math.ceil((orderCount || 0) / limit);

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const handlePageDetail = async (group: Cart) => {
    console.log(group);
    navigate("/dashboard/orderDetail", { state: { group } });
  };

  return (
    <div className="mt-6">
      <div className="flex gap-3 items-center">
        <Heading text="Sales" className="text-[#A8BBA3]" />
      </div>
      {orderLoading ? (
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
        </div>
      ) : ordersUser?.length == 0 ? (
        <p className="text-gray-500 pl-5">No One Buy Your Items Yet.</p>
      ) : (
        <div>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full border border-gray-300 rounded-lg text-left">
              <thead>
                <tr className="bg-gray-300 rounded-t-lg">
                  <th className="p-2 border">No</th>
                  <th className="p-2 border">Total</th>
                  <th className="p-2 border">Discount</th>
                  <th className="p-2 border">Buyer</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Edit</th>
                </tr>
              </thead>
              <tbody>
                {ordersUser?.map((item, index) => (
                  <tr key={item.id} className="border">
                    <td className="p-2 border">{offset + index + 1}</td>
                    <td className="p-2 border">{item.total_amount}</td>
                    <td className="p-2 border">{item.discount}</td>
                    <Link
                      target="_blank"
                      to={`/user/profile/${item.buyer.user_id}`}
                    >
                      <td className="p-2 ">{item.buyer.name}</td>
                    </Link>
                    <td className="p-2 border capitalize">
                      {item.order_status == "Completed" ? (
                        <button className=" bg-[#A8BBA3] text-white text-xs py-2 px-6 rounded-lg">
                          Completed
                        </button>
                      ) : item.order_status == "Canceled" ? (
                        <button className=" bg-red-600 text-white text-xs py-2 px-6 rounded-lg">
                          Canceled
                        </button>
                      ) : (
                        <select
                          value={item.order_status}
                          onChange={async (e) => {
                            if (
                              !item?.id ||
                              !item?.total_amount ||
                              !item?.buyer?.user_id ||
                              !item?.order_items
                            ) {
                              console.error("Invalid order data");
                              return;
                            }

                            const newStatus = e.target.value;

                            // Update order status
                            const { data: orderData, error: orderError } =
                              await supabase
                                .from("orders")
                                .update({ order_status: newStatus })
                                .eq("id", item.id);

                            if (orderError) {
                              console.error(orderError.message);
                              toast.error("Failed to update order status");
                              return;
                            }

                            console.log("Order status updated:", orderData);
                            toast.success("Update Status Successfully");

                            // If canceled, restore stock and refund buyer
                            if (newStatus === "Canceled") {
                              // Restore stock for each product
                              for (const orderItem of item.order_items) {
                                const {
                                  data: productData,
                                  error: productError,
                                } = await supabase
                                  .from("products")
                                  .select("stock")
                                  .eq("id", orderItem.product_id)
                                  .single();

                                if (productError) {
                                  console.error(
                                    `Failed to fetch stock for product ${orderItem.product_id}:`,
                                    productError.message
                                  );
                                  toast.error(
                                    "Failed to restore product stock"
                                  );
                                  return;
                                }

                                const newStock =
                                  (productData?.stock || 0) +
                                  orderItem.quantity;

                                const { error: stockUpdateError } =
                                  await supabase
                                    .from("products")
                                    .update({ stock: newStock })
                                    .eq("id", orderItem.product_id);

                                if (stockUpdateError) {
                                  console.error(
                                    `Failed to update stock for product ${orderItem.product_id}:`,
                                    stockUpdateError.message
                                  );
                                  toast.error(
                                    "Failed to restore product stock"
                                  );
                                  return;
                                }

                                console.log(
                                  `Stock restored for product ${orderItem.product_id}:`,
                                  newStock
                                );
                              }

                              // Refund amount to buyer's wallet
                              const { data: walletData, error: walletError } =
                                await supabase
                                  .from("wallets")
                                  .select("balance")
                                  .eq("user_id", item.buyer.user_id)
                                  .single();

                              if (walletError) {
                                console.error(walletError.message);
                                toast.error("Failed to fetch buyer's wallet");
                                return;
                              }

                              const newBalance =
                                (walletData?.balance || 0) + item.total_amount;

                              const { error: walletUpdateError } =
                                await supabase
                                  .from("wallets")
                                  .update({ balance: newBalance })
                                  .eq("user_id", item.buyer.user_id);

                              if (walletUpdateError) {
                                console.error(walletUpdateError.message);
                                toast.error("Failed to refund buyer");
                                return;
                              }

                              console.log("Buyer refunded:", newBalance);
                              toast.success("Buyer refunded successfully");
                            }

                            queryClient.invalidateQueries({
                              queryKey: ["sales"],
                            });
                          }}
                        >
                          <option value="Pending" hidden>
                            Pending
                          </option>
                          <option
                            value="Confirmed"
                            hidden={
                              item.order_status == "Pickup" ||
                              item.order_status == "Confirmed" ||
                              item.order_status == "Delivering"
                            }
                          >
                            Confirmed
                          </option>
                          <option
                            value="Pickup"
                            hidden={
                              item.order_status == "Pending" ||
                              item.order_status == "Confirmed" ||
                              item.order_status == "Pickup" ||
                              item.order_status == "Delivering"
                            }
                          >
                            On the way to pick up
                          </option>
                          <option
                            value="Delivering"
                            hidden={
                              item.order_status == "Pending" ||
                              item.order_status == "Confirmed" ||
                              item.order_status == "Pickup" ||
                              item.order_status == "Delivering"
                            }
                          >
                            Deliver to buyer
                          </option>
                          <option
                            value="Canceled"
                            hidden={item.order_status != "Pending"}
                          >
                            Canceled
                          </option>
                        </select>
                      )}
                    </td>
                    <th className="p-2 border">
                      {formatDateTime(item.created_at)}
                    </th>
                    <td className="p-2 border cursor-pointer text-blue-500">
                      <Button onClick={() => handlePageDetail(item)}>
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end text-xs items-center mt-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
