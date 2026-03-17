# PhishGuard Project Documentation

This folder contains professional technical documentation for developers and project owners.

## Documents

1. `01-architecture.md`
   - System architecture, runtime boundaries, and ownership view.
2. `02-database-schema.md`
   - Full database schema (backend `api` + `content` apps), relations, and ERD.
3. `03-user-flows.md`
   - End-to-end user and admin journeys from auth to moderation.
4. `04-backend-function-reference.md`
   - Backend function catalog with endpoint behavior and code snippets.
5. `05-frontend-function-reference.md`
   - Frontend service/context function catalog and integration patterns.
6. `06-api-endpoint-map.md`
   - API route map with methods, auth requirements, and consuming frontend modules.

## Scope

- Source of truth: this monorepo (`frontend` + `backend`).
- API style: Django REST Framework `SimpleRouter` + custom `@action` endpoints.
- Auth model: session authentication + CSRF protection.

## Intended Audience

- Developers implementing features or fixing bugs.
- Technical product owners tracking platform behavior and delivery impact.
- DevOps/release engineers validating deployment and integration contracts.
