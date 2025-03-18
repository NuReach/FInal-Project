import { CollectionList } from "../components/ui/CollectionList";
import Footer from "../components/ui/Footer";
import { HistorySection } from "../components/ui/HistorySection";
import Navbar from "../components/ui/Navbar";
import { ProductList } from "../components/ui/ProductList";
import StatsSection from "../components/ui/StatCard";
import { TransactionSection } from "../components/ui/Transaction";
import { Collection, Product } from "../Schema";

export default function DashboardPage() {
  return (
    <div>
      <Navbar />
      <section className="p-3 md:px-24 md:py-12">
        <StatsSection />
        <HistorySection />
        <TransactionSection />
        <div className="mt-3 md:mt-6">
          <CollectionList title="Collection" collections={collections} />
        </div>
        <div className="mt-3 md:mt-6">
          <ProductList title="Swapping" products={products} />
        </div>
      </section>
      <Footer />
    </div>
  );
}

const collections: Collection[] = [
  {
    id: "1",
    name: "T-shirt with Tape Details",
    description: "Lorem de la leru monte sha fork",
    category: "Y2K",
    imageUrl:
      "https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg",
  },
  {
    id: "2",
    name: "Skinny Fit Jeans",
    description: "Lorem de la leru monte sha fork",
    category: "Y2K",
    imageUrl:
      "https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg",
  },
  {
    id: "3",
    name: "Checkered Shirt",
    description: "Lorem de la leru monte sha fork",
    category: "Y2K",
    imageUrl:
      "https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg",
  },
  {
    id: "4",
    name: "Sleeve Striped T-shirt",
    description: "Lorem de la leru monte sha fork",
    category: "Y2K",
    imageUrl:
      "https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg",
  },
];

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
