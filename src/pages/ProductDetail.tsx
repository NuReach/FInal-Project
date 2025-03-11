import { Link } from "react-router-dom";
import Footer from "../components/ui/Footer";
import Navbar from "../components/ui/Navbar";
import { YouMightLikeSection } from "../components/ui/YouMightLike";

export default function ProductDetail() {
  return (
    <div>
      <Navbar />
      <div
        className="bg-white py-12
       px-[160px] flex flex-col flex-wrap md:flex-row gap-6"
      >
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex gap-4 md:flex-col  ">
            <img
              src="https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg"
              alt="Thumbnail 1"
              className=" w-full md:w-32 h-32 object-cover rounded-lg"
            />
            <img
              src="https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg"
              alt="Thumbnail 2"
              className=" w-full md:w-32 h-32 object-cover rounded-lg"
            />
            <img
              src="https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg"
              alt="Thumbnail 3"
              className=" w-full md:w-32 h-32 object-cover rounded-lg"
            />
          </div>
          <img
            src="https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg"
            alt="One Life Graphic T-shirt"
            className="w-96 h-auto rounded-lg object-cover"
          />
        </div>

        <div className="flex-1 w-96 mt-6 md:mt-3">
          <h2 className="text-2xl font-bold">One Life Graphic T-shirt</h2>
          <p className="text-lg font-semibold text-gray-700">260 coins</p>
          <p className="text-gray-600 mt-2">
            This graphic t-shirt which is perfect for any occasion. Crafted from
            a soft and breathable fabric, it offers superior comfort and style.
          </p>
          <div className="mt-4 border-t pt-4 text-gray-700">
            <p>
              <strong>Condition:</strong> 90%
            </p>
            <p>
              <strong>Brand:</strong> Zara
            </p>
            <p>
              <strong>Usage:</strong> 1 Person
            </p>
            <p>
              <strong>Other:</strong> Bought since 2021
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <img
              src="https://i.pinimg.com/736x/f0/0e/2a/f00e2afb62a18b52ee0bdf61ca251548.jpg"
              alt="User"
              className="w-10 h-10 rounded-full"
            />
            <Link to={`/user/profile/1`}>
              <div>
                <p className="font-semibold">
                  Hong Nnureach <span className="text-green-500">✔</span>
                </p>
                <p className="text-sm text-gray-500">
                  Check out more from this user
                </p>
              </div>
            </Link>
          </div>
          <button className="mt-6 bg-[#A8BBA3] text-white py-2 text-sm  px-12 rounded-full">
            Add to Cart
          </button>
        </div>
      </div>
      <YouMightLikeSection />
      <Footer />
    </div>
  );
}
