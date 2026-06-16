## Description

Provide a summary of the changes and the rationale behind them. Include any details on new dependencies, database changes, or API modifications.

## Related Issue

Link any resolved issues (e.g. `Fixes #12`).

## Type of Change

Please delete options that are not relevant:

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update (non-breaking change)

## Testing Checklist

Describe the tests you ran to verify your changes:
- [ ] **Backend tests**: Passed `pytest tests/` validation.
- [ ] **Frontend tests**: Passed Jest unit tests and Playwright E2E suites.
- [ ] **Type checking**: Next.js typescript check (`npm run build`) completed without compiler warnings.
- [ ] **Docker builds**: Validated build output on local Docker Compose.

## Checklist

- [ ] My code follows the style guidelines of this project (Black for Python, ESLint for JS).
- [ ] I have performed a self-review of my own code.
- [ ] I have commented my code, particularly in hard-to-understand areas.
- [ ] I have made corresponding changes to the documentation.
- [ ] My changes generate no new warnings or console errors.
