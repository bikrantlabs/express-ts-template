import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(120),
  email: z.string().trim().email("a valid email is required"),
  message: z.string().trim().min(1, "message is required").max(5000),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
