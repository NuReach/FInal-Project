import React from "react";
import Heading from "./Heading";
import { categories } from "../../Schema";
import { Link } from "react-router-dom";

const CategoryList: React.FC = () => {
  return (
    <div className="flex p-3 lg:p-9 flex-col items-center justify-center rounded-3xl bg-[#A8BBA3]  ">
      <Heading className="uppercase text-white" text="BROWS BY CATEGORY" />
      <div className="mt-6 w-full flex gap-6">
        <Link to={`products/shop?category=Electronics`}>
          <div className="lg:w-[600px] bg-white rounded-3xl h-48 relative">
            <Heading
              className="font-bold text-xl p-3 absolute shadow-lg"
              text={categories[0]}
            />
            <img
              src="https://aajmitddehxpwrlciruo.supabase.co/storage/v1/object/public/product-images/1743144065209-IMG_7922.jpeg"
              alt=""
              className="overflow-hidden object-cover -z-50 w-full h-48 rounded-3xl "
            />
          </div>
        </Link>
        <Link to={`products/shop?category=Electronics`}>
          <div className="lg:w-[300px] bg-white rounded-3xl h-48">
            <Heading
              className="font-bold text-xl p-3 absolute shadow-lg"
              text={categories[1]}
            />
            <img
              src="https://aajmitddehxpwrlciruo.supabase.co/storage/v1/object/public/product-images/1743131421086-photo_2025-03-26%2012.28.38.jpeg"
              alt=""
              className="overflow-hidden object-cover -z-50 w-full h-48 rounded-3xl "
            />
          </div>
        </Link>
      </div>
      <div className="mt-6 w-full flex gap-6">
        <Link to={`products/shop?category=Books`}>
          <div className="lg:w-[300px] bg-white rounded-3xl h-48">
            <Heading
              className="font-bold text-xl p-3 absolute shadow-lg"
              text={categories[6]}
            />
            <img
              src="https://aajmitddehxpwrlciruo.supabase.co/storage/v1/object/public/product-images/1743163322733-IMG_8103.jpeg"
              alt=""
              className="overflow-hidden object-cover -z-50 w-full h-48 rounded-3xl "
            />
          </div>
        </Link>
        <Link to={`products/shop?category=Furniture`}>
          <div className="lg:w-[600px] bg-white rounded-3xl h-48">
            <Heading
              className="font-bold text-xl p-3 absolute shadow-lg"
              text={categories[8]}
            />
            <img
              src="https://aajmitddehxpwrlciruo.supabase.co/storage/v1/object/public/product-images/1743356170461-photo_2025-03-31%2000.34.40.jpeg"
              alt=""
              className="overflow-hidden object-cover -z-50 w-full h-48 rounded-3xl "
            />
          </div>
        </Link>
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
