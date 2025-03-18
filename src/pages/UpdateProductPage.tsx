import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { productCreateSchema, updateProductSchema } from "../Schema";
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
import { Textarea } from "../components/ui/textarea";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import supabase from "../supabaseClient";
import useAuth from "../service/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export default function UpdateProductPage() {
  const { data: auth } = useAuth();
  const { id } = useParams();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [subImagePreviews, setSubImagePreviews] = useState<(string | null)[]>(
    []
  );
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  console.log(auth);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select(
          `
        *,
        product_images (id, image_url)
      `
        )
        .eq("id", id)
        .single();
      return data;
    },
  });

  const form = useForm<z.infer<typeof productCreateSchema>>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: product || {},
  });

  useEffect(() => {
    if (product) {
      setImagePreview(product.image_url);
      setSubImagePreviews(product.product_images);

      // Reset form with optional values for the update
      form.reset({
        name: product.name || "",
        price: product.price || 1,
        discount: product.discount || 0,
        status: product.status || "Available",
        description: product.description || "",
        category: product.category || "",
        stock: product.stock || 0,
        condition: product.condition || 0,
        brand: product.brand || "",
        usage: product.usage || "",
        other_message: product.other_message || "",
        image_url: product.image_url, // Keep existing image URL
        sub_images: product.product_images.map(
          (img: { id: string; image_url: string }) => img.image_url
        ), // Keep existing sub-images (if available)
      });
    }
  }, [product, form]);

  const deleteOldImage = async (url: string) => {
    const filePath = url.split("/product-images/")[1];
    await supabase.storage.from("product-images").remove([filePath]);
  };

  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const { mutateAsync: updateProductMutation, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof updateProductSchema>) => {
      let mainImageUrl = values.image_url;
      let oldImageUrl: string | null = null;

      // Fetch the existing product data before updating
      const { data: existingProduct, error: fetchError } = await supabase
        .from("products")
        .select("image_url")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      oldImageUrl = existingProduct?.image_url || null;

      // If the new image is a file, upload it
      if (typeof values.image_url !== "string" && values.image_url) {
        // Delete the old image if it's being replaced
        if (oldImageUrl) {
          await deleteOldImage(oldImageUrl); // Implement deleteImage to handle the deletion
        }

        // Upload the new image
        mainImageUrl = await uploadImage(values.image_url);
      }

      const { data, error } = await supabase
        .from("products")
        .update({
          name: values.name,
          price: values.price,
          discount: values.discount,
          status: values.status,
          type: values.type,
          description: values.description,
          category: values.category,
          stock: values.stock,
          condition: values.condition,
          brand: values.brand,
          usage: values.usage,
          other_message: values.other_message,
          image_url: mainImageUrl, // Update image_url with the new one
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      if (values.sub_images && values.sub_images.length > 0) {
        // 1️⃣ Fetch existing images from the product_images table
        const { data: existingImages, error: fetchError } = await supabase
          .from("product_images")
          .select("id, image_url") // Include "id" to delete specific records
          .eq("product_id", data.id);

        if (fetchError) throw fetchError;

        const existingImageUrls =
          existingImages?.map((img) => img.image_url) || [];
        const existingImageIds: Record<string, number> = {};
        for (const img of existingImages) {
          existingImageIds[img.image_url] = img.id;
        }

        console.log(existingImageIds);

        // 2️⃣ Determine images to delete and new images to upload
        const imagesToDelete = existingImages.filter(
          (img) => !(values?.sub_images ?? []).includes(img.image_url)
        );
        const newImages = values.sub_images.filter(
          (img) => !existingImageUrls.includes(img)
        );

        // 3️⃣ Delete removed images from Supabase
        if (imagesToDelete.length > 0) {
          const deleteIds = imagesToDelete.map((img) => img.id);
          await supabase.from("product_images").delete().in("id", deleteIds);
        }

        // 4️⃣ Upload new images (if they are files)
        const uploadedImageUrls = [];
        for (const subImage of newImages) {
          if (subImage instanceof File) {
            const uploadedUrl = await uploadImage(subImage); // Upload new file
            uploadedImageUrls.push(uploadedUrl);
          } else {
            uploadedImageUrls.push(subImage); // If it's already a URL, use it
          }
        }

        // 5️⃣ Insert only new images
        if (uploadedImageUrls.length > 0) {
          const { error: insertError } = await supabase
            .from("product_images")
            .insert(
              uploadedImageUrls.map((imgUrl) => ({
                product_id: data.id,
                image_url: imgUrl,
              }))
            );

          if (insertError) throw insertError;
        }
      }
      return data;
    },
    onSuccess: () => {
      form.reset();
      setImagePreview(null);
      setSubImagePreviews([]);
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
      navigate("/dashboard/products");
    },
    onError: (error: Error) => {
      console.error("Error updating product:", error.message);
      toast.error(error.message || "Something went wrong! Please try again.");
    },
  });

  const onSubmit = async (values: z.infer<typeof updateProductSchema>) => {
    await updateProductMutation(values);
  };

  return (
    <div>
      <Navbar />
      {isLoading ? (
        <div className="flex w-screen h-screen justify-center items-center">
          Loading...
        </div>
      ) : (
        <div className="max-w-2xl mx-auto p-6">
          <h2 className="text-2xl font-semibold mb-4">Update Product</h2>
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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
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
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Collection">Collection</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          <SelectValue placeholder={field.value} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Out of Stock">
                          Out of Stock
                        </SelectItem>
                        <SelectItem value="Unavailable">
                          Discontinued
                        </SelectItem>
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
                {product?.product_images.map(
                  (
                    preview: { id: string; image_url: string },
                    index: number
                  ) => (
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
                                    const updatedPreviews = [
                                      ...subImagePreviews,
                                    ];
                                    updatedPreviews[index] =
                                      URL.createObjectURL(file);
                                    setSubImagePreviews(updatedPreviews); // Update state to trigger re-render
                                    field.onChange(file);
                                  }
                                }}
                              />
                              {subImagePreviews && (
                                <img
                                  src={product.product_images[index].image_url}
                                  alt={preview.id}
                                  className="mt-4 w-full max-w-xs rounded border"
                                />
                              )}
                            </>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                )}
              </div>

              <Button disabled={isPending} type="submit">
                Update Product
              </Button>
            </form>
          </Form>
        </div>
      )}
      <Footer />
    </div>
  );
}
