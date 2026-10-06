import Page from '../components/ui/Page.jsx';
import Placeholder from '../components/ui/Placeholder.jsx';

/** The portfolio at a glance (SRS 4.2). */
export default function DashboardPage() {
  return (
    <Page title="Dashboard">
      <Placeholder
        sections={[
          'Summary figures',
          'City table',
          'Needs-attention list',
          'Shortcuts',
        ]}
      />
    </Page>
  );
}
