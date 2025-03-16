export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  imageUrl: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
}

import { z } from "zod";

export const productCreateSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Product name is required" })
    .max(100, { message: "Product name is too long" }),

  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .min(0.01, { message: "Price must be greater than 0" }),

  discount: z
    .number({ invalid_type_error: "Discount must be a number" })
    .min(0, { message: "Discount cannot be negative" })
    .max(100, { message: "Discount cannot exceed 100%" }),

  status: z.enum(["Available", "Out of Stock", "Discontinued"], {
    required_error: "Status is required",
  }),

  description: z
    .string()
    .max(1000, { message: "Description is too long" })
    .optional(),

  category: z.string().min(1, { message: "Category is required" }),

  stock: z
    .number({ invalid_type_error: "Stock must be a number" })
    .int({ message: "Stock must be an integer" })
    .min(0, { message: "Stock cannot be negative" }),

  condition: z
    .number({ invalid_type_error: "Condition must be a number" })
    .min(0, { message: "Condition must be at least 0%" })
    .max(100, { message: "Condition cannot exceed 100%" }),

  brand: z.string().min(1, { message: "Brand is required" }),

  usage: z
    .string()
    .min(1, { message: "Usage information is required" })
    .max(255, { message: "Usage info is too long" }),

  // Optional
  other_message: z
    .string()
    .max(1000, { message: "Message is too long" })
    .optional(),
  image: z.instanceof(File, { message: "Main image is required" }),

  subImages: z
    .array(z.instanceof(File, { message: "Each sub-image is required" }))
    .length(3, { message: "Exactly 3 sub-images are required" }),
});
