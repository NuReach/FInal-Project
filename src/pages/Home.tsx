import { useQuery } from "@tanstack/react-query";
import supabase from "../supabaseClient";
import { z } from "zod";
import Navbar from "../components/ui/Navbar";
import Carousel from "../components/ui/Carousel";
import { NewItemSection } from "../components/ui/NewItemSection";
import { TopSwappingSection } from "../components/ui/TopSwappingSection";
import CategorySection from "../components/ui/CategorySection";
import Footer from "../components/ui/Footer";

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
  const { data: courses } = useQuery<z.infer<typeof courseSchema>[]>({
    queryKey: ["courses"], // Unique key for caching
    queryFn: fetchCourses, // Query function to fetch data
  });
  console.log(courses);

  return (
    <div>
      <Navbar />
      <Carousel />
      <NewItemSection />
      <TopSwappingSection />
      <CategorySection />
      <Footer />
    </div>
  );
}

export default Home;
