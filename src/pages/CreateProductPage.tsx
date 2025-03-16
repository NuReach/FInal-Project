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
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import supabase from "../supabaseClient";
import { error } from "console";

export default function CreateProductPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [subImagePreviews, setSubImagePreviews] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);

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
      image: undefined,
      subImages: [undefined, undefined, undefined],
      condition: 0,
      brand: "",
      usage: "",
      other_message: "",
    },
  });

  const { mutateAsync: createProductMutation, isPending } = useMutation({
    mutationFn: async ({
      name,
      price,
      discount,
      status,
      description,
      category,
      stock,
      condition,
      brand,
      usage,
      other_message,
      image,
      subImages,
    }: {
      name: string;
      price: number;
      discount: number;
      status: string;
      description?: string;
      category: string;
      stock: number;
      condition: number;
      brand: string;
      usage: string;
      other_message?: string;
      image: File;
      subImages: File[];
    }) => {
      if (!image || subImages.length !== 3) {
        toast.error("Main image and exactly 3 sub-images are required.");
        throw new Error("Image validation failed.");
      }

      const uploadedFilePaths: string[] = [];

      const uploadImage = async (file: File, path: string) => {
        const { data, error } = await supabase.storage
          .from("product-images") // Your Supabase bucket name
          .upload(path, file);

        if (error) throw new Error(`Failed to upload ${file.name}`);

        uploadedFilePaths.push(data.path); // Track uploaded files

        return supabase.storage.from("product-images").getPublicUrl(data.path)
          .data.publicUrl;
      };

      try {
        // Upload main image
        const mainImagePath = `products/${Date.now()}_${image.name}`;
        const mainImageUrl = await uploadImage(image, mainImagePath);

        // Upload sub-images
        const subImageUrls = await Promise.all(
          subImages.map((file, index) =>
            uploadImage(
              file,
              `products/${Date.now()}_sub_${index}_${file.name}`
            )
          )
        );

        // Insert product into database
        const { data, error: insertError } = await supabase
          .from("products")
          .insert({
            name,
            price,
            discount,
            status,
            description,
            category,
            stock,
            condition,
            brand,
            usage,
            other_message,
            image_url: mainImageUrl,
            sub_images: subImageUrls, // Save array of sub-image URLs
          });

        console.log(error);

        if (insertError) throw new Error("Failed to create product.");

        return data;
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error ? error.message : "Something went wrong!"
        );

        // Rollback: Delete uploaded images if product creation fails
        await Promise.all(
          uploadedFilePaths.map(async (path) => {
            await supabase.storage.from("product-images").remove([path]);
          })
        );

        throw error;
      }
    },
    onSuccess: () => {
      form.reset();
      setImagePreview(null);
      toast.success("Product created successfully!");
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
              name="image"
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
            {subImagePreviews.map((preview, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`subImages.${index}` as `subImages.${number}`}
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
