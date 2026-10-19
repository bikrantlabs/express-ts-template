import { NotFoundError } from "@/lib/errors";
import { itemsRepository } from "../repository/items.repository";
import type { Item } from "../items.types";

export async function getItem(id: string): Promise<Item> {
  const item = await itemsRepository.findById(id);
  if (!item) throw new NotFoundError(`Item ${id} not found`);
  return item;
}
