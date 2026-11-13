import { useState } from 'react';
import { Link, generatePath, useNavigate, useParams } from 'react-router';
import DeletePropertyDialog from '../components/properties/DeletePropertyDialog.jsx';
import PropertyDetail from '../components/properties/PropertyDetail.jsx';
import PropertyNotFound from '../components/properties/PropertyNotFound.jsx';
import Button, { ButtonLink } from '../components/ui/Button.jsx';
import Page from '../components/ui/Page.jsx';
import { LoadError, Loading } from '../components/ui/PageStates.jsx';
import { TEXT } from '../constants/messages.js';
import { useServerProperty } from '../hooks/useServerProperty.js';
import { PATHS } from '../routes/paths.js';
import { displayTitle } from '../utils/format.js';
import styles from './PropertyDetailPage.module.css';

/**
 * Read one property in full (SRS 4.4). The property's ID is the `:id` part of the URL, and the
 * page asks the server for it by that ID (Part 2 brief, requirement 3).
 */
export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { property, notFound, error, retry } = useServerProperty(id);
  /** True while the delete is awaiting confirmation (FR-DEL-02). */
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (error) {
    return (
      <Page title="Property">
        <LoadError reason={error} onRetry={retry} />
      </Page>
    );
  }

  // An ID that never existed and one that was just deleted read the same way (FR-DET-03).
  if (notFound) {
    return (
      <Page title={TEXT.propertyNotFound}>
        <PropertyNotFound id={id} />
      </Page>
    );
  }

  if (!property) {
    return (
      <Page title="Property">
        <Loading message="Loading property…" />
      </Page>
    );
  }

  return (
    <Page
      title={displayTitle(property)}
      description={`Property ${property.id}`}
      actions={
        /* FR-DET-02: Edit, Delete and Back to list. */
        <div className={styles.actions}>
          <ButtonLink
            variant="primary"
            to={generatePath(PATHS.editProperty, { id: property.id })}
          >
            Edit
          </ButtonLink>
          <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
            Delete
          </Button>
          <Link to={PATHS.properties} className={styles.back}>
            Back to list
          </Link>
        </div>
      }
    >
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
