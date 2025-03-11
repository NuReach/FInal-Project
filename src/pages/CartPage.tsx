import { Trash2 } from "lucide-react";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import Heading from "../components/ui/Heading";
import { Link } from "react-router-dom";

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
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const discount = Math.floor(subtotal * 0.2);
  const deliveryFee = 20;
  const total = subtotal - discount + deliveryFee;

  return (
    <div>
      <Navbar />
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
                      <p className="font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                      <p className="text-sm text-gray-600">
                        Color: {item.color}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">{item.price} coins</p>
                    <button className="text-red-500 hover:text-red-700">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="w-full bg-white p-6 border rounded-lg text-xs md:text-lg">
              <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">{subtotal} coins</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Discount (-20%)</span>
                  <span className="font-semibold">-{discount} coins</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">{deliveryFee} coins</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{total} coins</span>
                </div>
              </div>
              <Link to={`/checkout`}>
                <button className="mt-4 w-full bg-[#A8BBA3] text-white font-semibold py-2 rounded-lg  ">
                  Go to Checkout →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Cardpage;
