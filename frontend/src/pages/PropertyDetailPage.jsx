import Page from '../components/ui/Page.jsx';
import Placeholder from '../components/ui/Placeholder.jsx';

/** Read one property in full (SRS 4.4). The property's ID is the `:id` part of the URL. */
export default function PropertyDetailPage() {
  return (
    <Page title="Property detail">
      <Placeholder
        sections={['Field groups', 'Edit', 'Delete', 'Market panel']}
      />
    </Page>
  );
}
