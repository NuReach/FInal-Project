import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Footer from "../components/ui/Footer";
import Navbar from "../components/ui/Navbar";
import supabase from "../supabaseClient";
import Loading from "../components/ui/Loading";
import { Button } from "../components/ui/button";
import { ArrowLeft, ArrowRight, Filter } from "lucide-react";
import { categories } from "../Schema";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../service/useAuth";

export default function QuickBuyPage() {
  const [selectedCategories, setSelectedCategories] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(1);
  const navigate = useNavigate();
  const { data: auth } = useAuth();
  const queryClient = useQueryClient();

  const handleCheckboxChange = (category: string) => {
    setSelectedCategories(category);
  };

  const fetchProducts = async () => {
    let data = [];
    let error = null;

    if (selectedCategories === "All") {
      // Fetch all products if "All" is selected
      const { data: allData, error: allError } = await supabase
        .from("products")
        .select(
          `
          *,
          user_roles(*)
        `
        )
        .eq("status", "Available")
        .eq("type", "Product")
        .gt("stock", 0)
        .order("created_at", { ascending: false });

      if (allError) {
        error = allError;
      } else {
        data = allData;
      }
    } else {
      // Fetch products by selected category
      const { data: categoryData, error: categoryError } = await supabase
        .from("products")
        .select(
          `        *,
          user_roles(*)
        `
        )
        .eq("status", "Available")
        .eq("type", "Product")
        .gt("stock", 0)
        .eq("category", selectedCategories)
        .order("created_at", { ascending: false });

      if (categoryError) {
        error = categoryError;
      } else {
        data = categoryData;
      }
    }

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["quickBuy", selectedCategories],
    queryFn: fetchProducts,
  });

  const nextProduct = () => {
    setCurrentIndex((prev) =>
      prev < (data?.length || 1) - 1 ? prev + 1 : prev
    );
  };

  const prevProduct = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleCheckout = async () => {
    if (data) {
      const { data: cart_item, error: cartError } = await supabase
        .from("cart_items")
        .insert([
          {
            product_id: data[currentIndex].id,
            user_id: auth?.user?.id,
            quantity: 1,
            discount: data[currentIndex].discount,
            total:
              ((data[currentIndex].price *
                (100 - data[currentIndex].discount)) /
                100) *
              1,
          },
        ])
        .select(
          `*,
          products (
            *,
            product_images (image_url),
            user_roles(*)
          ),
          user_roles(*)`
        )
        .single();
      if (cartError) throw cartError;

      const { error: stockError } = await supabase.rpc("decrement_stock", {
        product_id_param: data[currentIndex].id,
      });
      if (stockError) throw stockError;

      const group = {
        seller_id: data[currentIndex].user_roles.user_id,
        seller_name: data[currentIndex].user_roles.name,
        cartItems: [cart_item],
        total:
          (data[currentIndex].price * (100 - data[currentIndex].discount)) /
          100,
      };
      queryClient.invalidateQueries({
        queryKey: ["products", "cart_item_count"],
      }); // Refresh product list

      console.log(group);

      navigate("/products/quickbuy/checkout", { state: { group } });
    }
  };
  return (
    <div>
      <Navbar />
      <section className="p-3 md:px-16 md:py-0 flex flex-col items-center ">
        {isLoading ? (
          <Loading />
        ) : (
          <div className=" flex flex-row justify-between lg:h-[660px] w-full">
            {/* Left */}
            <div className="flex flex-col gap-4 py-9 w-60">
              <div className="flex text-sm gap-3">
                <Filter />
                <p>Filter By</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="items-top flex space-x-2">
                  <input
                    type="checkbox"
                    id={"All"}
                    onChange={() => handleCheckboxChange("All")}
                    checked={selectedCategories.includes("All")}
                  />
                  <label htmlFor={"All"}>{"All"}</label>
                </div>
                {categories.map((item, i) => (
                  <div key={i} className="items-top flex space-x-2">
                    <input
                      type="checkbox"
                      id={item}
                      onChange={() => handleCheckboxChange(item)}
                      checked={selectedCategories.includes(item)}
                    />
                    <label htmlFor={item}>{item}</label>
                  </div>
                ))}
              </div>
            </div>
            {/* Middel */}
            <div className="flex items-center justify-start gap-3 relative">
              {/* Left Preview */}
              <div className="w-1/4 flex flex-col items-center p-4">
                {currentIndex > 0 && (
                  <img
                    className="w-60 h-72 border-2 rounded-3xl shadow-lg object-cover absolute top-36 -left-20  blur-[2px]"
                    src={data && data[currentIndex - 1]?.image_url}
                    alt="Previous Product"
                  />
                )}
              </div>
              <Button
                onClick={prevProduct}
                disabled={currentIndex === 0}
                className="p-2 bg-gray-300 rounded-full disabled:opacity-50 z-40"
              >
                <ArrowLeft size={20} />
              </Button>
              <div
                id="card"
                className="w-full max-w-md flex justify-center flex-col items-center z-50"
              >
                <p className="font-bold capitalize mb-6 text-center">
                  {data && data[currentIndex].name}
                </p>
                <Link to={`/product/${data && data[currentIndex].id}`}>
                  <img
                    className="w-80 h-96 border-2 rounded-2xl shadow-lg object-cover "
                    src={data && data[currentIndex].image_url}
                    alt={data && data[currentIndex].id}
                  />
                </Link>
                <p className="mt-3 text-center w-96">
                  {data && data[currentIndex].description}
                </p>
                <div className="mt-3 flex justify-center items-center gap-6">
                  <button className=" bg-[#A8BBA3] text-white text-xs py-2 px-6 rounded-lg">
                    {data && data[currentIndex].condition}%
                  </button>
                  <button className=" bg-[#A8BBA3] text-white text-xs py-2 px-6 rounded-lg">
                    {data && data[currentIndex].category}
                  </button>
                  <button className=" bg-[#A8BBA3] text-white text-xs py-2 px-6 rounded-lg">
                    {data && data[currentIndex].brand}
                  </button>
                </div>

                <div className="flex flex-col">
                  {data && data[currentIndex].discount > 0 && (
                    <div className="flex gap-1 items-baseline">
                      <p className=" mt-3 text-lg">
                        {data && data[currentIndex].price}
                      </p>
                      <span className="text-sm ">Coins</span>
                      <span className="text-red-500">
                        -{data && data[currentIndex].discount}%
                      </span>
                    </div>
                  )}
                  <div className="font-bold text-lg mt-3 flex gap-2 justify-center items-baseline">
                    <p>
                      {data &&
                        (data[currentIndex].price *
                          (100 - data[currentIndex].discount)) /
                          100}{" "}
                    </p>
                    <span className="text-sm font-bold">Coins</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={nextProduct}
                disabled={currentIndex === (data?.length || 1) - 1}
                className="p-2 bg-gray-300 rounded-full disabled:opacity-50 z-40"
              >
                <ArrowRight size={20} />
              </Button>
              {/* Left Preview */}
              <div className="w-1/4 flex flex-col items-center p-4">
                {currentIndex > 0 && (
                  <img
                    className="w-60 h-72 border-2 rounded-3xl shadow-lg object-cover absolute top-36 -right-20 z-30 blur-[2px]"
                    src={data && data[currentIndex + 1]?.image_url}
                    alt="Previous Product"
                  />
                )}
              </div>
            </div>
            {/* Right */}
            <div className="py-9 w-72 flex flex-col justify-between ">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 flex-row-reverse pb-3">
                  <img
                    src={data && data[currentIndex].user_roles.image_url}
                    alt="User"
                    className="w-16 h-16  rounded-full object-cover"
                  />
                  <Link
                    to={`/user/profile/${
                      data && data[currentIndex].user_roles.user_id
                    }`}
                  >
                    <div className="flex justify-end flex-col">
                      <p className="font-semibold justify-end flex items-center gap-3">
                        <svg
                          className="w-4 h-4 text-purple-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm5.707 9.293l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L11 13.586l5.293-5.293a1 1 0 011.414 1.414z" />
                        </svg>
                        <p>{data && data[currentIndex].user_roles.name} </p>
                      </p>
                      <p className="text-sm text-gray-500">
                        Check out more from this user
                      </p>
                    </div>
                  </Link>
                </div>
                <div className=" border-t  text-gray-700 pt-3 pl-16">
                  <p className="flex justify-between">
                    <span>{data && data[currentIndex].condition}%</span>
                    <strong>Condition</strong>{" "}
                  </p>
                  <p className="flex justify-between">
                    {data && data[currentIndex].brand} <strong>Brand</strong>
                  </p>
                  <p className="flex justify-between">
                    {data && data[currentIndex].usage} <strong>Usage</strong>
                  </p>
                  <p className="flex justify-between">
                    {data && data[currentIndex].stock}
                    <strong>Stock</strong>
                  </p>
                  <p className="flex justify-between">
                    {data && data[currentIndex].other_message.length == 0
                      ? "No Message"
                      : data && data[currentIndex].other_message}
                    <strong>Other</strong>{" "}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                className="bg-red-600 text-white"
              >
                Buy
              </Button>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
