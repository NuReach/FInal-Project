import { useQuery } from "@tanstack/react-query";
import Footer from "../components/ui/Footer";
import Navbar from "../components/ui/Navbar";
import supabase from "../supabaseClient";
import Loading from "../components/ui/Loading";
import { ProductCard } from "../components/ui/ProductCard";
import Heading from "../components/ui/Heading";

const fetchProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "Available")
    .eq("type", "Product")
    .gt("stock", 0)
    .order("created_at", { ascending: false })
    .limit(30); // Fetch the last 30 created products

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export default function NewArrivalPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["newArrivals"],
    queryFn: fetchProducts,
  });

  return (
    <div>
      <Navbar />
      <section className="p-3 md:px-24 md:py-12">
        <Heading text="New Arrivals" className="text-[#A8BBA3]" />
        {isLoading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:mt-6">
            {data?.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
