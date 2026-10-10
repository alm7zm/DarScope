import { generatePath, useNavigate, useParams } from 'react-router';
import PropertyForm from '../components/properties/PropertyForm.jsx';
import PropertyNotFound from '../components/properties/PropertyNotFound.jsx';
import Page from '../components/ui/Page.jsx';
import { TEXT } from '../constants/messages.js';
import { usePortfolio } from '../hooks/usePortfolio.js';
import { PATHS } from '../routes/paths.js';

/**
 * Add property and Edit property share this page and one form (SRS 5.1 and 5.2).
 * The URL has an `:id` only when editing.
 */
export default function PropertyFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, loading, addProperty, updateProperty } = usePortfolio();

  const isEdit = Boolean(id);
  const title = isEdit ? 'Edit property' : 'Add property';

  if (isEdit && loading) {
    return (
      <Page title={title}>
        <p>Loading property…</p>
      </Page>
    );
  }

  const property = isEdit
    ? properties.find((candidate) => candidate.id === id)
    : undefined;

  // Editing an ID that does not exist reads the same as viewing one (FR-DET-03).
  if (isEdit && !property) {
    return (
      <Page title={TEXT.propertyNotFound}>
        <PropertyNotFound id={id} />
      </Page>
    );
  }

  /** Save, then open the property that was just written (FR-ADD-05, FR-UPD-04). */
  async function handleSave(values) {
    const saved = isEdit
      ? await updateProperty(id, values)
      : await addProperty(values);

    navigate(generatePath(PATHS.propertyDetail, { id: saved.id }));
  }

  /**
   * Leave without saving (FR-ADD-08, FR-UPD-06). An abandoned edit returns to the property; an
   * abandoned add has no property to return to, so it goes to the list.
   */
  function handleCancel() {
    navigate(
      isEdit ? generatePath(PATHS.propertyDetail, { id }) : PATHS.properties,
    );
  }

  return (
    <Page title={title}>
      <PropertyForm
        property={property}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </Page>
  );
}
