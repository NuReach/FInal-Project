import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import Heading from "../components/ui/Heading";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../service/useAuth";
import { Button } from "../components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabaseClient";
import { toast } from "react-toastify";
import { Cart } from "../Schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import Loading from "../components/ui/Loading";

const Cardpage = () => {
  const { data: auth, isLoading } = useAuth();
  const user = auth?.user;
  const user_id = user?.id;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: cart_items } = useQuery<Cart[]>({
    queryKey: ["cart_items", user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select(
          `
          *,
          products (
            *,
            product_images (image_url),
            user_roles(*)
          ),
          user_roles(*)
        `
        )
        .order("created_at", { ascending: false })
        .eq("user_id", user_id);

      if (error) throw error;
      if (!data) return [];

      const groupedCart = data.reduce((acc, item) => {
        const sellerId = item.products?.user_id || "Unknown Seller ID";
        const sellerName = item.products?.user_roles?.name || "Unknown Seller";
        const price =
          (item.products?.price * (100 - item.products.discount)) / 100 || 0;

        const groupKey = `${sellerId}__${sellerName}`;
        if (!acc[groupKey]) {
          acc[groupKey] = {
            seller_id: sellerId,
            seller_name: sellerName,
            cartItems: [],
            total: 0,
          };
        }

        acc[groupKey].cartItems.push(item);
        acc[groupKey].total += price;

        return acc;
      }, {} as Record<string, Cart>);
      return Object.values(groupedCart);
    },
  });

  console.log(cart_items);

  const handleCheckOut = async (group: Cart) => {
    console.log(group);
    navigate("/checkout", { state: { group } });
  };

  const handleDelete = async (group: Cart) => {
    try {
      // Loop through each cart item in the group
      for (const item of group.cartItems) {
        // Delete the cart item
        const { data: deleteData, error: deleteError } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", item.id); // Delete by cart item ID

        if (deleteError) {
          throw deleteError;
        }

        console.log(deleteData);

        // Fetch the current stock of the product
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();

        if (productError) {
          throw productError;
        }

        if (productData) {
          const updatedStock = productData.stock + item.quantity; // Increment stock by cart item quantity

          // Update the product stock
          const { error: updateError } = await supabase
            .from("products")
            .update({ stock: updatedStock })
            .eq("id", item.product_id);

          if (updateError) {
            throw updateError;
          }
        }
      }

      // Toast success notification
      toast.success("Cart items removed and stock updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["cart_items", "products", "cart_item_count"],
      });
      window.location.reload();
    } catch (error) {
      console.error("Error removing items:", error);

      // Toast error notification
      toast.error("An error occurred while removing cart items.");
    }
  };

  return (
    <div>
      <Navbar />
      {user ? (
        isLoading ? (
          <Loading />
        ) : (
          <section className="flex justify-center ">
            <div>
              <Heading className="text-black py-6" text="Your Cart" />
              <div className="flex flex-col md:flex-row gap-8 justify-center p-3 xl:w-[1200px]">
                {/* Cart Items */}
                <div className="w-full bg-white p-3 md:p-6 border rounded-lg">
                  {cart_items?.length == 0 ? (
                    <div>No Items</div>
                  ) : (
                    cart_items?.map((group) => (
                      <div
                        key={group?.seller_id}
                        className="mb-6 border rounded-lg p-4"
                      >
                        <h2 className="text-lg font-bold mb-2">
                          Seller: {group?.seller_name}
                        </h2>

                        {group?.cartItems?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between border-b py-4 text-xs md:text-lg"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={item.products?.image_url}
                                alt={item.products?.name}
                                className="w-16 h-16 rounded"
                              />
                              <div>
                                <p className="font-semibold line-clamp-1">
                                  {item.products?.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Price: {item.products?.price} coins
                                </p>
                                <p className="text-xs text-gray-600">
                                  Brand: {item.products?.brand}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Category: {item.products?.category}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              {item.products.discount > 0 && (
                                <p className="line-through">
                                  {item.products.price}
                                  {""}coins
                                </p>
                              )}
                              <p className="font-semibold">
                                {(item.products?.price *
                                  (100 - item.products.discount)) /
                                  100}{" "}
                                coins
                              </p>
                            </div>
                          </div>
                        ))}

                        <div className="flex flex-col justify-end w-full items-end font-semibold mt-4">
                          <div>Total: {group.total} coins</div>

                          <button
                            onClick={() => handleCheckOut(group)}
                            className="bg-black rounded-lg px-6 py-2 text-white text-xs w-36 mt-3"
                          >
                            Check Out
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger>
                              <button className="bg-red-600 rounded-lg px-6 py-2 text-white text-xs w-36 mt-1">
                                Remove
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently remove your cartitems and remove
                                  your data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 text-white"
                                  onClick={() => handleDelete(group)}
                                >
                                  Yes
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )
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
