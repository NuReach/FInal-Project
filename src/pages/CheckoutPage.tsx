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

const shippingFormSchema = z.object({
  fullname: z.string().min(1, "Fullname is required"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  note: z.string().optional(),
});

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

const CheckoutPage = () => {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const discount = Math.floor(subtotal * 0.2);
  const deliveryFee = 20;
  const total = subtotal - discount + deliveryFee;
  const form = useForm({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      fullname: "",
      address: "",
      phoneNumber: "",
      note: "",
    },
  });
  function onSubmit(values: z.infer<typeof shippingFormSchema>) {
    console.log(values);
  }

  return (
    <div>
      <Navbar />
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
                        <FormControl>
                          <Input
                            className="text-xs"
                            placeholder="Enter your address"
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
              <div className=" ">
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
              <Button
                type="submit"
                form="shipping-form" // ← This links the button to the form
                className="w-full  text-sm bg-[#A8BBA3] my-3"
              >
                Pay Now
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
