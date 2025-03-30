import { Link } from "react-router-dom";
import { Button } from "./button";
import Description from "./Description";
import Heading from "./Heading";

export default function Carousel() {
  return (
    <div className="bg-[#F2F0F1] flex flex-wrap justify-center items-center gap-16  ">
      <div className="flex flex-col gap-6 p-9">
        <Heading
          text="Find Products That Matches Your Style"
          className="text-black w-full md:w-[440px] uppercase"
        />
        <Description
          className="text-gray-600 mt-3 w-full md:max-w-96"
          text="Users can purchase goods using a unique point-based system, where 1 dollar is equivalent to 100 EcoCoins."
        />
        <Link
          to={`products/shop`}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Button className="greenBgColor rounded-full mt-3 px-9 text-xs w-36">
            Shop Now
          </Button>
        </Link>
        <div className="flex py-6 gap-9 flex-wrap">
          <Stat number="200" label="Brands" />
          <Stat number="2,000" label="Secondhand Products" />
          <Stat number="10,000" label="Happy Customers" />
        </div>
      </div>
      <img
        src="https://vetazi.com/wp-content/uploads/2024/01/trendy-fashionable-couple-posingss-about-683x1024.webp"
        alt="img"
        className=" object-cover lg:h-[600px] "
      />
    </div>
  );
}

interface StatProps {
  number: string;
  label: string;
}

function Stat({ number, label }: StatProps) {
  return (
    <div className="text-center flex flex-col justify-start items-start ">
      <p className="text-2xl font-bold">{number}+</p>
      <p className="text-gray-500 ">{label}</p>
    </div>
  );
}
