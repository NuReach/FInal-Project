import { Link } from "react-router-dom";
import Description from "./Description";
import { Product } from "../../Schema";

interface CollectionCardProps {
  collection: Product;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
}) => {
  return (
    <Link
      to={`/collection/${collection.id}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className=" rounded-lg p-3 cursor-pointer text-xs md:text-lg"
    >
      <img
        className="rounded-lg"
        src={collection.image_url}
        alt={collection.name}
      />

      <Description
        className="text-black font-bold line-clamp-1"
        text={collection.name}
      />
      <p
        className="line-clamp-1"
        style={{ margin: "0 0 10px 0", fontSize: "0.9em", color: "#666" }}
      >
        {collection.description}
      </p>
      <button className="bg-[#D5A6BD] text-xs text-white rounded-lg py-2 px-6">
        {collection.category}
      </button>
    </Link>
  );
};
