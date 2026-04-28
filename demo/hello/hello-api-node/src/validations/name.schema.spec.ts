import { NameParamSchema } from './name.schema';

describe('NameParamSchema', () => {
  describe('valid inputs', () => {
    it('should accept a simple valid name', () => {
      const result = NameParamSchema.parse({ name: 'Philippe' });
      expect(result.name).toBe('Philippe');
    });

    it('should accept names with spaces', () => {
      const result = NameParamSchema.parse({ name: 'Jean Paul' });
      expect(result.name).toBe('Jean Paul');
    });

    it('should accept names with hyphens', () => {
      const result = NameParamSchema.parse({ name: 'Marie-Claire' });
      expect(result.name).toBe('Marie-Claire');
    });

    it('should accept names with apostrophes', () => {
      const result = NameParamSchema.parse({ name: 'O\'Brien' });
      expect(result.name).toBe('O\'Brien');
    });

    it('should accept names with commas and periods', () => {
      const result = NameParamSchema.parse({ name: 'Mr. Smith, Jr.' });
      expect(result.name).toBe('Mr. Smith, Jr.');
    });

    it('should trim whitespace from names', () => {
      const result = NameParamSchema.parse({ name: '  Philippe  ' });
      expect(result.name).toBe('Philippe');
    });

    it('should accept exactly 2 characters (minimum)', () => {
      const result = NameParamSchema.parse({ name: 'Jo' });
      expect(result.name).toBe('Jo');
    });

    it('should accept exactly 25 characters (maximum)', () => {
      const name = 'A'.repeat(25);
      const result = NameParamSchema.parse({ name });
      expect(result.name).toBe(name);
    });
  });

  describe('invalid inputs', () => {
    it('should reject names shorter than 2 characters (after trim)', () => {
      expect(() => NameParamSchema.parse({ name: 'a' })).toThrow(
        'name must be at least 2 characters'
      );
    });

    it('should reject names longer than 25 characters', () => {
      const name = 'A'.repeat(26);
      expect(() => NameParamSchema.parse({ name })).toThrow(
        'name must be at most 25 characters'
      );
    });

    it('should reject names with numbers', () => {
      expect(() => NameParamSchema.parse({ name: 'John123' })).toThrow(
        'name format is invalid'
      );
    });

    it('should reject names with special characters (@)', () => {
      expect(() => NameParamSchema.parse({ name: 'Jean@Paul' })).toThrow(
        'name format is invalid'
      );
    });

    it('should reject names with special characters (#)', () => {
      expect(() => NameParamSchema.parse({ name: 'John#Doe' })).toThrow(
        'name format is invalid'
      );
    });

    it('should reject empty string', () => {
      expect(() => NameParamSchema.parse({ name: '' })).toThrow();
    });

    it('should reject space-only strings (becomes empty after trim)', () => {
      expect(() => NameParamSchema.parse({ name: '   ' })).toThrow(
        'name must be at least 2 characters'
      );
    });
  });
});
