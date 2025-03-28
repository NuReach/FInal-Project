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
        <Link
          className="bg-[#A8BBA3] px-6 py-2 rounded-lg text-xs text-white"
          to={`/transaction/all`}
        >
          All
        </Link>
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
                      <select
                        value={item.order_status}
                        onChange={async (e) => {
                          const { data, error } = await supabase
                            .from("orders") // Ensure 'orders' is the correct table name
                            .update({ order_status: e.target.value })
                            .eq("id", item.id);
                          if (error) throw new Error(error.message);
                          toast.success("Update Status Succesfully");
                          queryClient.invalidateQueries({
                            queryKey: ["sales"],
                          });
                          console.log(data);
                        }}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Canceled">Canceled</option>
                      </select>
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
