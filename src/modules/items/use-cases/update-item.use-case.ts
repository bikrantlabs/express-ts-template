import { cacheDel } from "@/lib/cache";
import { NotFoundError } from "@/lib/errors";
import { itemsRepository } from "../repository/items.repository";
import { ITEMS_LIST_CACHE_KEY } from "../items.cache";
import type { UpdateItemInput } from "../schemas/items.schemas";
import type { Item } from "../items.types";

export async function updateItem(id: string, input: UpdateItemInput): Promise<Item> {
  const item = await itemsRepository.update(id, input.name);
  if (!item) throw new NotFoundError(`Item ${id} not found`);
  await cacheDel(ITEMS_LIST_CACHE_KEY);
  return item;
}
