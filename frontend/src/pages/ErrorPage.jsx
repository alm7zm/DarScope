import Button from '../components/ui/Button.jsx';
import Page from '../components/ui/Page.jsx';

/** Replaces a page that hit an unexpected error, so the user never sees a blank page (FR-FBK-03). */
export default function ErrorPage() {
  return (
    <Page title="Something went wrong">
      <p role="alert">
        This page hit an unexpected error. Reload to start again.
      </p>
      <Button variant="primary" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </Page>
  );
}
