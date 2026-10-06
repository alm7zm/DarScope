import Page from '../components/ui/Page.jsx';
import Placeholder from '../components/ui/Placeholder.jsx';

/** Find and browse properties (SRS 4.3 and 6). */
export default function PropertyListPage() {
  return (
    <Page title="Properties">
      <Placeholder
        sections={[
          'Search box',
          'Search by meaning switch',
          'Filters',
          'Sort',
          'Table or cards',
          'Pagination',
        ]}
      />
    </Page>
  );
}
