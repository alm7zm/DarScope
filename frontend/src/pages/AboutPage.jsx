import Page from '../components/ui/Page.jsx';
import Placeholder from '../components/ui/Placeholder.jsx';

/** Identifies the team and the course (SRS 8.1). */
export default function AboutPage() {
  return (
    <Page title="About">
      <Placeholder sections={['Names', 'Student IDs', 'Course', 'Credits']} />
    </Page>
  );
}
