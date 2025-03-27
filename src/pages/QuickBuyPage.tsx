import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Footer from "../components/ui/Footer";
import Navbar from "../components/ui/Navbar";
import supabase from "../supabaseClient";
import Loading from "../components/ui/Loading";
import { ProductCard } from "../components/ui/ProductCard";
import Heading from "../components/ui/Heading";
import { Button } from "../components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const fetchProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "Available")
    .eq("type", "Product")
    .gt("stock", 0)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export default function QuickBuyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["quickBuy"],
    queryFn: fetchProducts,
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextProduct = () => {
    setCurrentIndex((prev) =>
      prev < (data?.length || 1) - 1 ? prev + 1 : prev
    );
  };

  const prevProduct = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return (
    <div>
      <Navbar />
      <section className="p-3 md:px-24 md:py-12 flex flex-col items-center">
        <Heading text="Quick Buy" className="text-[#A8BBA3]" />
        {isLoading ? (
          <Loading />
        ) : (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              onClick={prevProduct}
              disabled={currentIndex === 0}
              className="p-2 bg-gray-300 rounded-full disabled:opacity-50"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="w-full max-w-md flex justify-center">
              {data && <ProductCard product={data[currentIndex]} />}
            </div>
            <Button
              onClick={nextProduct}
              disabled={currentIndex === (data?.length || 1) - 1}
              className="p-2 bg-gray-300 rounded-full disabled:opacity-50"
            >
              <ArrowRight size={20} />
            </Button>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
