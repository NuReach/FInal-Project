import { ArrowBigRight, User2 } from "lucide-react";
import useSignOut from "../service/useSignOut";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import supabase from "../supabaseClient";
import { toast } from "react-toastify";
import useAuth from "../service/useAuth";
import { Link } from "react-router-dom";

export default function DeliveryPage() {
  const { mutateAsync: signOutMutation } = useSignOut();

  const handleSignOut = async () => {
    await signOutMutation();
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const { data: auth } = useAuth();

  const [page, setPage] = useState(1);
  const limit = 8;
  const offset = (page - 1) * limit;
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("Confirmed");

  const queryClient = useQueryClient();

  const { data: ordersUser } = useQuery({
    queryKey: ["orders", "Meanchey", status, page],
    queryFn: async () => {
      const {
        data: orders,
        error: ordersError,
        count,
      } = await supabase
        .from("orders")
        .select("*, order_items(*, products(*)), coupons(*)", {
          count: "exact",
        })
        .eq("address", "Meanchey")
        .eq("order_status", status)
        .neq("order_status", "Pending")
        .order("order_date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (ordersError) throw new Error(ordersError.message);
      setTotalPages(Math.ceil((count || 0) / limit));

      const buyerIds = [
        ...new Set(orders.map((order) => order.user_id).filter(Boolean)),
      ];
      const sellerIds = [
        ...new Set(orders.map((order) => order.seller_id).filter(Boolean)),
      ];

      const { data: buyerRoles, error: buyerError } = await supabase
        .from("user_roles")
        .select("*")
        .in("user_id", buyerIds);
      if (buyerError) throw new Error(buyerError.message);

      const { data: sellerRoles, error: sellerError } = await supabase
        .from("user_roles")
        .select("*")
        .in("user_id", sellerIds);
      if (sellerError) throw new Error(sellerError.message);

      const buyerMap = Object.fromEntries(
        buyerRoles.map((role) => [role.user_id, role])
      );
      const sellerMap = Object.fromEntries(
        sellerRoles.map((role) => [role.user_id, role])
      );

      return orders.map((order) => ({
        ...order,
        buyer: buyerMap[order.user_id] || null,
        seller: sellerMap[order.seller_id] || null,
      }));
    },
  });

  const today = new Date().toISOString().split("T")[0];

  const { data: user_role } = useQuery({
    queryKey: ["user_role", auth?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select(`*`)
        .eq("user_id", auth?.user?.id)
        .single();
      return data;
    },
  });

  const { data: todayOrders } = useQuery({
    queryKey: ["todayOrders"],
    queryFn: async () => {
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact" })
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59`);
      return count;
    },
  });

  const { data: allOrders } = useQuery({
    queryKey: ["allOrders"],
    queryFn: async () => {
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact" });
      return count;
    },
  });

  const { data: completedOrders } = useQuery({
    queryKey: ["completedOrders"],
    queryFn: async () => {
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact" })
        .eq("order_status", "Completed");
      return count;
    },
  });

  const { data: notCompletedOrders } = useQuery({
    queryKey: ["notCompletedOrders"],
    queryFn: async () => {
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact" })
        .neq("order_status", "Completed");
      return count;
    },
  });

  const stats = [
    { title: "Today Orders", value: todayOrders ?? 0, color: "blue" },
    { title: "All Orders", value: allOrders ?? 0, color: "red" },
    { title: "Success Orders", value: completedOrders ?? 0, color: "green" },
    {
      title: "Processing Orders",
      value: notCompletedOrders ?? 0,
      color: "purple",
    },
  ];

  console.log(user_role);

  return (
    <div className="flex justify-center items-center flex-col">
      {auth?.role != "delivery" ? (
        <p className="h-screen font-bold flex flex-col justify-center items-center">
          Sorry! you have no permision
          <Link to={`/`}>Go Home</Link>
        </p>
      ) : (
        <div className="md:w-96 w-full p-3">
          <nav className="bg-[#A8BBA3] text-white font-bold py-3 w-full flex items-center justify-between px-3">
            <User2 />
            <p>Delivery</p>
            <div className="hover:cursor-pointer" onClick={handleSignOut}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M9 2h9c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H9c-1.1 0-2-.9-2-2v-2h2v2h9V4H9v2H7V4c0-1.1.9-2 2-2"
                />
                <path
                  fill="currentColor"
                  d="M10.09 15.59L11.5 17l5-5l-5-5l-1.41 1.41L12.67 11H3v2h9.67z"
                />
              </svg>
            </div>
          </nav>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
          <div className="bg-[#A8BBA3] text-white text-xs px-2 py-1 my-3">
            <p className="text-sm font-bold mt-1">
              Orders in {user_role.address} District
            </p>
          </div>
          <div className="flex flex-wrap justify-between items-center gap-3">
            <button
              onClick={() => setStatus("Confirmed")}
              className=" bg-[#A8BBA3] text-white text-xs py-2 px-6 rounded-lg"
            >
              Wating
            </button>
            <button
              onClick={() => setStatus("Pickup")}
              className=" bg-[#A8BBA3] text-white text-xs py-2 px-6 rounded-lg"
            >
              Picking Up
            </button>
            <button
              onClick={() => setStatus("Delivering")}
              className=" bg-[#A8BBA3] text-white text-xs py-2 px-6 rounded-lg"
            >
              On the way
            </button>
            <button
              onClick={() => setStatus("Completed")}
              className=" bg-[#A8BBA3] text-white text-xs py-2 px-6 rounded-lg"
            >
              Completed
            </button>
          </div>
          <div className="flex flex-col gap-3 mt-3">
            {ordersUser?.length == 0 ? (
              <p className="text-gray-500 pl-5">No transactions found.</p>
            ) : (
              ordersUser?.map((item, i) => (
                <div key={i} className="flex p-2 border-2">
                  <div>
                    <img
                      src={item.seller.image_url}
                      alt={item.seller.image_url}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <p className="text-xs font-bold mt-2">{item.seller.name}</p>
                    <p className="text-xs">{item.seller.address}</p>
                    <p className="text-xs">{item.seller.phone}</p>
                  </div>
                  <div className="flex justify-center items-center">
                    <ArrowBigRight />
                  </div>
                  <div className="w-40">
                    <p className="text-xs font-bold">
                      Date :{" "}
                      <span className="font-normal">
                        {" "}
                        {formatDateTime(item.created_at)}{" "}
                      </span>{" "}
                    </p>
                    <p className="text-xs font-bold">
                      Information :{" "}
                      <span className="font-normal">
                        {item.shipping_address}{" "}
                      </span>{" "}
                    </p>
                    <p className="text-xs font-bold">
                      Items :{" "}
                      <span className="font-normal">
                        {item.order_items.length}
                      </span>{" "}
                    </p>
                    <p className="text-xs font-bold">
                      Total :{" "}
                      <span className="font-normal text-red-500">
                        {item.total_amount} Coins
                      </span>{" "}
                    </p>
                    <td className=" border rounded-lg capitalize ">
                      {item.order_status != "Completed" ? (
                        <select
                          className="text-xs"
                          value={item.order_status}
                          onChange={async (e) => {
                            if (
                              !item?.id ||
                              !item?.total_amount ||
                              !item?.seller?.user_id
                            ) {
                              console.error("Invalid order data");
                              return;
                            }

                            const newStatus = e.target.value;

                            // Update the order status
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

                            // If status is "Completed", update the seller's wallet
                            if (newStatus === "Completed") {
                              const { data: walletData, error: walletError } =
                                await supabase
                                  .from("wallets")
                                  .select("*")
                                  .eq("user_id", item.seller.user_id)
                                  .single();

                              if (walletError) {
                                console.error(walletError.message);
                                toast.error("Failed to fetch seller's wallet");
                                return;
                              }

                              const newBalance =
                                (walletData?.balance || 0) + item.total_amount;

                              const { error: updateWalletError } =
                                await supabase
                                  .from("wallets")
                                  .update({ balance: newBalance })
                                  .eq("user_id", item.seller.user_id);

                              if (updateWalletError) {
                                console.error(updateWalletError.message);
                                toast.error("Failed to update wallet balance");
                                return;
                              }

                              console.log("Wallet updated:", newBalance);
                              toast.success(
                                "Seller's wallet updated successfully"
                              );
                            }

                            queryClient.invalidateQueries({
                              queryKey: ["orders"],
                            });
                          }}
                        >
                          <option hidden>
                            {item.order_status == "Confirmed"
                              ? "Waiting for pickup"
                              : ""}
                          </option>
                          <option
                            value="Pickup"
                            hidden={
                              item.order_status == "Pickup" ||
                              item.order_status == "Delivering"
                            }
                          >
                            Picking Up
                          </option>
                          <option
                            value="Delivering"
                            hidden={
                              item.order_status == "Confirmed" ||
                              item.order_status == "Delivering"
                            }
                          >
                            Delivering
                          </option>
                          <option
                            value="Completed"
                            hidden={item.order_status != "Delivering"}
                          >
                            Completed
                          </option>
                        </select>
                      ) : (
                        <button className=" bg-[#A8BBA3] text-white text-xs py-2 px-6 rounded-lg">
                          Completed
                        </button>
                      )}
                    </td>
                  </div>
                  <div className="flex justify-center items-center">
                    <ArrowBigRight />
                  </div>
                  <div>
                    <img
                      src={item.buyer.image_url}
                      alt=""
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <p className="text-xs font-bold mt-2">{item.buyer.name}</p>
                    <p className="text-xs">{item.buyer.address}</p>
                    <p className="text-xs">{item.buyer.phone}</p>
                  </div>
                </div>
              ))
            )}
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
              disabled={page >= totalPages}
              className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => {
  return (
    <div
      className="text-white rounded-lg shadow-lg p-3 text-center"
      style={{ backgroundColor: color, opacity: 0.6 }}
    >
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-lg font-bold mt-2">{value ?? "Loading..."}</p>
    </div>
  );
};

type StatCardProps = {
  title: string;
  value: number | null;
  color: string;
};
