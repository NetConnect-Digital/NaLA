/** Subset of WooCommerce Store API (wc/store/v1) shapes used by the frontend. */

export interface StoreImage {
  id: number;
  src: string;
  thumbnail: string;
  srcset: string;
  sizes: string;
  name: string;
  alt: string;
}

export interface PriceRange {
  min_amount: string;
  max_amount: string;
}

export interface ProductPrices {
  price: string;
  regular_price: string;
  sale_price: string;
  price_range: PriceRange | null;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  link?: string;
  count?: number;
  image?: StoreImage | null;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  parent: number;
  type: "simple" | "variable" | "variation" | "grouped" | "external";
  permalink: string;
  description: string;
  short_description: string;
  sku: string;
  prices: ProductPrices;
  price_html: string;
  on_sale: boolean;
  is_purchasable: boolean;
  is_in_stock: boolean;
  is_on_backorder: boolean;
  low_stock_remaining: number | null;
  stock_availability?: { text: string; class: string } | null;
  sold_individually: boolean;
  add_to_cart: { text: string; description: string; url: string };
  images: StoreImage[];
  categories: ProductCategory[];
  variations: { id: number; attributes: { name: string; value: string }[] }[];
  has_options: boolean;
}

export interface CartItem {
  key: string;
  id: number;
  quantity: number;
  name: string;
  short_description: string;
  permalink: string;
  images: StoreImage[];
  prices: ProductPrices;
  totals: {
    line_subtotal: string;
    line_total: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_prefix: string;
    currency_suffix: string;
  };
  quantity_limits: { minimum: number; maximum: number; editable: boolean };
}

export interface CartTotals {
  total_items: string;
  total_price: string;
  total_tax: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_prefix: string;
  currency_suffix: string;
}

export interface Cart {
  items: CartItem[];
  items_count: number;
  totals: CartTotals;
  needs_payment: boolean;
  needs_shipping: boolean;
  payment_methods: string[];
  errors: { code: string; message: string }[];
}

export interface WpRendered {
  rendered: string;
  protected?: boolean;
}

export interface WpPage {
  id: number;
  slug: string;
  link: string;
  title: WpRendered;
  content: WpRendered;
  excerpt: WpRendered;
  yoast_head_json?: { title?: string; description?: string };
}
