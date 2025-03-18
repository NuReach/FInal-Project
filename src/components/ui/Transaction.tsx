import { useQuery } from "@tanstack/react-query";
import supabase from "../../supabaseClient";
import Heading from "./Heading";
import { Link } from "react-router-dom";
import useAuth from "../../service/useAuth";

export const TransactionSection: React.FC = () => {
  const { data: auth } = useAuth(); // Get the authenticated user

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", auth?.user?.id],
    queryFn: async () => {
      if (!auth?.user) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("id, coins, amount, created_at, status")
        .eq("user_id", auth.user.id) // Filter by user ID
        .limit(8);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!auth?.user, // Only run the query if user exists
  });

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="mt-6">
      <div className="flex gap-3 items-center">
        <Heading text="Transaction" className="text-[#A8BBA3]" />
        <Link
          className="bg-[#A8BBA3] px-6 py-2 rounded-lg text-xs text-white"
          to={`/transaction/all`}
        >
          All
        </Link>
      </div>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
        </div>
      ) : transactions?.length === 0 ? (
        <p className="text-gray-500 pl-5">No transactions found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full border border-gray-300 text-left">
            <thead>
              <tr className="bg-gray-300">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Coins</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Created At</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.map((transaction) => (
                <tr key={transaction.id} className="border">
                  <td className="p-2 border">{transaction.id}</td>
                  <td className="p-2 border">{transaction.coins} Coins</td>
                  <td className="p-2 border">{transaction.amount}$</td>
                  <td className="p-2 border">
                    {formatDateTime(transaction.created_at)}
                  </td>
                  <td className="p-2 border">{transaction.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
