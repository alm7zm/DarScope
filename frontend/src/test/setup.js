import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest runs without global test functions here, so React Testing Library cannot register its
// own cleanup. Unmount after every test so that tests never see each other's output.
afterEach(cleanup);
