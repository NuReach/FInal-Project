import { Trash2 } from "lucide-react";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import Heading from "../components/ui/Heading";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Cart, CartItem, phnomPenhDistricts } from "../Schema";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import useAuth from "../service/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Loading from "../components/ui/Loading";

const shippingFormSchema = z.object({
  fullname: z.string().min(1, "Fullname is required"),
  address: z.string().min(1, "Address is required"),
  location: z.string().min(1, "Address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  note: z.string().optional(),
});

const CheckoutPage = () => {
  const { data: auth } = useAuth();
  const location = useLocation();
  const { group } = location.state || {};

  const [couponInput, setCouponInput] = useState("");
  const [couponId, setCouponId] = useState("");
  const [discount, setDiscount] = useState<number | null>(0);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  console.log(error);

  const { data: balance, isLoading: balanceLoading } = useQuery({
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

  const form = useForm({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      fullname: "",
      address: "",
      location: "",
      phoneNumber: "",
      note: "",
    },
  });

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const checkCoupon = async () => {
        if (!couponInput) {
          setDiscount(null);
          setError("");
          return;
        }

        const { data, error } = await supabase
          .from("coupons")
          .select(`*`)
          .eq("name", couponInput)
          .single();

        if (error || !data) {
          setDiscount(null);
          setError("Invalid coupon or not found");
        } else {
          setDiscount(data.discount);
          setCouponId(data.id);
          setError("");
        }
      };

      checkCoupon();
    }, 800);

    return () => clearTimeout(delayDebounce);
  }, [couponInput]);

  const { mutateAsync: submitCheckOutMutation, isPending: checkOutLoading } =
    useMutation({
      mutationFn: async ({
        values,
        group,
        discount,
      }: {
        values: z.infer<typeof shippingFormSchema>;
        group: Cart;
        discount: number;
      }) => {
        if (!group) throw new Error("Cart group not found.");
        if (typeof group?.total !== "number")
          throw new Error("Cart total is invalid");
        if (typeof discount !== "number")
          throw new Error("Discount is invalid");

        if (!balance) {
          throw new Error("Balance is still loading. Please wait.");
        }

        const userBalance = Number(balance?.balance ?? 0);
        const orderTotal = group.total - (group.total * (discount ?? 0)) / 100;

        if (userBalance < orderTotal || !userBalance)
          throw new Error(
            `Insufficient balance. Your balance is ${userBalance}`
          );

        console.log(discount, couponId);

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert([
            {
              user_id: auth?.user?.id,
              seller_id: group.seller_id,
              order_date: new Date().toISOString(),
              total_amount: group.total,
              discount: discount,
              coupon_id: couponId || null,

              shipping_address:
                values.fullname +
                " - " +
                values.location +
                " - " +
                values.phoneNumber,
              address: values.address,
              location: values.location,
              note: values.note,
              payment_status: "Completed",
              order_status: "pending",
            },
          ])
          .select()
          .single();

        if (orderError || !order) throw new Error("Failed to create order");

        // Create Order Items
        const orderItems = group.cartItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          discount: item.products.discount,
          price: item.products.price,
        }));

        const { error: orderItemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (orderItemsError) throw new Error("Failed to insert order items");

        // Deduct Balance
        const { error: balanceError } = await supabase
          .from("wallets")
          .update({ balance: userBalance - orderTotal })
          .eq("user_id", auth?.user?.id);

        if (balanceError) throw new Error("Failed to update balance");

        for (const item of group.cartItems) {
          // Delete the cart item
          const { data: deleteData, error: deleteError } = await supabase
            .from("cart_items")
            .delete()
            .eq("id", item.id); // Delete by cart item ID
          console.log(deleteData);

          if (deleteError) {
            throw deleteError;
          }
        }

        return order;
      },

      onSuccess: () => {
        toast.success("Order placed successfully!");
        navigate(`/`);
        queryClient.invalidateQueries({
          queryKey: [
            "cart_items",
            "products",
            "cart_item_count",
            "user-balance",
          ],
        });
        // Optionally: clear cart or navigate
      },

      onError: (error) => {
        toast.error(error.message || "Something went wrong.");
      },
    });

  async function onSubmit(values: z.infer<typeof shippingFormSchema>) {
    if (!group) return toast.error("Cart group not found.");
    await submitCheckOutMutation({
      values,
      group,
      discount: discount ?? 0,
    });
  }

  return (
    <div>
      <Navbar />
      {auth?.user ? (
        balanceLoading ? (
          <Loading />
        ) : (
          <section className="flex justify-center ">
            <div>
              <Heading className="text-black py-6" text="Checkout" />
              <div className="flex flex-col md:flex-row gap-8 justify-cente p-3 xl:w-[1200px]">
                <div className="rounded-lg w-full border h-fit">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6 p-3 md:p-6 "
                      id="shipping-form"
                    >
                      {/* Fullname */}
                      <FormField
                        control={form.control}
                        name="fullname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fullname</FormLabel>
                            <FormControl>
                              <Input
                                className="text-xs"
                                placeholder="Enter your full name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Address */}
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Address" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {phnomPenhDistricts.map((item, i) => (
                                  <SelectItem key={i} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input
                                className="text-xs"
                                placeholder="Ex St468 Limkokwing University"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Phone Number */}
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                className="text-xs"
                                placeholder="Enter your phone number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Note (Optional) */}
                      <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Note (optional)</FormLabel>
                            <FormControl>
                              <Input
                                className="text-xs"
                                placeholder="Any additional note"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </div>
                <div className="w-full bg-white p-3 md:p-9 border rounded-lg text-xs md:text-lg">
                  <p>Seller : {group.seller_name}</p>
                  <div className=" ">
                    {group.cartItems.map((item: CartItem) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between border-b py-4 text-xs md:text-lg"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={item.products.image_url}
                            alt={item.products.id}
                            className="w-16 h-16 rounded"
                          />
                          <div>
                            <p className="font-semibold line-clamp-1">
                              {item.products.name}
                            </p>

                            <p className="text-sm text-gray-600">
                              Discount: {item.products.discount}
                            </p>
                            <p className="text-sm text-gray-600">
                              Brand: {item.products.brand}
                            </p>
                            <p className="text-sm text-gray-600">
                              Category: {item.products.category}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-semibold">
                            {item.products.price} coins
                          </p>
                          <button className="text-red-500 hover:text-red-700">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-6">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span className="font-semibold">{group.total} coins</span>
                    </div>
                    <div className="mt-24">
                      <Input
                        className="text-xs "
                        placeholder="Apply Coupon"
                        onChange={(e) => setCouponInput(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>
                        Discount{" "}
                        {discount && discount > 0 ? `(-${discount}%)` : `(-0%)`}
                      </span>
                      <span className="font-semibold">
                        {discount && discount > 0
                          ? `-${(group.total * discount) / 100}`
                          : -0}{" "}
                        coins
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>
                        {discount && discount > 0
                          ? group.total - (group.total * discount) / 100
                          : group.total}{" "}
                        coins
                      </span>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    form="shipping-form" // ← This links the button to the form
                    className="w-full  text-sm bg-[#A8BBA3] my-3"
                    disabled={checkOutLoading}
                  >
                    {checkOutLoading ? "Paying..." : "Pay Now"}
                  </Button>
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

export default CheckoutPage;
