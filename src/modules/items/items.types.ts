/** Domain model — camelCase, Dates. Shaped by the repository's row mapper. */
export interface Item {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Raw shape of an `items` table row (snake_case as Postgres returns it). */
export interface ItemRow {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export function toItem(row: ItemRow): Item {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
