export type Money = {
  amount: number;
  currency: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price: Money;
  imageUrl?: string;
  categorySlug?: string;
  inStock?: boolean;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  quantity: number;
  unitPrice: Money;
  imageUrl?: string;
};

export type Cart = {
  items: CartItem[];
  subtotal: Money;
};
