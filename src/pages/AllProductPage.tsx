import { useQuery } from "@tanstack/react-query";
import Footer from "../components/ui/Footer";
import Navbar from "../components/ui/Navbar";
import { Product } from "../Schema";
import supabase from "../supabaseClient";
import Loading from "../components/ui/Loading";
import { ProductCard } from "../components/ui/ProductCard";
import Heading from "../components/ui/Heading";

const fetchProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "Available") // Filter by status
    .eq("type", "Product") // Filter by type
    .gt("stock", 0)
    .order("created_at", { ascending: false }) // Order by newest
    .limit(30); // Limit to 8 products

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export default function AllProductPage() {
  const { data: products, isLoading: productLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
  return (
    <div>
      <Navbar />
      <section className="p-3 md:px-24 md:py-12">
        <Heading text="Products" className="text-[#A8BBA3]" />
        {productLoading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:mt-6  ">
            {products?.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
