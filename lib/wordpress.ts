import { WP_API } from "./config";
import type { WpPage } from "./types";

/** WordPress core REST API (wp/v2) client for page/post content. */

async function wpGet<T>(
  path: string,
  params: Record<string, string | number> = {},
  revalidate = 600,
): Promise<T> {
  const url = new URL(`${WP_API}/wp/v2${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`WP API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getPageBySlug(slug: string): Promise<WpPage | null> {
  const pages = await wpGet<WpPage[]>("/pages", {
    slug,
    _fields: "id,slug,link,title,content,excerpt,yoast_head_json",
  });
  return pages[0] ?? null;
}

export async function getAllPages(): Promise<WpPage[]> {
  return wpGet<WpPage[]>("/pages", {
    per_page: 100,
    _fields: "id,slug,link,title",
  });
}
