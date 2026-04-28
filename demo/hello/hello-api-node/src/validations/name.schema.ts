import { z } from 'zod';

/**
 * Validation schema for the 'name' path parameter.
 * Matches OpenAPI constraints exactly:
 * - minLength: 2
 * - maxLength: 25
 * - pattern: ^[a-zA-Z ,.'-]+$
 * - Whitespace is trimmed before validation
 */
export const NameParamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'name must be at least 2 characters')
    .max(25, 'name must be at most 25 characters')
    .regex(/^[a-zA-Z ,.'-]+$/, 'name format is invalid')
});

export type NameParam = z.infer<typeof NameParamSchema>;
