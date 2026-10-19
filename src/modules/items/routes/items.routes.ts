import { Router } from "express";
import { asyncHandler } from "@/lib/async-handler";
import { validate } from "@/middlewares/validate";
import { createItemSchema, itemParamsSchema, updateItemSchema } from "../schemas/items.schemas";
import type { CreateItemInput, ItemParams, UpdateItemInput } from "../schemas/items.schemas";
import { createItem } from "../use-cases/create-item.use-case";
import { listItems } from "../use-cases/list-items.use-case";
import { getItem } from "../use-cases/get-item.use-case";
import { updateItem } from "../use-cases/update-item.use-case";
import { deleteItem } from "../use-cases/delete-item.use-case";

/**
 * The slice's HTTP layer: routing, validation, and response shaping only.
 * Business logic lives in ../use-cases, SQL in ../repository.
 */
export const itemsRouter = Router();

/**
 * @openapi
 * /api/items:
 *   get:
 *     tags: [items]
 *     summary: List items (Redis-cached)
 *     responses:
 *       "200":
 *         description: List of items
 *   post:
 *     tags: [items]
 *     summary: Create an item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/CreateItemInput" }
 *     responses:
 *       "201":
 *         description: Created item
 *       "400":
 *         description: Validation failed
 */
itemsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.status(200).json({ status: "ok", data: await listItems() });
  }),
);

itemsRouter.post(
  "/",
  validate({ body: createItemSchema }),
  asyncHandler(async (req, res) => {
    const body = req.body as CreateItemInput;
    res.status(201).json({ status: "ok", data: await createItem(body) });
  }),
);

/**
 * @openapi
 * /api/items/{id}:
 *   parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       schema: { type: string, format: uuid }
 *   get:
 *     tags: [items]
 *     summary: Get one item
 *     responses:
 *       "200":
 *         description: The item
 *       "404":
 *         description: Not found
 *   put:
 *     tags: [items]
 *     summary: Update an item's name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/CreateItemInput" }
 *     responses:
 *       "200":
 *         description: Updated item
 *       "404":
 *         description: Not found
 *   delete:
 *     tags: [items]
 *     summary: Delete an item
 *     responses:
 *       "204":
 *         description: Deleted
 *       "404":
 *         description: Not found
 */
itemsRouter.get(
  "/:id",
  validate({ params: itemParamsSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as unknown as ItemParams;
    res.status(200).json({ status: "ok", data: await getItem(id) });
  }),
);

itemsRouter.post(
  "/",
  validate({ body: createItemSchema }),
  asyncHandler(async (req, res) => {
    const body = req.body as CreateItemInput;
    res.status(201).json({ status: "ok", data: await createItem(body) });
  }),
);

itemsRouter.put(
  "/:id",
  validate({ params: itemParamsSchema, body: updateItemSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as unknown as ItemParams;
    const body = req.body as UpdateItemInput;
    res.status(200).json({ status: "ok", data: await updateItem(id, body) });
  }),
);

itemsRouter.delete(
  "/:id",
  validate({ params: itemParamsSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as unknown as ItemParams;
    await deleteItem(id);
    res.status(204).send();
  }),
);
