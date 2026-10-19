import { z } from "zod";

/** Shared constraint — reused by create & update. */
export const itemNameSchema = z.string().trim().min(1, "name is required").max(120);

export const createItemSchema = z.object({
  name: itemNameSchema,
});

export const updateItemSchema = z.object({
  name: itemNameSchema,
});

export const itemParamsSchema = z.object({
  id: z.string().uuid("id must be a UUID"),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ItemParams = z.infer<typeof itemParamsSchema>;
