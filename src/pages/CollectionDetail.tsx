import { Link, useParams } from "react-router-dom";
import Footer from "../components/ui/Footer";
import Navbar from "../components/ui/Navbar";
import YouMightLike from "../components/ui/YouMightLike";
import supabase from "../supabaseClient";
import { useQuery } from "@tanstack/react-query";

export default function CollecctionDetail() {
  const { product_id } = useParams<{ product_id: string }>();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", product_id],
    queryFn: async () => {
      // 1. Get the product (with product_images and user_id)
      const { data: product, error: productError } = await supabase
        .from("products")
        .select(
          `
            *,
            product_images (id, image_url)
          `
        )
        .eq("id", product_id)
        .single();

      if (productError) throw productError;
      if (!product) throw new Error("Product not found");

      // 2. Get user_roles using product.user_id
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", product.user_id);

      if (rolesError) throw rolesError;

      // 3. Combine and return
      return {
        ...product,
        user_roles: userRoles,
      };
    },
  });
  console.log(product, isLoading);

  return (
    <div>
      <Navbar />
      {isLoading ? (
        <div>Loading</div>
      ) : (
        <div
          className="bg-white md:py-12
       lg:px-[160px] flex flex-col flex-wrap md:flex-row gap-6"
        >
          <div className="flex gap-4 p-3 flex-col md:flex-row">
            <div className="grid grid-cols-3 gap-3 md:flex md:flex-col  ">
              <img
                src={product.product_images[0].image_url}
                alt="Thumbnail 1"
                className=" w-full md:w-32 md:h-32 object-cover rounded-lg"
              />
              <img
                src={product.product_images[1].image_url}
                alt="Thumbnail 2"
                className=" w-full md:w-32 mdh-32 object-cover rounded-lg"
              />
              <img
                src={product.product_images[2].image_url}
                alt="Thumbnail 3"
                className=" w-full md:w-32 mdh-32 object-cover rounded-lg"
              />
            </div>
            <img
              src={product.image_url}
              alt={product.id}
              className=" w-full md:w-96 rounded-lg object-cover"
            />
          </div>

          <div className="flex-1 p-3 md:w-96 mt-6 md:mt-3">
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <p className="text-lg font-semibold text-gray-700">
              {product.price} coins
            </p>
            <p className="text-gray-600 mt-2">{product.description}</p>
            <div className="mt-4 border-t pt-4 text-gray-700">
              <p>
                <strong>Condition:</strong> {product.condition}%
              </p>
              <p>
                <strong>Brand:</strong> {product.brand}
              </p>
              <p>
                <strong>Usage:</strong> {product.usage}
              </p>
              <p>
                <strong>Other:</strong>{" "}
                {product.other_message.length == 0
                  ? "No Message"
                  : product.other_message}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <img
                src={product.user_roles[0].image_url}
                alt="User"
                className="w-10 h-10 rounded-full"
              />
              <Link to={`/user/profile/${product.user_roles[0].user_id}`}>
                <div>
                  <p className="font-semibold">
                    {product.user_roles[0].name}{" "}
                    <span className="text-green-500">✔</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Check out more from this user
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
      <YouMightLike
        product_category={product?.category || ""}
        product_id={product_id || ""}
      />
      <Footer />
    </div>
  );
}
