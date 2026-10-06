import { useParams } from 'react-router';
import Page from '../components/ui/Page.jsx';
import Placeholder from '../components/ui/Placeholder.jsx';

/**
 * Add property and Edit property share this page and one form (SRS 5.1 and 5.2).
 * The URL has an `:id` only when editing.
 */
export default function PropertyFormPage() {
  const { id } = useParams();

  return (
    <Page title={id ? 'Edit property' : 'Add property'}>
      <Placeholder
        sections={['Grouped form', 'Inline errors', 'Save', 'Cancel']}
      />
    </Page>
  );
}
