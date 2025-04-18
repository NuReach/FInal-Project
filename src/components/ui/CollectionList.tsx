import React from "react";
import Heading from "./Heading";
import { Product } from "../../Schema";
import { CollectionCard } from "./CollectionCard";
import { Link, useLocation, useParams } from "react-router-dom";

interface CollectionListProps {
  title: string;
  collections: Product[];
}
export const CollectionList: React.FC<CollectionListProps> = ({
  title,
  collections,
}) => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const firstSegment = pathSegments[1];
  const { acc_id } = useParams();
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex gap-3 items-center">
        <Heading text={title} className="text-[#A8BBA3]" />
        {firstSegment == "dashboard" && (
          <Link
            className="bg-[#A8BBA3] px-6 py-2 rounded-lg text-xs text-white"
            to={`/dashboard/collections`}
          >
            All
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:mt-6">
        {collections.map((product, index) => (
          <CollectionCard key={index} collection={product} />
        ))}
      </div>
      <Link
        to={acc_id ? `/collections/all/${acc_id}` : `/collections/all/data`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="border p-3 rounded-full text-xs px-9 my-6"
      >
        View All
      </Link>
      <div className="h-[1px] w-full bg-gray-400 md:px-12"></div>
    </div>
  );
};
