import { Link } from "react-router-dom";
import Description from "./Description";
import { Product } from "../../Schema";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className=" rounded-lg p-3 cursor-pointer text-xs md:text-lg"
    >
      <img
        className="rounded-lg "
        src={
          typeof product.image_url === "string" ? product.image_url : undefined
        }
        alt={product.name}
      />

      <Description className="text-black font-bold" text={product.name} />
      <p
        className="line-clamp-1 "
        style={{ margin: "0 0 10px 0", fontSize: "0.9em", color: "#666" }}
      >
        {product.description}
      </p>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontWeight: "bold" }}>
          {(product.price * (100 - product.discount)) / 100} coins
        </span>
        {product.price && product.discount > 0 && (
          <span
            style={{
              marginLeft: "10px",
              textDecoration: "line-through",
              color: "#999",
            }}
          >
            {product.price}
          </span>
        )}
        {product.discount > 0 && (
          <span style={{ marginLeft: "10px", color: "red" }}>
            -{product.discount}%
          </span>
        )}
      </div>
    </Link>
  );
};
