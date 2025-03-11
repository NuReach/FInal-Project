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
