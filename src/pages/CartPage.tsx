import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import Heading from "../components/ui/Heading";
import { Link } from "react-router-dom";
import useAuth from "../service/useAuth";
import { Button } from "../components/ui/button";

const cartItems = [
  {
    id: 1,
    name: "One Life Graphic T Shirt",
    size: "Large",
    color: "White",
    price: 145,
    image:
      "https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg", // Replace with actual image path
  },
  {
    id: 2,
    name: "Checkered Shirt",
    size: "Medium",
    color: "Red",
    price: 180,
    image:
      "https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg",
  },
  {
    id: 3,
    name: "Skinny Fit Jeans",
    size: "Large",
    color: "Blue",
    price: 240,
    image:
      "https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg",
  },
];

const Cardpage = () => {
  const { data } = useAuth();
  const user = data?.user;
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const discount = Math.floor(subtotal * 0.2);
  const deliveryFee = 20;
  const total = subtotal - discount + deliveryFee;
  console.log(total);

  return (
    <div>
      <Navbar />
      {user ? (
        <section className="flex justify-center ">
          <div>
            <Heading className="text-black py-6" text="Your Cart" />
            <div className="flex flex-col md:flex-row gap-8 justify-center p-3 xl:w-[1200px]">
              {/* Cart Items */}
              <div className=" w-full  bg-white p-3 md:p-6 border rounded-lg">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b py-4 text-xs md:text-lg"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded"
                      />
                      <div>
                        <p className="font-semibold line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Size: {item.size}
                        </p>
                        <p className="text-sm text-gray-600">
                          Color: {item.color}
                        </p>
                        <p className="text-sm text-gray-600">
                          User: {item.color}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-4">
                        <p className="font-semibold">{item.price} coins</p>
                      </div>
                      <button className="text-xs px-1 w-full bg-black text-white rounded-lg py-2 mt-3">
                        Check Out
                      </button>
                      <button className="text-xs px-1 w-full bg-red-600 text-white rounded-lg py-2 mt-3">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
};

export default Cardpage;
