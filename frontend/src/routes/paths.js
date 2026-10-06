/**
 * Every URL in the app (SRS 4.1). Use these instead of writing a URL by hand.
 * For a URL with `:id`, fill it in with React Router's `generatePath(PATHS.propertyDetail, { id })`.
 */
export const PATHS = {
  dashboard: '/',
  properties: '/properties',
  addProperty: '/properties/new',
  propertyDetail: '/properties/:id',
  editProperty: '/properties/:id/edit',
  insights: '/insights',
  about: '/about',
};
