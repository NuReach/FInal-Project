import { Link } from "react-router-dom";
import Heading from "./Heading";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../service/useAuth";
import supabase from "../../supabaseClient";

export const HistorySection: React.FC = () => {
  const { data: auth } = useAuth();
  const user_id = auth?.user?.id;

  const { data: ordersUser, isLoading: orderLoading } = useQuery({
    queryKey: ["orders", user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`*,user_roles(*),order_items(*,products(*))`)
        .eq("user_id", user_id) // Fetch orders for this user
        .order("order_date", { ascending: false })
        .limit(8);

      if (error) throw new Error(error.message);
      return data;
    },
  });
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500 text-white"; // Yellow for pending
      case "approved":
        return "bg-blue-500 text-white"; // Blue for approved
      case "delivery":
        return "bg-orange-500 text-white"; // Orange for delivery
      case "completed":
        return "bg-green-500 text-white"; // Green for completed
      case "canceled":
        return "bg-red-500 text-white"; // Red for canceled
      default:
        return "bg-gray-500 text-white"; // Gray for unknown status
    }
  };

  return (
    <div className="mt-6">
      <div className="flex gap-3 items-center">
        <Heading text="Orders" className="text-[#A8BBA3]" />
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
      ) : (
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
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border">{item.total_amount}</td>
                  <td className="p-2 border">{item.discount}</td>
                  <td className="p-2 border">{item.user_roles.name}</td>
                  <td className="p-2 border capitalize">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        item.order_status
                      )}`}
                    >
                      {item.order_status}
                    </span>
                  </td>
                  <th className="p-2 border">
                    {formatDateTime(item.created_at)}
                  </th>
                  <td className="p-2 border cursor-pointer text-blue-500">
                    Edit
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
