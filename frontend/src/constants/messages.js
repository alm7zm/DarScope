/**
 * Every fixed message in the app, copied word for word from SRS Appendix C. Never rephrase one
 * here or in a component: the acceptance tests compare against this exact wording.
 */

/** Field error messages (SRS Appendix C.1). */
export const FIELD_ERRORS = {
  cityRequired: 'Choose a city.',
  districtRequired: 'Enter the district.',
  districtLength: 'District must be 2 to 60 characters.',
  propertyTypeRequired: 'Choose a property type.',
  sizeWholeNumber: 'Enter the size in m² as a whole number.',
  sizeRange: 'Size must be between 20 and 100,000 m².',
  propertyAgeRange: 'Age must be a whole number from 0 to 100 years.',
  bedroomsRange: 'Bedrooms must be a whole number from 0 to 20.',
  bathroomsRange: 'Bathrooms must be a whole number from 0 to 20.',
  livingRoomsRange: 'Living rooms must be a whole number from 0 to 20.',
  rentWholeNumber: 'Enter the yearly rent in SAR as a whole number.',
  rentRange: 'Yearly rent must be between 1,000 and 10,000,000 SAR.',
  descriptionLength: 'Description must be 2,000 characters or fewer.',
  statusRequired: 'Choose a status.',
  tenantNameRequired: "Enter the tenant's name for an occupied property.",
  tenantNameLength: 'Tenant name must be 2 to 80 characters.',
  leaseEndAfterStart: 'Lease end must be after lease start.',
  rentFilterOrder: 'The lowest rent cannot be above the highest.',
  sizeFilterOrder: 'The smallest size cannot be above the largest.',
};

/** Fixed messages that name a property by ID (SRS Appendix C.2). */
export const MESSAGES = {
  added: (id) => `Property ${id} added`,
  updated: (id) => `Property ${id} updated`,
  deleted: (id) => `Property ${id} deleted`,
  restored: (id) => `Property ${id} restored`,
};

/** Fixed messages with no variable part (SRS Appendix C.2). */
export const TEXT = {
  demoDataReset: 'Demo data restored',
  noSearchMatches: 'No properties match your search.',
  emptyPortfolio: 'No properties yet. Add your first property.',
  propertyNotFound: 'Property not found',
  possibleDuplicate:
    'A property with the same city, district, size, bedrooms and rent already exists.',
  statusLeavesOccupied:
    'Changing the status will clear the tenant and lease details.',
  beforeModelDownload:
    'Search by meaning downloads a language model of about 135 MB once. It runs on this device.',
  modelCannotLoad:
    'The language model could not be loaded. Keyword search is still available.',
  tooFewComparables: 'Not enough market data',
  estimateDisclaimer:
    'Based on 2021 listings. Indicative only, not a valuation.',
};

/** How long a confirmation message stays on screen, in milliseconds (FR-FBK-01). */
export const MESSAGE_TIMEOUT_MS = 5000;

/** How long a message that offers Undo stays on screen (FR-FBK-01, FR-DEL-07). */
export const UNDO_TIMEOUT_MS = 8000;

/** How long after the last keystroke the search runs (FR-SRC-03). */
export const SEARCH_DEBOUNCE_MS = 300;
