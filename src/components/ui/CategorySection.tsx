import React from "react";
import Heading from "./Heading";

interface Category {
  name: string;
}

const categories: Category[] = [
  { name: "Men" },
  { name: "Women" },
  { name: "Cloth" },
  { name: "Gym" },
];

console.log(categories);

const CategoryList: React.FC = () => {
  return (
    <div className="flex p-16 flex-col items-center justify-center rounded-3xl bg-[#A8BBA3]  ">
      <Heading className="uppercase text-white" text="BROWS BY CATEGORY" />
      <div className="mt-6 w-full flex gap-6">
        <div className="lg:w-[600px] bg-white rounded-3xl h-48"></div>
        <div className="lg:w-[300px] bg-white rounded-3xl h-48"></div>
      </div>
      <div className="mt-6 w-full flex gap-6">
        <div className="lg:w-[300px] bg-white rounded-3xl h-48"></div>
        <div className="lg:w-[600px] bg-white rounded-3xl h-48"></div>
      </div>
    </div>
  );
};

const CategorySection: React.FC = () => {
  return (
    <div className="flex justify-center p-9">
      <CategoryList />
    </div>
  );
};

export default CategorySection;
