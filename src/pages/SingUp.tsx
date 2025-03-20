import Description from "../components/ui/Description";
import Heading from "../components/ui/Heading";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import Heading2 from "../components/ui/Heading2";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import supabase from "../supabaseClient";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { phnomPenhDistricts } from "../Schema";

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(8, "Invalid phone number"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    image: z.any().refine((file) => file?.length > 0, {
      message: "Image is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SignUpPage() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      email: "",
      password: "",
      confirmPassword: "",
      image: null,
    },
  });

  const navigate = useNavigate();

  const { mutateAsync: signUpMutation, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Signup user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;
      const user = data?.user;
      if (!user) throw new Error("User signup failed");
      const { error: walletError } = await supabase.from("wallets").insert([
        {
          user_id: user?.id, // Link the wallet to the user
          balance: 0, // Set the initial balance to 0 or any value you want
        },
      ]);

      if (walletError) {
        throw new Error(walletError.message); // Throw error if wallet insertion fails
      }

      // Upload image to Supabase Storage
      let imageUrl = "";
      if (values.image && values.image.length > 0) {
        const file = values.image[0];
        const filePath = `profiles/${user.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars") // Ensure the bucket name is correct
          .upload(filePath, file);

        if (uploadError) throw new Error("Image upload failed");

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl || "";
      }

      // Insert user details into user_roles table
      const { error: roleError } = await supabase.from("user_roles").insert([
        {
          user_id: user.id,
          role: "user",
          name: values.name,
          phone: values.phone,
          address: values.address,
          image_url: imageUrl, // Store image URL
        },
      ]);

      if (roleError) throw new Error(roleError.message);

      return { user };
    },
    onSuccess: () => {
      navigate(`/signin`);
      toast.success("You registered successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong! Please try again.");
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await signUpMutation(values);
  }

  return (
    <div className="flex ">
      <div className="hidden lg:flex flex-col greenBgColor justify-center items-start px-24 w-full ">
        <Heading text="Ecoswap" />
        <Description
          text="FIND PRODUCTS THAT MATCHES YOUR STYLE
Users can purchase goods using a unique point-based system, where 1 dollar is equivalent to 10 EcoCoins."
        />
      </div>
      <div className="w-[800px] flex flex-col justify-between">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-12"
          >
            <Heading2 text="Please Register !" />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      className="text-xs"
                      placeholder="Enter your name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
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
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      className="text-xs"
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      className="text-xs"
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      className="text-xs"
                      type="password"
                      placeholder="Confirm your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              disabled={isPending}
              type="submit"
              className="w-full blueBgColor text-sm"
            >
              Sign Up
            </Button>

            <div className="text-xs flex gap-3">
              <p>Already have an account?</p>
              <Link className="blueColor" to={`/signin`}>
                Sign in now
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
