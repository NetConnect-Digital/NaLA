import { STORE_API } from "./config";
import type { Product, ProductCategory } from "./types";

/**
 * Server-side WooCommerce Store API client for catalog reads.
 * Cart/checkout mutations go through Route Handlers (see app/api/*) so the
 * Cart-Token and Nonce can be managed server-side and CORS is avoided.
 */

type FetchOpts = {
  /** ISR revalidation window in seconds. Catalog changes rarely. */
  revalidate?: number;
  params?: Record<string, string | number | undefined>;
};

function buildUrl(path: string, params?: FetchOpts["params"]) {
  const url = new URL(`${STORE_API}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function storeGet<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const res = await fetch(buildUrl(path, opts.params), {
    headers: { Accept: "application/json" },
    next: { revalidate: opts.revalidate ?? 300 },
  });
  if (!res.ok) {
    throw new Error(`Store API ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getProducts(
  params: {
    category?: number | string;
    per_page?: number;
    page?: number;
    search?: string;
    orderby?: string;
    order?: "asc" | "desc";
  } = {},
): Promise<Product[]> {
  return storeGet<Product[]>("/products", {
    params: { per_page: 100, ...params },
  });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await storeGet<Product[]>("/products", {
    params: { slug },
  });
  return products[0] ?? null;
}

export async function getProductById(id: number): Promise<Product> {
  return storeGet<Product>(`/products/${id}`);
}

export async function getCategories(): Promise<ProductCategory[]> {
  return storeGet<ProductCategory[]>("/products/categories", {
    params: { per_page: 100 },
  });
}

export async function getCategoryBySlug(
  slug: string,
): Promise<ProductCategory | null> {
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug) ?? null;
}
