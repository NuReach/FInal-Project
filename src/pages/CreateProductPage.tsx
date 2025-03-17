import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { productCreateSchema } from "../Schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import supabase from "../supabaseClient";
import useAuth from "../service/useAuth";
import { useNavigate } from "react-router-dom";

export default function CreateProductPage() {
  const { data: auth } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [subImagePreviews, setSubImagePreviews] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof productCreateSchema>>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      name: "",
      price: 1,
      discount: 0,
      status: "Available",
      description: "",
      category: "",
      stock: 0,
      image_url: undefined,
      condition: 0,
      brand: "",
      usage: "",
      other_message: "",
    },
  });

  const uploadImage = async (file: File | string) => {
    if (typeof file === "string") {
      return file; // If it's already a URL, return it
    }

    const fileName = `${Date.now()}-${file.name}`; // Generate unique filename
    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) throw error;

    // Correctly access publicUrl from the data object
    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);
    return data.publicUrl; // Access the publicUrl from data
  };

  const uploadImages = async (productId: string, images: (File | string)[]) => {
    return Promise.all(
      images.map(async (image) => {
        const imageUrl = await uploadImage(image);
        const { error } = await supabase
          .from("product_images")
          .insert([{ product_id: productId, image_url: imageUrl }]);
        if (error) throw error;
      })
    );
  };

  const { mutateAsync: createProductMutation, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof productCreateSchema>) => {
      const mainImageUrl = values.image_url
        ? await uploadImage(values.image_url)
        : null;
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            user_id: auth?.user?.id,
            name: values.name,
            price: values.price,
            discount: values.discount,
            status: values.status,
            description: values.description,
            category: values.category,
            stock: values.stock,
            condition: values.condition,
            brand: values.brand,
            usage: values.usage,
            other_message: values.other_message,
            image_url: mainImageUrl,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (values.sub_images && values.sub_images.length > 0) {
        await uploadImages(data.id, values.sub_images);
      }

      return data;
    },
    onSuccess: () => {
      form.reset();
      setImagePreview(null);
      setSubImagePreviews([]);
      toast.success("Product created successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
      navigate(`/dashboard/products`);
    },
    onError: (error: Error) => {
      console.error("Error creating product:", error.message);
      toast.error(error.message || "Something went wrong! Please try again.");
    },
  });

  const onSubmit = async (values: z.infer<typeof productCreateSchema>) => {
    await createProductMutation(values);
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Create Product</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (Coins)</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        min={1}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        min={0}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      <SelectItem value="Discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Electronics, Fashion..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <input
                      min={1}
                      type="number"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition (%)</FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      min={0}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Apple, Samsung..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="usage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usage Info</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Used for 6 months" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="other_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or special conditions..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImagePreview(URL.createObjectURL(file));
                            field.onChange(file);
                          }
                        }}
                      />
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Selected Preview"
                          className="mt-4 w-full max-w-xs rounded border"
                        />
                      )}
                    </>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3">
              {subImagePreviews.map((preview, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`sub_images.${index}` as `sub_images.${number}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub Image {index + 1}</FormLabel>
                      <FormControl>
                        <>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const updatedPreviews = [...subImagePreviews];
                                updatedPreviews[index] =
                                  URL.createObjectURL(file);
                                setSubImagePreviews(updatedPreviews);
                                field.onChange(file);
                              }
                            }}
                          />
                          {preview && (
                            <img
                              src={preview}
                              alt={`Sub Image ${index + 1} Preview`}
                              className="mt-4 w-full max-w-xs rounded border"
                            />
                          )}
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <Button disabled={isPending} type="submit">
              Create Product
            </Button>
          </form>
        </Form>
      </div>
      <Footer />
    </div>
  );
}
