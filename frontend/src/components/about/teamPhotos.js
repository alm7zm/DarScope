import { findPhoto } from '../../utils/photos.js';

/**
 * Every photo in `src/assets/team/`. When the app is built, vite-imagetools crops each one to a
 * square around its most important part (sharp's "attention" strategy, which favours faces),
 * shrinks it to at most 800 px and saves it as WebP without its metadata. So a photo of any size
 * or shape can be dropped into the folder as it is: only the small copy reaches the browser.
 */
const PHOTOS = import.meta.glob(
  '../../assets/team/*.{avif,jpeg,jpg,png,webp,AVIF,JPEG,JPG,PNG,WEBP}',
  {
    eager: true,
    import: 'default',
    query: {
      w: 800,
      h: 800,
      fit: 'cover',
      position: 'attention',
      format: 'webp',
    },
  },
);

/**
 * The URL of a team photo, from the name given in `constants/team.js`.
 *
 * @param {string} [photo]
 * @returns {string | undefined} `undefined` when there is no such photo; the page shows initials.
 */
export function teamPhotoUrl(photo) {
  return findPhoto(PHOTOS, photo);
}
