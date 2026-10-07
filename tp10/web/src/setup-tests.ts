// Given. Adds the DOM matchers to expect(): toBeInTheDocument, toHaveTextContent, toHaveAttribute…
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

// Every test starts logged out, with the real fetch back.
afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});
