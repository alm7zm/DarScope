/**
 * The rent model behind the form's rent suggestion (FR-ADD-13, SRS 7.6). Its numbers live in
 * `data/rent-model.json`, exported from `ai-model/prepare.ipynb`. The file is loaded when a form
 * first needs it, never with the first page (NFR-PERF-04), and the property's values never
 * leave the browser.
 */

let loading = null;

/**
 * The model's numbers, loaded once and shared by every form.
 *
 * @returns {Promise<Record<string, any>>} Rejects when the file cannot be loaded.
 */
export function loadRentModel() {
  loading ??= import('../data/rent-model.json')
    .then((module) => module.default)
    .catch((error) => {
      loading = null; // the next form tries again
      throw error;
    });
  return loading;
}
