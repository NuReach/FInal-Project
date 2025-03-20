import { useQuery } from "@tanstack/react-query";
import supabase from "../supabaseClient";
import Navbar from "../components/ui/Navbar";
import Carousel from "../components/ui/Carousel";
import CategorySection from "../components/ui/CategorySection";
import Footer from "../components/ui/Footer";
import { ProductList } from "../components/ui/ProductList";
import { Product } from "../Schema";
import useAuth from "../service/useAuth";
import { CollectionList } from "../components/ui/CollectionList";

const fetchProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "Available") // Filter by status
    .eq("type", "Product") // Filter by type
    .gt("stock", 0)
    .order("created_at", { ascending: false }) // Order by newest
    .limit(8); // Limit to 8 products

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const fetchCollection = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "Available") // Filter by status
    .eq("type", "Collection") // Filter by type "collection"
    .gt("stock", 0)
    .order("created_at", { ascending: false }) // Order by newest
    .limit(8); // Limit to 8 products

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

function Home() {
  const { data: user, isLoading } = useAuth();
  console.log(user, isLoading);

  const { data: products, isLoading: productLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: collections, isLoading: collectionLoading } = useQuery<
    Product[]
  >({
    queryKey: ["collections"],
    queryFn: fetchCollection,
  });

  return (
    <div>
      <Navbar />
      <Carousel />
      <section className="p-3 md:px-24 md:py-12">
        <div className="mt-3 md:mt-6">
          {productLoading ? (
            <div>Loading</div>
          ) : (
            <ProductList title="Swapping" products={products || []} />
          )}
        </div>
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
      </section>
      <CategorySection />
      <Footer />
    </div>
  );
}

export default Home;
