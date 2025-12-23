import { describe, it, expect } from 'vitest';
import { namespaceSchema, keySchema, valueSchema, validate } from '../lambdas/shared/validation';

describe('Validation', () => {
  describe('namespaceSchema', () => {
    it('accepts valid namespace names', () => {
      expect(namespaceSchema.safeParse('myapp').success).toBe(true);
      expect(namespaceSchema.safeParse('my-app-123').success).toBe(true);
    });

    it('rejects invalid namespace names', () => {
      expect(namespaceSchema.safeParse('MyApp').success).toBe(false);
      expect(namespaceSchema.safeParse('my_app').success).toBe(false);
      expect(namespaceSchema.safeParse('').success).toBe(false);
      expect(namespaceSchema.safeParse('a'.repeat(51)).success).toBe(false);
    });
  });

  describe('keySchema', () => {
    it('accepts valid keys', () => {
      expect(keySchema.safeParse('user:123').success).toBe(true);
      expect(keySchema.safeParse('config.prod').success).toBe(true);
      expect(keySchema.safeParse('session_abc-123').success).toBe(true);
    });

    it('rejects invalid keys', () => {
      expect(keySchema.safeParse('').success).toBe(false);
      expect(keySchema.safeParse('a'.repeat(256)).success).toBe(false);
      expect(keySchema.safeParse('key with spaces').success).toBe(false);
    });
  });

  describe('valueSchema', () => {
    it('accepts values under 400KB', () => {
      expect(valueSchema.safeParse({ data: 'test' }).success).toBe(true);
    });

    it('rejects values over 400KB', () => {
      const largeValue = { data: 'x'.repeat(400 * 1024) };
      expect(valueSchema.safeParse(largeValue).success).toBe(false);
    });
  });

  describe('validate helper', () => {
    it('returns success for valid data', () => {
      const result = validate(namespaceSchema, 'myapp');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('myapp');
      }
    });

    it('returns error for invalid data', () => {
      const result = validate(namespaceSchema, 'INVALID');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lowercase');
      }
    });
  });
});
