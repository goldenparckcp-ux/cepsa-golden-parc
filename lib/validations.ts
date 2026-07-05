import { z } from 'zod';

// Example Schema for User Login
export const LoginSchema = z.object({
  pin: z.string()
    .min(4, "Le mot de passe doit comporter au moins 4 caractères")
    .max(50, "Le mot de passe est trop long"),
});

// Example Schema for updating a profile
export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères").optional(),
  phone: z.string().regex(/^\+?[0-9]{8,15}$/, "Numéro de téléphone invalide").optional(),
  role: z.enum(['admin', 'hotel', 'kitchen', 'services']).optional(),
});

// Helper to validate and return standardized errors
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
  return {
    success: true,
    data: result.data,
  };
}

// Order Item Schema
export const OrderItemSchema = z.object({
  name: z.string().min(1, "Nom de l'article requis"),
  quantity: z.number().int().min(1, "Quantité doit être au moins 1"),
  price: z.number().nonnegative().optional(),
  totalPrice: z.number().nonnegative().optional(),
  image: z.string().url().optional().or(z.literal('')),
  customizations: z.record(z.string(), z.unknown()).optional(),
  prep_time: z.string().optional(),
  time_slot: z.string().optional(),
  date: z.string().optional(),
});

// Create Order Schema
export const CreateOrderSchema = z.object({
  customer_phone: z.string().min(5, "Numéro de téléphone requis").max(20),
  total: z.number().nonnegative("Le total ne peut pas être négatif").optional(),
  items: z.array(OrderItemSchema).min(1, "Au moins un article est requis"),
  notes: z.string().max(500).optional(),
  status: z.string().optional(),
  service_type: z.enum(['dine_in', 'pre_order', 'delivery', 'pickup']).optional(),
  table_number: z.string().optional(),
  arrival_time: z.string().optional(),
});

// Checkout Schema
export const CheckoutSchema = z.object({
  bookingId: z.string().min(1, "ID de réservation requis"),
  amount: z.number().nonnegative("Le montant doit être positif").optional(),
  serviceType: z.string().optional(),
  gateway: z.enum(['paypal', 'cash', 'cmi']).optional(),
  paymentType: z.enum(['full', 'deposit', 'full_discounted']).optional(),
});
