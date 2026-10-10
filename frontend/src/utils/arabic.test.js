import { describe, expect, it } from 'vitest';
import { hasArabic, normalise, textDirection } from './arabic.js';

describe('normalise (SRS Appendix B.4)', () => {
  // The four worked examples in the appendix table.
  it.each([
    [' Al Malqa  ', 'al malqa'],
    [
      '\u0627\u0644\u0631\u0648\u0636\u0629',
      '\u0627\u0644\u0631\u0648\u0636\u0647',
    ],
    ['\u0623\u062D\u0645\u062F', '\u0627\u062D\u0645\u062F'],
    [
      '\u062D\u064A \u0627\u0644\u0645\u064E\u0644\u0652\u0642\u0627',
      '\u062D\u064A \u0627\u0644\u0645\u0644\u0642\u0627',
    ],
  ])('turns %j into %j', (input, expected) => {
    expect(normalise(input)).toBe(expected);
  });

  it('lower-cases Latin letters (step 1)', () => {
    expect(normalise('RIYADH Villa')).toBe('riyadh villa');
  });

  it('removes the tatweel (step 2)', () => {
    expect(normalise('\u0627\u0644\u0640\u0640\u0645\u0644\u0642\u0627')).toBe(
      '\u0627\u0644\u0645\u0644\u0642\u0627',
    );
  });

  it.each(['\u0623', '\u0625', '\u0622', '\u0671'])(
    'writes the alif variant %j as a plain alif (step 3)',
    (variant) => {
      expect(normalise(variant)).toBe('\u0627');
    },
  );

  it('writes alif maksura as ya (step 4)', () => {
    expect(normalise('\u0639\u0644\u0649')).toBe('\u0639\u0644\u064A');
  });

  it('writes ta marbuta as ha (step 5)', () => {
    expect(normalise('\u062C\u062F\u0629')).toBe('\u062C\u062F\u0647');
  });

  it('converts Arabic-Indic digits to 0 to 9 (step 6)', () => {
    expect(
      normalise('\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669'),
    ).toBe('0123456789');
  });

  it('collapses repeated spaces and trims (step 7)', () => {
    expect(normalise('  two   words  ')).toBe('two words');
  });

  it('keeps a leading district word unless asked to strip it (step 8 is opt-in)', () => {
    const withWord = '\u062D\u064A \u0627\u0644\u0645\u0644\u0642\u0627';
    expect(normalise(withWord)).toBe(withWord);
    expect(normalise(withWord, { stripDistrictWord: true })).toBe(
      '\u0627\u0644\u0645\u0644\u0642\u0627',
    );
  });

  it('makes spelling variants of one word match', () => {
    // الروضة and الروضه differ only by the final letter, so search must treat them as one word.
    expect(normalise('\u0627\u0644\u0631\u0648\u0636\u0629')).toBe(
      normalise('\u0627\u0644\u0631\u0648\u0636\u0647'),
    );
  });

  it.each([null, undefined, 42, {}])(
    'normalises the non-string %j to an empty string',
    (value) => {
      expect(normalise(value)).toBe('');
    },
  );
});

describe('hasArabic', () => {
  it('finds Arabic letters', () => {
    expect(hasArabic('\u0627\u0644\u0645\u0644\u0642\u0627')).toBe(true);
    expect(hasArabic('Al Malqa')).toBe(false);
    expect(hasArabic('')).toBe(false);
    expect(hasArabic(null)).toBe(false);
  });
});

describe('textDirection', () => {
  it('marks Arabic text with its language, and leaves direction automatic either way', () => {
    expect(textDirection('\u0627\u0644\u0645\u0644\u0642\u0627')).toEqual({
      dir: 'auto',
      lang: 'ar',
    });
    expect(textDirection('Al Malqa')).toEqual({ dir: 'auto' });
  });
});
