import { useQuery } from "@tanstack/react-query";
import React from "react";
import Heading from "./Heading";
import { ProductCard } from "./ProductCard";
import { Product } from "../../Schema";
import supabase from "../../supabaseClient";

interface YouMightLikeProps {
  product_id: string;
  product_category: string;
}

const YouMightLike: React.FC<YouMightLikeProps> = ({
  product_id,
  product_category,
}) => {
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["related-products", product_category, product_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "Available")
        .eq("type", "Product")
        // .eq("category", product_category)
        .neq("id", product_id)
        .gt("stock", 0)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw new Error(error.message);
      return data as Product[];
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading related products</div>;
  if (!products || products.length === 0) return null;

  return (
    <div className="flex flex-col justify-center items-center">
      <Heading className="text-[#A8BBA3] uppercase" text="You Might Like" />
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mt-6 gap-2 md:gap-9 md:px-12">
        {products.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>
      <button className="border p-3 rounded-full text-xs px-9 my-6">
        View All
      </button>
      <div className="h-[1px] w-full bg-gray-400 md:px-12"></div>
    </div>
  );
};

export default YouMightLike;
