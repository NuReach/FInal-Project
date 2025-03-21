import { useState } from "react";
import { Link } from "react-router-dom";
import Heading2 from "./Heading2";
import { Button } from "./button";
import useAuth from "../../service/useAuth";
import useSignOut from "../../service/useSignOut";
import supabase from "../../supabaseClient";
import { useQuery } from "@tanstack/react-query";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: auth } = useAuth();

  const { mutateAsync: signOutMutation } = useSignOut();

  const { data: balance } = useQuery({
    queryKey: ["user-balance", auth?.user?.id],
    queryFn: async () => {
      const { data: coins } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", auth?.user?.id)
        .single();
      return coins;
    },
  });
  const handleSignOut = async () => {
    await signOutMutation();
  };

  return (
    <nav className="w-full bg-white shadow">
      {/* Desktop Navbar */}
      <div className="hidden md:flex justify-between p-3 items-center px-6 lg:px-24">
        <Link to={`/`}>
          <Heading2 text="Ecoswap" />
        </Link>
        <div className="flex gap-3">
          <button>Shop</button>
          <button>Quick Buy</button>
          <button>New Arrival</button>
          <button>Category</button>
        </div>
        <div className="flex bg-gray-100 gap-3 text-xs w-96 items-center p-3 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            className="hover:cursor-pointer"
          >
            <path
              fill="currentColor"
              d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"
            />
          </svg>
          <input
            type="text"
            placeholder="Search for product..."
            className="bg-transparent outline-none w-full text-gray-700"
          />
        </div>
        <div className="flex gap-3">
          <Link to={`/cart`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="cursor-pointer"
            >
              <path
                fill="currentColor"
                d="M5.525 21q-.675 0-1.2-.413T3.6 19.525l-2.55-9.25Q.925 9.8 1.213 9.4T2 9h4.75l4.4-6.55q.125-.2.35-.325T11.975 2t.475.125t.35.325L17.2 9H22q.5 0 .788.4t.162.875l-2.55 9.25q-.2.65-.725 1.063t-1.2.412zM12 17q.825 0 1.413-.587T14 15t-.587-1.412T12 13t-1.412.588T10 15t.588 1.413T12 17M9.175 9H14.8l-2.825-4.2z"
              />
            </svg>
          </Link>
          <Link to={`/user/profile/${auth?.user?.id}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="cursor-pointer"
            >
              <path
                fill="currentColor"
                d="M5.85 17.1q1.275-.975 2.85-1.537T12 15t3.3.563t2.85 1.537q.875-1.025 1.363-2.325T20 12q0-3.325-2.337-5.663T12 4T6.337 6.338T4 12q0 1.475.488 2.775T5.85 17.1M12 13q-1.475 0-2.488-1.012T8.5 9.5t1.013-2.488T12 6t2.488 1.013T15.5 9.5t-1.012 2.488T12 13m0 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"
              />
            </svg>
          </Link>
        </div>
        {auth?.user && (
          <Link to={`/add_coint`} className="flex gap-2">
            <p>{balance?.balance}</p>
            <p>Coins</p>
          </Link>
        )}
        {auth?.user ? (
          <div className="flex gap-3 items-center">
            <Link to={`/dashboard/${auth.user?.id}`} className="flex gap-2">
              <Button>Dashboard</Button>
            </Link>
            <div className="hover:cursor-pointer" onClick={handleSignOut}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M9 2h9c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H9c-1.1 0-2-.9-2-2v-2h2v2h9V4H9v2H7V4c0-1.1.9-2 2-2"
                />
                <path
                  fill="currentColor"
                  d="M10.09 15.59L11.5 17l5-5l-5-5l-1.41 1.41L12.67 11H3v2h9.67z"
                />
              </svg>
            </div>
          </div>
        ) : (
          <Link to={`/signin`} className="flex gap-2">
            <Button>Sign In</Button>
          </Link>
        )}
      </div>

      {/* Mobile Navbar */}
      <div className="flex md:hidden justify-between items-center p-4">
        <Link to="/">
          <Heading2 text="Ecoswap" />
        </Link>
        <div className="flex gap-3">
          {auth?.user && (
            <Link to={`/add_coint`} className="flex gap-2">
              <p>{balance?.balance}</p>
              <p>Coins</p>
            </Link>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-xl">
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-3 px-4 pb-4">
          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-100 p-2 rounded-lg text-sm"
          />
          <button>Shop</button>
          <button>Quick Buy</button>
          <button>New Arrival</button>
          <button>Category</button>
          <div className="flex flex-col justify-between gap-3 mt-3">
            <Link to={`/user/profile/${auth?.user?.id}`} className="flex gap-2">
              <Button className="w-full">Profile</Button>
            </Link>
            <Link to={`/cart`} className="flex gap-2">
              <Button className="w-full">Cart</Button>
            </Link>
            {auth?.user ? (
              <div className="flex gap-3 items-center flex-col">
                <Link
                  to={`/dashboard/${auth.user?.id}`}
                  className="flex gap-2 w-full "
                >
                  <Button className="w-full">Dashboard</Button>
                </Link>
                <div
                  className="hover:cursor-pointer w-full"
                  onClick={handleSignOut}
                >
                  <Button className="w-full">Logout</Button>
                </div>
              </div>
            ) : (
              <Link to={`/signin`} className="flex gap-2 w-full">
                <Button className="w-full">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
