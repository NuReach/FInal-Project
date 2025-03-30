import { useQuery } from "@tanstack/react-query";
import supabase from "../../supabaseClient";
import Heading from "./Heading";
import useAuth from "../../service/useAuth";
import { useState } from "react";

export const TransactionSection: React.FC = () => {
  const { data: auth } = useAuth();

  const [page, setPage] = useState(1);
  const limit = 8;
  const offset = (page - 1) * limit;

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", auth?.user?.id, page], // Include page in query key
    queryFn: async () => {
      if (!auth?.user) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("id, coins, amount, created_at, status")
        .eq("user_id", auth.user.id)
        .range(offset, offset + limit - 1); // Use range for pagination
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!auth?.user,
  });

  const { data: transactionCount } = useQuery({
    queryKey: ["transactionCount", auth?.user?.id],
    queryFn: async () => {
      if (!auth?.user) return 0;
      const { count, error } = await supabase
        .from("transactions")
        .select("*", { count: "exact" })
        .eq("user_id", auth.user.id);
      if (error) throw new Error(error.message);
      return count || 0;
    },
    enabled: !!auth?.user,
  });

  const totalPages = Math.ceil((transactionCount || 0) / limit);

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="mt-6">
      <div className="flex gap-3 items-center">
        <Heading text="Transaction" className="text-[#A8BBA3]" />
      </div>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
        </div>
      ) : transactions?.length === 0 ? (
        <p className="text-gray-500 pl-5">No transactions found.</p>
      ) : (
        <div>
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
                {transactions?.map((transaction, index) => (
                  <tr key={index} className="border">
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border">{transaction.coins} Coins</td>
                    <td className="p-2 border">{transaction.amount}$</td>
                    <td className="p-2 border ">
                      {formatDateTime(transaction.created_at)}
                    </td>
                    <td className="p-2 border hover:cursor-pointer capitalize">
                      <p className=" bg-green-600 py-2 px-4 rounded-full text-xs text-white w-fit">
                        {transaction.status}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4 text-xs items-center">
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
