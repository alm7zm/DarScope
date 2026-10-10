import { useState } from 'react';
import { Link, generatePath, useNavigate, useParams } from 'react-router';
import DeletePropertyDialog from '../components/properties/DeletePropertyDialog.jsx';
import PropertyDetail from '../components/properties/PropertyDetail.jsx';
import PropertyNotFound from '../components/properties/PropertyNotFound.jsx';
import Button from '../components/ui/Button.jsx';
import Page from '../components/ui/Page.jsx';
import { TEXT } from '../constants/messages.js';
import { usePortfolio } from '../hooks/usePortfolio.js';
import { PATHS } from '../routes/paths.js';
import { displayTitle } from '../utils/format.js';
import styles from './PropertyDetailPage.module.css';

/** Read one property in full (SRS 4.4). The property's ID is the `:id` part of the URL. */
export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, loading } = usePortfolio();
  /** True while the delete is awaiting confirmation (FR-DEL-02). */
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (loading) {
    return (
      <Page title="Property">
        <p>Loading property…</p>
      </Page>
    );
  }

  const property = properties.find((candidate) => candidate.id === id);

  // An ID that never existed and one that was just deleted read the same way (FR-DET-03).
  if (!property) {
    return (
      <Page title={TEXT.propertyNotFound}>
        <PropertyNotFound id={id} />
      </Page>
    );
  }

  return (
    <Page title={displayTitle(property)}>
      {/* FR-DET-02: Edit, Delete and Back to list. */}
      <div className={styles.actions}>
        <Link
          to={generatePath(PATHS.editProperty, { id: property.id })}
          className={styles.primaryAction}
        >
          Edit
        </Link>
        <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
          Delete
        </Button>
        <Link to={PATHS.properties} className={styles.back}>
          Back to list
        </Link>
      </div>

      <PropertyDetail property={property} />

      <DeletePropertyDialog
        property={confirmingDelete ? property : null}
        onCancel={() => setConfirmingDelete(false)}
        // The property being read no longer exists, so the page cannot stay (FR-DEL-05).
        onDeleted={() => navigate(PATHS.properties)}
      />
    </Page>
  );
}
