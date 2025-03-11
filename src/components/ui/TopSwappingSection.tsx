import React from "react";
import Heading from "./Heading";
import { ProductCard } from "./ProductCard";
import { Product } from "../../Schema";

interface ProductListProps {
  title: string;
  products: Product[];
}
const ProductList: React.FC<ProductListProps> = ({ title, products }) => {
  return (
    <div className="flex flex-col justify-center items-center">
      <Heading className="text-[#A8BBA3] uppercase" text={title} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-6 gap-9 md:px-12 ">
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

export const TopSwappingSection: React.FC = () => {
  const products: Product[] = [
    {
      id: "1",
      name: "T-shirt with Tape Details",
      description: "Lorem de la leru monte sha fork",
      price: 120,
      imageUrl:
        "https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg",
    },
    {
      id: "2",
      name: "Skinny Fit Jeans",
      description: "Lorem de la leru monte sha fork",
      price: 240,
      originalPrice: 260,
      discountPercentage: 30,
      imageUrl:
        "https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg",
    },
    {
      id: "3",
      name: "Checkered Shirt",
      description: "Lorem de la leru monte sha fork",
      price: 180,
      imageUrl:
        "https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg",
    },
    {
      id: "4",
      name: "Sleeve Striped T-shirt",
      description: "Lorem de la leru monte sha fork",
      price: 130,
      originalPrice: 200,
      discountPercentage: 30,
      imageUrl:
        "https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg",
    },
  ];

  return (
    <div className="p-3 md:p-6">
      <ProductList title="Top Swap" products={products} />
    </div>
  );
};
