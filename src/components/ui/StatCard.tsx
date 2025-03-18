import React from "react";
import useAuth from "../../service/useAuth";
import { useQuery } from "@tanstack/react-query";
import supabase from "../../supabaseClient";

type StatCardProps = {
  title: string;
  value: number | null;
  color: string;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => {
  return (
    <div
      className="text-white rounded-2xl shadow-lg p-6 w-full text-center"
      style={{ backgroundColor: color, opacity: 0.6 }}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value ?? "Loading..."}</p>
    </div>
  );
};

const StatsSection: React.FC = () => {
  const { data } = useAuth();
  const user = data?.user;

  const { data: productCount } = useQuery({
    queryKey: ["productCount", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { count, error } = await supabase
        .from("products")
        .select("id", { count: "exact" })
        .eq("user_id", user.id);
      if (error) throw new Error(error.message);
      return count;
    },
    enabled: !!user,
  });

  const { data: availableProductCount } = useQuery({
    queryKey: ["availableProductCount", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { count, error } = await supabase
        .from("products")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .eq("status", "available");
      if (error) throw new Error(error.message);
      return count;
    },
    enabled: !!user,
  });

  const { data: balance } = useQuery({
    queryKey: ["walletBalance", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();
      if (error) throw new Error(error.message);
      return data?.balance;
    },
    enabled: !!user,
  });

  const stats = [
    { title: "Total Items", value: productCount, color: "blue" },
    { title: "Remain Items", value: availableProductCount, color: "red" },
    { title: "Total Point", value: 200, color: "green" },
    { title: "Total Coin", value: balance, color: "purple" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-9 justify-items-center">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};

export default StatsSection;
