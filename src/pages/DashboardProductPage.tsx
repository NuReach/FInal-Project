import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import Footer from "../components/ui/Footer";
import Heading from "../components/ui/Heading";
import Navbar from "../components/ui/Navbar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabaseClient";
import { toast } from "react-toastify";

const fetchProducts = async () => {
  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }

  return data; // Returns an array of products
};

export default function ProductTablePage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["user-products"], // Caches data under 'products'
    queryFn: fetchProducts, // Calls the fetch function
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });

  return (
    <div>
      <Navbar />
      {isLoading ? (
        <div className="h-screen w-screen flex justify-center items-center">
          Loading...
        </div>
      ) : (
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
                {data?.map((product, index) => (
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
                    <td className="p-2 border cursor-pointer flex gap-3">
                      <Link to={`/dashboard/product/edit/${product.id}`}>
                        Edit
                      </Link>
                      <button
                        onClick={async () => {
                          const { error } = await supabase
                            .from("products") // Replace with your actual table name
                            .delete()
                            .eq("id", product.id);
                          if (error) {
                            toast.error(error.message);
                          }
                          toast.success("Deleted successfully");
                          queryClient.invalidateQueries({
                            queryKey: ["user-products"],
                          });
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <Footer />
    </div>
  );
}
