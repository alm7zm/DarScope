import Page from '../components/ui/Page.jsx';
import Placeholder from '../components/ui/Placeholder.jsx';

/** Market statistics from the 2021 reference listings (SRS 7.4). */
export default function MarketInsightsPage() {
  return (
    <Page title="Market insights">
      <Placeholder
        sections={['Tables or charts by city, bedrooms and district']}
      />
    </Page>
  );
}
