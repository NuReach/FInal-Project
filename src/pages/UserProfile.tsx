import { Link } from "react-router-dom";
import { CollectionList } from "../components/ui/CollectionList";
import Feedback from "../components/ui/Feedback";
import Footer from "../components/ui/Footer";
import Heading from "../components/ui/Heading";
import Navbar from "../components/ui/Navbar";
import { ProductList } from "../components/ui/ProductList";
import { Collection, Product } from "../Schema";
import useAuth from "../service/useAuth";
import { Button } from "../components/ui/button";

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

export default function UserProfile() {
  const { data } = useAuth();
  const user = data?.user;
  return (
    <div>
      <Navbar />
      {user ? (
        <section className="p-3 md:px-24 md:py-12">
          <ProfileCard
            name="Hong Nnureach"
            email="hongnnureach@gmail.com"
            phone="078441752"
            avatarUrl="https://cdn-icons-png.flaticon.com/512/921/921347.png"
            all={10}
            swap={10}
            successRate={90}
            review={30}
          />
          <div className="mt-3 md:mt-6">
            <CollectionList title="Collection" collections={collections} />
          </div>
          <div className="mt-3 md:mt-6">
            <ProductList title="Swapping" products={products} />
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
          <p className="text-2xl text-gray-500 font-medium">{successRate}%</p>
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
