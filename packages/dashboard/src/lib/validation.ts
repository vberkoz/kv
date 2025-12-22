import { z } from 'zod';

export const namespaceSchema = z.object({
  name: z.string()
    .min(1, 'Namespace name is required')
    .max(50, 'Must be 50 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Use only lowercase letters, numbers, and hyphens')
    .regex(/^[a-z]/, 'Must start with a letter')
});

export type NamespaceFormData = z.infer<typeof namespaceSchema>;
