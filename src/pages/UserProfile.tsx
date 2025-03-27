import { Link, useParams } from "react-router-dom";
import { CollectionList } from "../components/ui/CollectionList";
import Feedback from "../components/ui/Feedback";
import Footer from "../components/ui/Footer";
import Heading from "../components/ui/Heading";
import Navbar from "../components/ui/Navbar";
import { ProductList } from "../components/ui/ProductList";
import { Product } from "../Schema";
import useAuth from "../service/useAuth";
import { Button } from "../components/ui/button";
import supabase from "../supabaseClient";
import { useQuery } from "@tanstack/react-query";
import Loading from "../components/ui/Loading";
import UpdateUserSection from "../components/ui/UpdateUserSection";

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

const fetchUserDetail = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", userId)
    .single(); // Assuming each user has a single role entry

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export default function UserProfile() {
  const { data } = useAuth();
  const user = data?.user;
  const { acc_id } = useParams();

  const { data: userDetail, isLoading: userDetailLoading } = useQuery({
    queryKey: ["userDetail", acc_id], // Include acc_id in the query key
    queryFn: () => (acc_id ? fetchUserDetail(acc_id) : Promise.resolve([])), // Fallback to empty array if acc_id is undefined
  });

  const { data: products, isLoading: productLoading } = useQuery<Product[]>({
    queryKey: ["products", acc_id], // Include acc_id in the query key
    queryFn: () => (acc_id ? fetchProducts(acc_id) : Promise.resolve([])), // Fallback to empty array if acc_id is undefined
  });

  const { data: collections, isLoading: collectionLoading } = useQuery<
    Product[]
  >({
    queryKey: ["collections", acc_id], // Include acc_id in the query key
    queryFn: () => (acc_id ? fetchCollection(acc_id) : Promise.resolve([])), // Fallback to empty array if acc_id is undefined
  });

  const { data: productCount } = useQuery({
    queryKey: ["productCount", acc_id],
    queryFn: async () => {
      if (!userDetail) return null;
      const { count, error } = await supabase
        .from("products")
        .select("id", { count: "exact" })
        .eq("user_id", acc_id);
      if (error) throw new Error(error.message);
      return count;
    },
    enabled: !!userDetail,
  });

  const { data: availableProductCount } = useQuery({
    queryKey: ["availableProductCount", acc_id],
    queryFn: async () => {
      if (!userDetail) return null;
      const { count, error } = await supabase
        .from("products")
        .select("id", { count: "exact" })
        .eq("user_id", acc_id)
        .eq("status", "available");
      if (error) throw new Error(error.message);
      return count;
    },
    enabled: !!userDetail,
  });

  const { data: ratingCount } = useQuery({
    queryKey: ["ratingCount", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("reviews")
        .select("rating") // Select rating column
        .eq("acc_id", user?.id);

      if (error) {
        console.error("Error fetching total rating sum:", error);
        return 0;
      }

      // Use reduce() to sum the ratings
      const totalSum = data.reduce(
        (sum, review) => sum + (review.rating || 0),
        0
      );

      return totalSum;
    },
  });

  const { data: successRate } = useQuery({
    queryKey: ["successRate", user?.id],
    queryFn: async () => {
      if (!user) return null;
      // Count all orders for the user
      const { count: totalOrders, error: totalError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);

      if (totalError) {
        console.error("Error fetching total orders:", totalError);
        return 0;
      }

      if (totalOrders === 0) return 0; // Avoid division by zero
      const total = totalOrders ?? 0;

      // Count only completed orders
      const { count: completedOrders, error: completedError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .eq("order_status", "Completed");

      if (completedError) {
        console.error("Error fetching completed orders:", completedError);
        return 0;
      }
      const completed = completedOrders ?? 0;

      // Calculate success rate
      const successRate = (completed / total) * 100;

      return successRate;
    },
  });

  return (
    <div>
      <Navbar />
      {user ? (
        <section className="p-3 md:px-24 md:py-12">
          {userDetailLoading ? (
            ""
          ) : (
            <div>
              <ProfileCard
                name={userDetail.name}
                email={userDetail.email}
                phone={userDetail.phone}
                avatarUrl={userDetail.image_url}
                all={productCount ?? 0}
                swap={availableProductCount ?? 0}
                successRate={successRate ?? 0}
                review={ratingCount ?? 0}
              />
              <div className="bg-gray-100 rounded-2xl shadow-md flex  justify-between gap-4 mt-3">
                <UpdateUserSection />
              </div>
            </div>
          )}
          <div className="mt-3 md:mt-6">
            {collectionLoading ? (
              ""
            ) : (
              <CollectionList
                title="Collection"
                collections={collections || []}
              />
            )}
          </div>
          <div className="mt-3 md:mt-6">
            {productLoading ? (
              <div>
                <Loading />
              </div>
            ) : (
              <ProductList title="Swapping" products={products || []} />
            )}
          </div>
          <div>
            <Feedback />
          </div>
        </section>
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

type ProfileCardProps = {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  all: number;
  swap: number;
  successRate: number; // as percentage e.g., 90
  review: number;
};

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  email,
  phone,
  avatarUrl,
  all,
  swap,
  successRate,
  review,
}) => {
  return (
    <div className="bg-gray-100 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Left: Profile Info */}
      <div className="flex items-start md:items-center gap-4 w-full md:w-auto">
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <div className="flex items-center gap-1 flex-wrap">
            <h2 className="text-sm font-semibold text-gray-900">{name}</h2>
            <svg
              className="w-4 h-4 text-purple-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm5.707 9.293l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L11 13.586l5.293-5.293a1 1 0 011.414 1.414z" />
            </svg>
          </div>
          <p className="text-xs text-gray-600 ">{email}</p>
          <p className="text-sm text-gray-600">{phone}</p>
        </div>
      </div>

      {/* Right: Stats */}
      <div className="flex flex-wrap justify-between gap-6 md:gap-8 w-full md:w-auto text-center">
        <div className="flex-1 min-w-[80px]">
          <p className="text-2xl text-gray-500 font-medium">{all}</p>
          <p className="text-sm font-medium text-gray-700">All</p>
        </div>
        <div className="flex-1 min-w-[80px]">
          <p className="text-2xl text-gray-500 font-medium">{swap}</p>
          <p className="text-sm font-medium text-gray-700">Swap</p>
        </div>
        <div className="flex-1 min-w-[80px]">
          <p className="text-2xl text-gray-500 font-medium">
            {Math.round(successRate)}%
          </p>
          <p className="text-sm font-medium text-gray-700">Success </p>
        </div>
        <div className="flex-1 min-w-[80px]">
          <p className="text-2xl text-gray-500 font-medium">{review}</p>
          <p className="text-sm font-medium text-gray-700">Review</p>
        </div>
      </div>
    </div>
  );
};
