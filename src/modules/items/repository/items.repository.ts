import { Prisma } from "@prisma/client";
import { prisma } from "@/db/prisma";
import type { Item } from "../items.types";

/**
 * All persistence for the `items` table lives here. Use cases call these
 * functions and receive domain objects without depending on Prisma.
 */
export const itemsRepository = {
  async findAll(): Promise<Item[]> {
    return prisma.item.findMany({ orderBy: { createdAt: "desc" } });
  },

  async findById(id: string): Promise<Item | null> {
    return prisma.item.findUnique({ where: { id } });
  },

  async create(name: string): Promise<Item> {
    return prisma.item.create({ data: { name } });
  },

  async update(id: string, name: string): Promise<Item | null> {
    try {
      return await prisma.item.update({ where: { id }, data: { name } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return null;
      }
      throw error;
    }
  },

  async remove(id: string): Promise<boolean> {
    const { count } = await prisma.item.deleteMany({ where: { id } });
    return count > 0;
  },
};
