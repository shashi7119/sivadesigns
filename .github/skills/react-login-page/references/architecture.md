# Architecture Reference

## Stack
- Create React App with React 18.
- React Router v6 routes in src/App.js.
- Context-based auth in src/context/AuthContext.js.
- Bootstrap and custom CSS for UI styling.
- axios for API requests.

## Important Paths
- App shell and route map: src/App.js
- Auth/session logic: src/context/AuthContext.js
- Login view: src/components/Login.js
- API helper module: src/services/api.js
- Invoice screen: src/components/Invoice.js
- Invoice tax helpers: src/components/invoiceUtils.js
- Invoice helper tests: src/components/invoiceUtils.test.js

## Routing Pattern
- Navigation and route definitions live in App.js.
- Protected pages use <Role allowedRoles={...} userRole={userRole}> wrappers.
- userRole is derived from localStorage user payload.

## Auth Pattern
- AuthContext exposes isAuthenticated, user, login, logout.
- login stores serialized user object in localStorage with key user.
- logout clears user state and localStorage user.

## API Integration Pattern
- Some modules use different API base URLs.
- Existing code supports multiple backend key names; do not remove fallbacks unless backend contract is stable.

## UI Change Safety
- Preserve current bootstrap/custom class structure unless redesign is requested.
- Keep naming and import style consistent with nearby component files.
