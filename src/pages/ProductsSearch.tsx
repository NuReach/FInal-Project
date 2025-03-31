import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import Footer from "../components/ui/Footer";
import Navbar from "../components/ui/Navbar";
import supabase from "../supabaseClient";
import Loading from "../components/ui/Loading";
import { ProductCard } from "../components/ui/ProductCard";
import Heading from "../components/ui/Heading";

const fetchProducts = async (
  page: number,
  limit: number,
  acc_id?: string,
  searchQuery?: string
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

  // Filter by user ID if provided
  if (acc_id && acc_id !== "data") {
    query = query.eq("user_id", acc_id);
  }

  // Apply search filter if a search query exists
  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`); // Case-insensitive search
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return { data, total: count || 0 };
};

export default function ProductsSearch() {
  const [page, setPage] = useState(1);
  const limit = 12;
  const { acc_id } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, acc_id, searchQuery],
    queryFn: () => fetchProducts(page, limit, acc_id, searchQuery),
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div>
      <Navbar />
      <section className="p-3 md:px-24 md:py-12">
        <Heading
          text={searchQuery ? `Results for "${searchQuery}"` : "Products"}
          className="text-[#A8BBA3]"
        />
        {isLoading ? (
          <Loading />
        ) : (
          <>
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
