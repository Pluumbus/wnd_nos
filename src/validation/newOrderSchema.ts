import { z } from "zod";

const phoneRe = /^\+?[0-9 ()\-]{5,}$/;

export const newOrderCustomerSchema = z.object({
  customerName: z.string().trim().min(1, "Укажите имя"),
  customerPhone: z
    .string()
    .trim()
    .min(5, "Телефон слишком короткий")
    .regex(phoneRe, "Некорректный телефон"),
});

export type NewOrderCustomerInput = z.infer<typeof newOrderCustomerSchema>;

export const workflowDimensionsSchema = z.object({
  width: z.number().positive("Ширина должна быть больше 0"),
  height: z.number().positive("Высота должна быть больше 0"),
});
