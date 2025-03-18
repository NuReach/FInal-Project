import { useQuery } from "@tanstack/react-query";
import supabase from "../supabaseClient";
import { z } from "zod";
import Navbar from "../components/ui/Navbar";
import Carousel from "../components/ui/Carousel";
import CategorySection from "../components/ui/CategorySection";
import Footer from "../components/ui/Footer";
import { ProductList } from "../components/ui/ProductList";
import { Product } from "../Schema";
import useAuth from "../service/useAuth";

const courseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional(),
  price: z.number(),
  created_at: z.string(),
});

console.log(courseSchema);

const fetchCourses = async () => {
  const { data, error } = await supabase
    .from("assets") // Replace 'users' with your table name
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

function Home() {
  const { data, isLoading } = useAuth();
  console.log(data, isLoading);

  const { data: courses } = useQuery<z.infer<typeof courseSchema>[]>({
    queryKey: ["courses"], // Unique key for caching
    queryFn: fetchCourses, // Query function to fetch data
  });
  console.log(courses);

  return (
    <div>
      <Navbar />
      <Carousel />
      <section className="p-3 md:px-24 md:py-12">
        <div className="mt-3 md:mt-6">
          <ProductList title="TopSwaping" products={products} />
        </div>
        <div className="mt-3 md:mt-6">
          <ProductList title="Swapping" products={products} />
        </div>
      </section>
      <CategorySection />
      <Footer />
    </div>
  );
}

export default Home;

const products: Product[] = [
  {
    id: "1",
    name: "T-shirt with Tape Details",
    description: "Lorem de la leru monte sha fork",
    price: 120,
    imageUrl:
      "https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg",
  },
  {
    id: "2",
    name: "Skinny Fit Jeans",
    description: "Lorem de la leru monte sha fork",
    price: 240,
    originalPrice: 260,
    discountPercentage: 30,
    imageUrl:
      "https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg",
  },
  {
    id: "3",
    name: "Checkered Shirt",
    description: "Lorem de la leru monte sha fork",
    price: 180,
    imageUrl:
      "https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg",
  },
  {
    id: "4",
    name: "Sleeve Striped T-shirt",
    description: "Lorem de la leru monte sha fork",
    price: 130,
    originalPrice: 200,
    discountPercentage: 30,
    imageUrl:
      "https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg",
  },
];
