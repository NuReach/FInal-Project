import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import Footer from "../components/ui/Footer";
import Heading from "../components/ui/Heading";
import Navbar from "../components/ui/Navbar";

const products = [
  {
    id: 1,
    name: "Handbag A",
    price: "$50",
    stock: 20,
    category: "Luxury",
    status: "Available",
  },
  {
    id: 2,
    name: "Handbag B",
    price: "$40",
    stock: 15,
    category: "Casual",
    status: "Out of Stock",
  },
  {
    id: 3,
    name: "Handbag C",
    price: "$60",
    stock: 10,
    category: "Premium",
    status: "Available",
  },
];

export default function ProductTablePage() {
  return (
    <div>
      <Navbar />
      <section className="p-3 md:px-24">
        <div className="flex items-center flex-wrap md:gap-6">
          <Heading text={`Products List`} className="text-[#A8BBA3]" />
          <Link to={`/dashboard/create/product`}>
            <Button className="text-xs">Add Product</Button>
          </Link>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full border border-black rounded-lg text-left shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-300">
                <th className="p-2 border">No</th>
                <th className="p-2 border">Product</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Stock</th>
                <th className="p-2 border">Category</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Edit</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id} className="border">
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border">{product.name}</td>
                  <td className="p-2 border">{product.price}</td>
                  <td className="p-2 border">{product.stock}</td>
                  <td className="p-2 border">{product.category}</td>
                  <td
                    className={`p-2 border ${
                      product.status === "Available"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {product.status}
                  </td>
                  <td className="p-2 border cursor-pointer text-blue-500">
                    Edit
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Footer />
    </div>
  );
}
