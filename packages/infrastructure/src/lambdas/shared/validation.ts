import { z } from 'zod';

// Namespace validation
export const namespaceSchema = z.string()
  .min(1, 'Namespace name is required')
  .max(50, 'Namespace name must be 50 characters or less')
  .regex(/^[a-z0-9-]+$/, 'Namespace name must contain only lowercase letters, numbers, and hyphens');

// Key validation
export const keySchema = z.string()
  .min(1, 'Key is required')
  .max(255, 'Key must be 255 characters or less')
  .regex(/^[a-zA-Z0-9:_.-]+$/, 'Key must contain only alphanumeric characters, colons, underscores, dots, and hyphens');

// Value validation (JSON payload size limit: 400KB)
export const valueSchema = z.any()
  .refine((val) => {
    const size = JSON.stringify(val).length;
    return size <= 400 * 1024;
  }, 'Value size must not exceed 400KB');

// Create namespace request
export const createNamespaceSchema = z.object({
  name: namespaceSchema
});

// Put value request
export const putValueSchema = z.object({
  value: valueSchema
});

// Validation helper
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.errors[0].message };
}
