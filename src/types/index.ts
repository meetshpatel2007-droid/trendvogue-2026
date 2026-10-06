export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "USER" | "ADMIN";
  isBlocked: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  images: string[];
  sizes: string[];
  colors: string[];
  stockQty: number;
  isActive: boolean;
  categoryId: string;
  category?: Category;
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  size: string;
  color?: string;
  product?: Product;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  size: string;
  color?: string;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  status: "ORDERED" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  totalAmount: number;
  estimatedDelivery: string;
  pincodeDeliveryTier: string;
  addressSnap: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  user?: User;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { name: string; email?: string };
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}
