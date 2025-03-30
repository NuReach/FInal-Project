import { Link, useNavigate } from "react-router-dom";
import Heading from "./Heading";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../service/useAuth";
import supabase from "../../supabaseClient";
import { useState } from "react";
import { Button } from "./button";
import { Cart } from "../../Schema";

export const HistorySection: React.FC = () => {
  const { data: auth } = useAuth();
  const user_id = auth?.user?.id;

  const [page, setPage] = useState(1);
  const limit = 6;
  const offset = (page - 1) * limit;

  const navigate = useNavigate();

  const { data: ordersUser, isLoading: orderLoading } = useQuery({
    queryKey: ["orders", user_id, page],
    queryFn: async () => {
      // Fetch orders first
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(`*, order_items(*, products(*)), coupons(*)`)
        .eq("user_id", user_id)
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500 text-white";
      case "confirmed":
        return "bg-blue-500 text-white";
      case "pickup":
        return "bg-orange-500 text-white";
      case "delivering":
        return "bg-green-500 text-white";
      case "completed":
        return "bg-green-600 text-white";
      case "canceled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handlePageDetail = async (group: Cart) => {
    console.log(group);
    navigate("/dashboard/orderDetail", { state: { group } });
  };

  return (
    <div className="mt-6">
      <div className="flex gap-3 items-center">
        <Heading text="Orders" className="text-[#A8BBA3]" />
      </div>
      {orderLoading ? (
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
        </div>
      ) : ordersUser?.length == 0 ? (
        <p className="text-gray-500 pl-5">No transactions found.</p>
      ) : (
        <div>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full border border-gray-300 rounded-lg text-left">
              <thead>
                <tr className="bg-gray-300 rounded-t-lg">
                  <th className="p-2 border">No</th>
                  <th className="p-2 border">Total</th>
                  <th className="p-2 border">Discount</th>
                  <th className="p-2 border">Seller</th>
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
                      to={`/user/profile/${item.seller.user_id}`}
                    >
                      <td className="p-2 ">{item.seller.name}</td>
                    </Link>
                    <td className="p-2 border capitalize">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          item.order_status
                        )}`}
                      >
                        {item.order_status == "Confirmed"
                          ? "Waiting Delivery to pick up"
                          : item.order_status == "Delivering"
                          ? "Deliver is delivering to you"
                          : item.order_status == "Pickup"
                          ? "Delivery on the way to pick up"
                          : item.order_status}
                      </span>
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
