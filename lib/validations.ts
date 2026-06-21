import { z } from 'zod';

// Example Schema for User Login
export const LoginSchema = z.object({
  pin: z.string()
    .min(4, "Le code PIN doit comporter au moins 4 caractères")
    .max(8, "Le code PIN ne peut pas dépasser 8 caractères")
    .regex(/^\d+$/, "Le code PIN ne doit contenir que des chiffres"),
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
