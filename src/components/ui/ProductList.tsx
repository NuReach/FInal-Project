import React from "react";
import Heading from "./Heading";
import { ProductCard } from "./ProductCard";
import { Product } from "../../Schema";

interface ProductListProps {
  title: string;
  products: Product[];
}
export const ProductList: React.FC<ProductListProps> = ({
  title,
  products,
}) => {
  return (
    <div className="flex flex-col justify-center items-center">
      <Heading className="text-[#A8BBA3] uppercase" text={title} />
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:mt-6  ">
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
