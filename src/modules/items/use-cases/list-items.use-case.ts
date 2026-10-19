import { cacheGet, cacheSet } from "@/lib/cache";
import { itemsRepository } from "../repository/items.repository";
import { ITEMS_LIST_CACHE_KEY, ITEMS_LIST_CACHE_TTL_SECONDS } from "../items.cache";
import type { Item } from "../items.types";

/** Cache-aside: serve from Redis when warm, fall back to Postgres and repopulate. */
export async function listItems(): Promise<Item[]> {
  const cached = await cacheGet<Item[]>(ITEMS_LIST_CACHE_KEY);
  if (cached) return cached;

  const items = await itemsRepository.findAll();
  await cacheSet(ITEMS_LIST_CACHE_KEY, items, ITEMS_LIST_CACHE_TTL_SECONDS);
  return items;
}
