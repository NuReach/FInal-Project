import { Link } from "react-router-dom";
import Heading from "./Heading";

export const HistorySection: React.FC = () => {
  const history = [
    {
      no: 1,
      product: "T-shirt A",
      coin: 100,
      user: "Lina",
      status: "To Be Confirm",
      statusColor: "bg-blue-500",
    },
    {
      no: 2,
      product: "T-shirt B",
      coin: 120,
      user: "Vathana",
      status: "Confirmed",
      statusColor: "bg-red-400",
    },
    {
      no: 3,
      product: "T-shirt C",
      coin: 300,
      user: "Makara",
      status: "Sold",
      statusColor: "bg-green-400",
    },
    {
      no: 4,
      product: "T-shirt D",
      coin: 260,
      user: "Somanea",
      status: "Confirmed",
      statusColor: "bg-red-400",
    },
  ];

  return (
    <div className="mt-6">
      <div className="flex gap-3 items-center">
        <Heading text="History" className="text-[#A8BBA3]" />
        <Link
          className="bg-[#A8BBA3] px-6 py-2 rounded-lg text-xs text-white"
          to={`/transaction/all`}
        >
          All
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full border border-gray-300 rounded-lg text-left">
          <thead>
            <tr className="bg-gray-300 rounded-t-lg">
              <th className="p-2 border">No</th>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Coin</th>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Edit</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.no} className="border">
                <td className="p-2 border">{item.no}</td>
                <td className="p-2 border">{item.product}</td>
                <td className="p-2 border">{item.coin}</td>
                <td className="p-2 border">{item.user}</td>
                <td className="p-2 border">
                  <span
                    className={`px-2 py-1 text-white rounded ${item.statusColor}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-2 border cursor-pointer text-blue-500">
                  Edit
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
