import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import Footer from "../components/ui/Footer";
import Navbar from "../components/ui/Navbar";
import supabase from "../supabaseClient";
import Loading from "../components/ui/Loading";
import { ProductCard } from "../components/ui/ProductCard";
import Heading from "../components/ui/Heading";
import { categories } from "../Schema";
import { Button } from "../components/ui/button";

const fetchProducts = async (
  page: number,
  limit: number,
  category: string | null
) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("status", "Available")
    .eq("type", "Product")
    .gt("stock", 0)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return { data, total: count || 0 };
};

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const category = decodeURIComponent(searchParams.get("category") || ""); // Decode category properly
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, category], // Refetch when category changes
    queryFn: () => fetchProducts(page, limit, category),
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div>
      <Navbar />
      <section className="p-3 md:px-24 md:py-12">
        <Heading text="Shop Products" className="text-[#A8BBA3]" />
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="flex flex-wrap justify-between items-center gap-3 mt-3">
              {categories.map((item, i) => (
                <Link
                  key={i}
                  to={`/products/shop?category=${encodeURIComponent(item)}`}
                >
                  <Button
                    className={`${
                      category === item
                        ? "bg-[#A8BBA3] text-xs text-white"
                        : "text-xs"
                    }`}
                  >
                    {item}
                  </Button>
                </Link>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:mt-6">
              {data?.data?.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
            <div className="flex justify-end mt-6 space-x-4 text-xs">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setPage((prev) => Math.max(prev - 1, 1));
                }}
                disabled={page === 1}
                className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setPage((prev) => (prev < totalPages ? prev + 1 : prev));
                }}
                disabled={page >= totalPages}
                className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}
