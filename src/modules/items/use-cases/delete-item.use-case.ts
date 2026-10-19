import { cacheDel } from "@/lib/cache";
import { NotFoundError } from "@/lib/errors";
import { itemsRepository } from "../repository/items.repository";
import { ITEMS_LIST_CACHE_KEY } from "../items.cache";

export async function deleteItem(id: string): Promise<void> {
  const removed = await itemsRepository.remove(id);
  if (!removed) throw new NotFoundError(`Item ${id} not found`);
  await cacheDel(ITEMS_LIST_CACHE_KEY);
}
