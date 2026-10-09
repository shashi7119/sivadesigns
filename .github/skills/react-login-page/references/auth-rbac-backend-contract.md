# JWT + RBAC Backend Contract

This frontend now supports backend-driven RBAC with JWT authentication.

## Login Endpoint
- Preferred endpoint: POST /login
- Backward fallback endpoint: POST /users

Request payload:

```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

Accepted response shapes (any one):

```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin"
  },
  "roles": ["admin"],
  "permissions": [
    "planning.view",
    "batch.view",
    "invoice.list.view"
  ]
}
```

or

```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": 1,
    "roles": ["admin"],
    "permissions": ["*"]
  }
}
```

## Permission Keys Used by Frontend
- home.view
- profile.view
- settings.view
- machine.view
- customer.view
- vendor.view
- fabric.view
- construction.view
- process.view
- width.view
- sfinishing.view
- greyentry.view
- planning.view
- labentry.view
- batch.view
- batch.details.view
- batch.edit.view
- storeentry.view
- delivery.view
- finishing.view
- pstock.view
- bstock.view
- invoice.create.view
- invoice.list.view
- return.view
- reports.view
- purchase-order.view
- purchase-order.list.view
- purchase-order.edit.view
- purchase-order.print.view
- mrs.view
- process-route.view

## Notes
- If `permissions` are present, frontend checks permissions first.
- If `permissions` are not present, frontend falls back to legacy role checks.
- `*` grants full access.
- Prefix wildcard works (example: `invoice.*` matches invoice.create.view and invoice.list.view).
- JWT is sent as `Authorization: Bearer <token>` on all axios requests after login.
- 401 responses clear the local session and redirect to /login.
