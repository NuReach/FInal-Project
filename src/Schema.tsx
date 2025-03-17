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

  // Optional fields
  other_message: z
    .string()
    .max(1000, { message: "Message is too long" })
    .optional(),

  image_url: z
    .union([
      z.string().url({ message: "Main image must be a valid URL" }), // Existing image URL
      z.instanceof(File).refine((file) => file instanceof File, {
        message: "Main image must be a file",
      }), // New uploaded file
    ])
    .optional()
    .refine((value) => value !== undefined || value !== null, {
      message: "Main image is required",
    }),

  sub_images: z
    .array(
      z.union([
        z.string().url({ message: "Sub-image must be a valid URL" }), // Existing sub-image URL
        z.instanceof(File).refine((file) => file instanceof File, {
          message: "Sub-image must be a file",
        }), // New uploaded sub-image file
      ])
    )
    .length(3, { message: "Exactly 3 sub-images are required" })
    .optional()
    .refine((value) => value !== undefined || value !== null, {
      message: "Sub-images are required",
    }),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Product name is required" })
    .max(100, { message: "Product name is too long" })
    .optional(),

  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .min(0.01, { message: "Price must be greater than 0" })
    .optional(),

  discount: z
    .number({ invalid_type_error: "Discount must be a number" })
    .min(0, { message: "Discount cannot be negative" })
    .max(100, { message: "Discount cannot exceed 100%" })
    .optional(),

  status: z
    .enum(["Available", "Out of Stock", "Discontinued"], {
      required_error: "Status is required",
    })
    .optional(),

  description: z
    .string()
    .max(1000, { message: "Description is too long" })
    .optional(),

  category: z.string().min(1, { message: "Category is required" }).optional(),

  stock: z
    .number({ invalid_type_error: "Stock must be a number" })
    .int({ message: "Stock must be an integer" })
    .min(0, { message: "Stock cannot be negative" })
    .optional(),

  condition: z
    .number({ invalid_type_error: "Condition must be a number" })
    .min(0, { message: "Condition must be at least 0%" })
    .max(100, { message: "Condition cannot exceed 100%" })
    .optional(),

  brand: z.string().min(1, { message: "Brand is required" }).optional(),

  usage: z
    .string()
    .min(1, { message: "Usage information is required" })
    .max(255, { message: "Usage info is too long" })
    .optional(),

  other_message: z
    .string()
    .max(1000, { message: "Message is too long" })
    .optional(),

  image_url: z
    .union([
      z.string().url({ message: "Main image must be a valid URL" }), // Existing image URL
      z.instanceof(File).refine((file) => file instanceof File, {
        message: "Main image must be a file",
      }), // New uploaded file
    ])
    .optional(),

  // Sub-images (Optional)
  sub_images: z
    .array(
      z.union([
        z.string().url({ message: "Sub-image must be a valid URL" }), // Existing sub-image URL
        z.instanceof(File).refine((file) => file instanceof File, {
          message: "Sub-image must be a file",
        }), // New uploaded sub-image file
      ])
    )
    .length(3, { message: "Exactly 3 sub-images are required" })
    .optional(),
});
