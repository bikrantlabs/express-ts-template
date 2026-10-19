import { cacheDel } from "@/lib/cache";
import { itemsRepository } from "../repository/items.repository";
import { ITEMS_LIST_CACHE_KEY } from "../items.cache";
import type { CreateItemInput } from "../schemas/items.schemas";
import type { Item } from "../items.types";

export async function createItem(input: CreateItemInput): Promise<Item> {
  const item = await itemsRepository.create(input.name);
  await cacheDel(ITEMS_LIST_CACHE_KEY);
  return item;
}
