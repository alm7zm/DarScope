import { describe, expect, it } from 'vitest';
import { findPhoto } from './photos.js';

/** Photo URLs keyed by file path, the shape `import.meta.glob` gives. */
const PHOTOS = {
  '../../assets/team/Sara Al Qahtani.jpg': '/assets/sara.webp',
  '../../assets/team/faisal.png': '/assets/faisal.webp',
};

describe('findPhoto', () => {
  it('finds a photo by its file name', () => {
    expect(findPhoto(PHOTOS, 'faisal.png')).toBe('/assets/faisal.webp');
  });

  it('ignores any folder written in front of the name', () => {
    expect(findPhoto(PHOTOS, 'frontend/public/team/Sara Al Qahtani.jpg')).toBe(
      '/assets/sara.webp',
    );
    expect(findPhoto(PHOTOS, 'C:\\Photos\\faisal.png')).toBe(
      '/assets/faisal.webp',
    );
  });

  it('ignores letter case and spaces around the name', () => {
    expect(findPhoto(PHOTOS, ' sara al qahtani.JPG ')).toBe(
      '/assets/sara.webp',
    );
  });

  it('finds nothing for an unknown or empty name', () => {
    expect(findPhoto(PHOTOS, 'nobody.jpg')).toBeUndefined();
    expect(findPhoto(PHOTOS, '')).toBeUndefined();
    expect(findPhoto(PHOTOS, undefined)).toBeUndefined();
  });
});
