import { Router } from "express";
import { asyncHandler } from "@/lib/async-handler";
import { validate } from "@/middlewares/validate";
import { contactMessageSchema } from "../schemas/contact.schemas";
import type { ContactMessageInput } from "../schemas/contact.schemas";
import { sendContactMessage } from "../use-cases/send-contact-email.use-case";

export const contactRouter = Router();

/**
 * @openapi
 * /api/contact:
 *   post:
 *     tags: [contact]
 *     summary: Send a contact message (lands in Mailpit during development)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/ContactMessageInput" }
 *     responses:
 *       "202":
 *         description: Message accepted for delivery
 *       "400":
 *         description: Validation failed
 */
contactRouter.post(
  "/",
  validate({ body: contactMessageSchema }),
  asyncHandler(async (req, res) => {
    const body = req.body as ContactMessageInput;
    await sendContactMessage(body);
    res.status(202).json({ status: "accepted", message: "Thanks — we'll be in touch." });
  }),
);
