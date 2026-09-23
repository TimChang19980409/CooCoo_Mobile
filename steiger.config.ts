import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // The first entity and feature are referenced by the home page only.
    // Dependency direction, public API, and cross-slice rules stay enabled.
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
]);
