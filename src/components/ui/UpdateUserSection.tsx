import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import Heading2 from "./Heading2";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { phnomPenhDistricts } from "../../Schema"; // Address options
import { Button } from "./button";
import useAuth from "../../service/useAuth";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../../supabaseClient";
import { toast } from "react-toastify";

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(6, "Invalid phone number"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    email: z.string().email("Invalid email address"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
    oldPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
    confirmPassword: z.string().optional(),
    image: z.any().optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function UpdateUserSection() {
  const { data: auth } = useAuth();
  const user = auth?.user;
  const { acc_id } = useParams();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: user_roles } = useQuery({
    queryKey: ["user_roles", auth?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", auth?.user?.id)
        .single();
      return data;
    },
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: user_roles || {},
  });

  useEffect(() => {
    if (user_roles) {
      setImagePreview(user_roles.image_url || null);
      form.reset({
        name: user_roles.name || "",
        phone: user_roles.phone || "",
        address: user_roles.address || "",
        email: user_roles.email || "",
        image_url: user_roles.image_url || "",
      });
    }
  }, [user_roles, form]);

  const { mutateAsync: updateUserMutation, isPending: updateUserPending } =
    useMutation({
      mutationFn: async (values: z.infer<typeof formSchema>) => {
        let imageUrl = user_roles.image_url;

        // Handle image upload if a new image is provided
        if (values.image) {
          const file = values.image;

          if (!(file instanceof File)) {
            console.error("Invalid file type:", file);
            throw new Error("Selected file is not valid");
          }

          const filePath = `profiles/${user?.id}/${file.name}`;
          console.log("filepath", filePath);

          // Upload image with upsert (overwrite if exists)
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file, { upsert: true });

          if (uploadError) {
            console.error("Image upload failed:", uploadError.message);
            throw new Error("Image upload failed");
          }

          // Get new public URL
          const { data } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);
          imageUrl = data.publicUrl || "";
          console.log("New image URL:", imageUrl);
        }

        // If newPassword is provided, verify oldPassword first
        if (values.newPassword) {
          if (!values.oldPassword) {
            throw new Error("Old password is required to change password");
          }

          // Re-authenticate the user
          const { data: authData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email: user_roles.email,
              password: values.oldPassword,
            });

          console.log(authData);

          if (signInError) {
            console.error(
              "Old password verification failed:",
              signInError.message
            );
            throw new Error("Incorrect old password");
          }

          // If authentication is successful, update the password
          const { error: updatePasswordError } = await supabase.auth.updateUser(
            {
              password: values.newPassword,
            }
          );

          if (updatePasswordError) {
            console.error(
              "Password update failed:",
              updatePasswordError.message
            );
            throw new Error(updatePasswordError.message);
          }

          console.log("Password updated successfully");
        }

        // Update user data in Supabase
        const { data, error } = await supabase
          .from("user_roles")
          .update({
            name: values.name,
            address: values.address,
            phone: values.phone,
            email: values.email,
            image_url: imageUrl, // Always update image_url
          })
          .eq("user_id", user?.id);

        if (error) {
          console.error("Update failed:", error.message);
          throw new Error("Profile update failed");
        }

        console.log("User updated:", data);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["user_roles", "userDetail"],
        });
        toast.success("Profile updated successfully");
      },
      onError: (err) => {
        console.error("Error updating user:", err);
        toast.error(err.message || "Error updating profile");
      },
    });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      form.setValue("image", file);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await updateUserMutation(values);
  };

  return (
    <>
      {acc_id == user?.id && (
        <div className="w-full flex flex-col justify-between">
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-3 md:p-9"
            >
              <Heading2 text="Update Profile" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Name */}
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

                {/* Phone */}
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

                {/* Address (Dropdown) */}
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
                            <SelectValue placeholder={field.value} />
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

                {/* Email */}
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
                          disabled
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div></div>
                <div></div>
                <FormField
                  control={form.control}
                  name="oldPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Old Password</FormLabel>
                      <FormControl>
                        <Input
                          className="text-xs"
                          type="password"
                          placeholder="********"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          className="text-xs"
                          type="password"
                          placeholder="********"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
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
                          placeholder="********"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Image Upload & Preview */}
              <div className="flex flex-col gap-2">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="w-24 h-24 object-cover rounded-md"
                  />
                )}
                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem>
                      <FormLabel>Profile Image</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="w-fit"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                disabled={updateUserPending}
                type="submit"
                className="text-sm"
              >
                Update Profile
              </Button>
            </form>
          </FormProvider>
        </div>
      )}
    </>
  );
}
