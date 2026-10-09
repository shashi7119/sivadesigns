# Testing Reference

## Commands
- Install dependencies: npm install
- Run dev server: npm start
- Run all tests once: npm test -- --watch=false
- Run invoice helper tests: npm test -- invoiceUtils.test.js --watch=false
- Build production bundle: npm run build

## Testing Priorities
- Prefer targeted tests for helper-only changes.
- For invoice tax math, test both cgst_sgst and igst paths.
- Include invalid or empty input cases for normalization logic.

## Minimum Validation Before Completion
1. Run relevant unit tests for changed helpers.
2. If route/auth code changed, perform a quick manual path check through login and one protected route.
3. If invoice print logic changed, verify no undefined/null placeholders appear in rendered output.
