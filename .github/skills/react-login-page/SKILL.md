---
name: react-login-page
description: 'Use for this Create React App codebase with role-based routing, AuthContext login, axios API integration, invoice and purchase-order workflows, and invoice tax/print logic. Trigger for tasks like add route, fix auth flow, update invoice rendering, normalize API responses, or add tests.'
argument-hint: 'task=<routing|auth|invoice|api|testing>'
user-invocable: true
---

# React Login Page Project Skill

## Purpose
Use this skill for implementation work in this repository when tasks touch routing, authentication, API calls, invoice behavior, printing, or tests.

## When To Use
- Add or update screens under src/components.
- Change route access logic in the app shell.
- Update login/session behavior.
- Integrate backend payloads with inconsistent field names.
- Fix invoice tax logic, print output, or customer detail rendering.
- Add or update unit tests for invoice helpers.

## Fast Context Loading
1. Read architecture notes: [architecture reference](./references/architecture.md)
2. Read invoice-specific patterns first for invoice tasks: [invoice workflow](./references/invoice-workflow.md)
3. Read test guidance before creating tests: [testing reference](./references/testing.md)

## Default Procedure
1. Confirm task scope and impacted files.
2. Read the target component and related helpers before editing.
3. Preserve existing patterns for route protection and state shape.
4. Prefer defensive normalization when consuming API values.
5. Implement the smallest safe change.
6. Run focused tests first, then broader checks when needed.
7. Summarize behavior changes and residual risks.

## Project-Specific Rules
- Keep route protection consistent with Role wrappers used in App routing.
- Keep auth state source-of-truth in AuthContext and localStorage key user.
- For invoice buyer data, keep normalized keys: name, address1, address2, city, pincode, state, gstin, contact.
- Sanitize literal string values such as undefined and null before rendering printable output.
- Preserve existing API compatibility fallbacks (customerId/customer_id/customerID and similar variants).

## Done Criteria
- Build/test command used is documented in the response.
- No unrelated refactors.
- Route/auth/invoice behavior remains backward compatible unless task requires breaking changes.
