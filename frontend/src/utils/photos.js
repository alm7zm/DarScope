/** The last part of a path, trimmed and in lower case: ` Team/Sara.JPG` gives `sara.jpg`. */
function fileName(path) {
  return String(path).trim().split(/[\\/]/).pop().toLowerCase();
}

/**
 * Finds a photo by the name given in `constants/team.js`. Only the file name counts, in any letter
 * case, so `Sara.JPG` and `frontend/src/assets/team/sara.jpg` both find `sara.jpg`.
 *
 * @param {Record<string, string>} urlsByPath Photo URLs keyed by file path.
 * @param {string} [photo] The name given in `constants/team.js`.
 * @returns {string | undefined} The photo's URL, or `undefined` when there is no such file.
 */
export function findPhoto(urlsByPath, photo) {
  if (!photo) return undefined;
  const wanted = fileName(photo);
  const path = Object.keys(urlsByPath).find((key) => fileName(key) === wanted);
  return path === undefined ? undefined : urlsByPath[path];
}
