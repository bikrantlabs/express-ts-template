import { pool } from "@/db/pool";
import type { Item, ItemRow } from "../items.types";
import { toItem } from "../items.types";

/**
 * All SQL for the `items` table lives here. Use cases call these functions
 * and receive domain objects — they never see raw rows or build queries.
 */
export const itemsRepository = {
  async findAll(): Promise<Item[]> {
    const { rows } = await pool.query<ItemRow>(
      "SELECT id, name, created_at, updated_at FROM items ORDER BY created_at DESC",
    );
    return rows.map(toItem);
  },

  async findById(id: string): Promise<Item | null> {
    const { rows } = await pool.query<ItemRow>(
      "SELECT id, name, created_at, updated_at FROM items WHERE id = $1",
      [id],
    );
    const row = rows[0];
    return row ? toItem(row) : null;
  },

  async create(name: string): Promise<Item> {
    const { rows } = await pool.query<ItemRow>(
      "INSERT INTO items (name) VALUES ($1) RETURNING id, name, created_at, updated_at",
      [name],
    );
    const row = rows[0];
    if (!row) throw new Error("INSERT returned no row");
    return toItem(row);
  },

  async update(id: string, name: string): Promise<Item | null> {
    const { rows } = await pool.query<ItemRow>(
      "UPDATE items SET name = $2, updated_at = now() WHERE id = $1 RETURNING id, name, created_at, updated_at",
      [id, name],
    );
    const row = rows[0];
    return row ? toItem(row) : null;
  },

  async remove(id: string): Promise<boolean> {
    const { rowCount } = await pool.query("DELETE FROM items WHERE id = $1", [id]);
    return (rowCount ?? 0) > 0;
  },
};
