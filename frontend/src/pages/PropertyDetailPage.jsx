import { Link, generatePath, useParams } from 'react-router';
import PropertyDetail from '../components/properties/PropertyDetail.jsx';
import PropertyNotFound from '../components/properties/PropertyNotFound.jsx';
import Page from '../components/ui/Page.jsx';
import { TEXT } from '../constants/messages.js';
import { usePortfolio } from '../hooks/usePortfolio.js';
import { PATHS } from '../routes/paths.js';
import { displayTitle } from '../utils/format.js';
import styles from './PropertyDetailPage.module.css';

/** Read one property in full (SRS 4.4). The property's ID is the `:id` part of the URL. */
export default function PropertyDetailPage() {
  const { id } = useParams();
  const { properties, loading } = usePortfolio();

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
      {/* FR-DET-02. Delete joins these in task 7, once the confirmation dialog exists. */}
      <div className={styles.actions}>
        <Link
          to={generatePath(PATHS.editProperty, { id: property.id })}
          className={styles.primaryAction}
        >
          Edit
        </Link>
        <Link to={PATHS.properties} className={styles.back}>
          Back to list
        </Link>
      </div>

      <PropertyDetail property={property} />
    </Page>
  );
}
