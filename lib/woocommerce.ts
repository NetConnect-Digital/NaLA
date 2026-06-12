import { STORE_API } from "./config";
import type { Product, ProductCategory } from "./types";
import { decodeEntities, stripShortcodes } from "./utils";

/**
 * Normalize a product for the headless frontend: decode entity-encoded names and
 * strip WPBakery/WordPress shortcodes from the rendered HTML fields (the Store API
 * returns raw shortcodes since WPBakery only renders them on the WordPress side).
 */
function decodeProduct(p: Product): Product {
  p.name = decodeEntities(p.name);
  p.categories = p.categories?.map((c) => ({ ...c, name: decodeEntities(c.name) }));
  p.tags = p.tags?.map((t) => ({ ...t, name: decodeEntities(t.name) }));
  p.description = stripShortcodes(p.description);
  p.short_description = stripShortcodes(p.short_description);
  return p;
}

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
  opts: { revalidate?: number } = {},
): Promise<Product[]> {
  const products = await storeGet<Product[]>("/products", {
    params: { per_page: 100, ...params },
    revalidate: opts.revalidate,
  });
  return products.map(decodeProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await storeGet<Product[]>("/products", {
    params: { slug },
  });
  return products[0] ? decodeProduct(products[0]) : null;
}

export async function getProductById(id: number): Promise<Product> {
  return decodeProduct(await storeGet<Product>(`/products/${id}`));
}

export async function getCategories(): Promise<ProductCategory[]> {
  const cats = await storeGet<ProductCategory[]>("/products/categories", {
    params: { per_page: 100 },
  });
  return cats.map((c) => ({ ...c, name: decodeEntities(c.name) }));
}

export async function getCategoryBySlug(
  slug: string,
): Promise<ProductCategory | null> {
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug) ?? null;
}
