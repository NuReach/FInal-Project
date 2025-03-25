export interface Product {
  id: string; // uuid
  user_id: string; // uuid
  name: string;
  description: string;
  price: number; // float4
  discount: number; // float4
  image_url: string;
  type: "Product" | "Collection";
  status: "Available" | "Out of Stock" | "Unavailable";
  created_at: string; // timestamptz (ISO 8601 string)
  updated_at: string; // timestamptz (ISO 8601 string)
  category: string;
  condition: number; // float4
  brand: string;
  usage: string;
  other_message: string;
  stock: number; // int2
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

  type: z.enum(["Product", "Collection"], {
    required_error: "Type is required",
  }),

  status: z.enum(["Available", "Out of Stock", "Unavailable"], {
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

  type: z.enum(["Product", "Collection"], {
    required_error: "Type is required",
  }),

  status: z.enum(["Available", "Out of Stock", "Unavailable"], {
    required_error: "Status is required",
  }),

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

export const categories = [
  "Electronics",
  "Fashion",
  "Home & Living",
  "Beauty & Health",
  "Sports & Outdoors",
  "Toys & Games",
  "Books",
  "Groceries",
  "Automotive",
  "Furniture",
];

export const phnomPenhDistricts = [
  "Daun Penh",
  "Chamkarmon",
  "Toul Kork",
  "Meanchey",
  "Por Sen Chey",
  "Russey Keo",
  "Sangkat Phnom Penh Thmei",
  "Khan 7 Makara",
  "Khan Toul Kork",
  "Khan Chamkarmon",
  "Khan Daun Penh",
  "Khan Meanchey",
  "Khan Por Sen Chey",
  "Khan Russey Keo",
  "Khan Saensokh",
  "Khan Kambol",
];

// Define your types for products, cart items, and cart here
interface ProductImage {
  image_url: string;
}

interface UserRole {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  address: string;
  user_id: string;
  image_url: string;
}

interface ProductCart {
  id: string;
  name: string;
  type: string;
  brand: string;
  price: number;
  stock: number;
  usage: string;
  status: string;
  user_id: string;
  category: string;
  discount: number;
  condition: number;
  image_url: string;
  created_at: string;
  updated_at: string;
  user_roles: UserRole;
  description: string;
  other_message: string;
  product_images: ProductImage[];
}

export interface CartItem {
  id: number;
  created_at: string;
  product_id: string;
  user_id: string;
  quantity: number;
  total: number;
  discount: number;
  products: ProductCart;
  user_roles: UserRole;
}

export interface Cart {
  seller_id: string;
  seller_name: string;
  cartItems: CartItem[];
  total: number;
}
