import { useQuery } from "@tanstack/react-query";
import { CollectionList } from "../components/ui/CollectionList";
import Footer from "../components/ui/Footer";
import { HistorySection } from "../components/ui/HistorySection";
import Navbar from "../components/ui/Navbar";
import { ProductList } from "../components/ui/ProductList";
import StatsSection from "../components/ui/StatCard";
import { TransactionSection } from "../components/ui/Transaction";
import supabase from "../supabaseClient";
import { Product } from "../Schema";
import useAuth from "../service/useAuth";
import Loading from "../components/ui/Loading";
import Heading from "../components/ui/Heading";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

const fetchProducts = async (userId: string) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("type", "Product") // Filter by type "product"
    .eq("user_id", userId) // Filter by user_id
    .order("created_at", { ascending: false }) // Order by newest
    .limit(8); // Limit to 8 products

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const fetchCollection = async (userId: string) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("type", "Collection") // Filter by type "collection"
    .eq("user_id", userId) // Filter by user_id
    .order("created_at", { ascending: false }) // Order by newest
    .limit(8); // Limit to 8 collections

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export default function DashboardPage() {
  const { data: auth, isLoading } = useAuth(); // Get the authenticated user
  const userId = auth?.user?.id; // Assuming the user object has the id field

  // Ensure userId is defined before making the query
  const { data: products, isLoading: productLoading } = useQuery<Product[]>({
    queryKey: ["products", userId], // Include userId in the query key
    queryFn: () => (userId ? fetchProducts(userId) : Promise.resolve([])), // Fallback to empty array if userId is undefined
  });

  const { data: collections, isLoading: collectionLoading } = useQuery<
    Product[]
  >({
    queryKey: ["collections", userId], // Include userId in the query key
    queryFn: () => (userId ? fetchCollection(userId) : Promise.resolve([])), // Fallback to empty array if userId is undefined
  });

  return (
    <div>
      <Navbar />
      {auth ? (
        isLoading ? (
          <Loading />
        ) : (
          <section className="p-3 md:px-24 md:py-12">
            <StatsSection />
            <HistorySection />
            <TransactionSection />
            <div className="mt-3 md:mt-6">
              {collectionLoading ? (
                <div>Loading</div>
              ) : (
                <CollectionList
                  title="Collection"
                  collections={collections || []}
                />
              )}
            </div>
            <div className="mt-3 md:mt-6">
              {productLoading ? (
                <div>Loading</div>
              ) : (
                <ProductList title="Swapping" products={products || []} />
              )}
            </div>
          </section>
        )
      ) : (
        <div className="h-screen w-screen flex flex-col justify-center items-center">
          <Heading text="Please Sign In First!" className="text-[#A8BBA3]" />
          <Link to={`/signin`} className="flex gap-2 mt-3">
            <Button>Sign In</Button>
          </Link>
        </div>
      )}
      <Footer />
    </div>
  );
}
