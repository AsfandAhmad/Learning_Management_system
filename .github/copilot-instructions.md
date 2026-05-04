## Quick orientation for AI coding agents

This repository is a full-stack Learning Management System (React + Vite client, Node/Express server, MySQL via mysql2). Use these notes to be immediately productive.

High-level architecture
- Client: `client/` — React + Vite app. Dev: `client` -> `npm run dev` (runs `vite`). Build: `npm run build`.
- Server: `server/` — Node (ES modules) + Express. Entry: `server/src/server.js` which loads `server/src/app.js` and verifies DB connection before listening.
- Database: MySQL accessed via `server/src/config/db.js` using `mysql2/promise` and a connection pool (`pool`). There are SQL migration files under `server/db/` and `server/src/db/init.js` (script: `npm run db:init`).
- File storage: `uploads/` (served at `/uploads` by `app.js`) and static `public/` served by express.static.

Important patterns and conventions
- ES modules: package.json uses "type": "module" — import/export syntax everywhere.
- Route layout: `server/src/app.js` mounts route groups with clear prefixes. Examples:
  - Auth: `/api/auth` -> `server/src/routes/auth.routes.js`
  - Courses: `/api/courses` -> `server/src/routes/courses.routes.js` with nested sections/assignments/quizzes
  - Questions: note `question.routes.js` is exposed under both `/api/courses/:courseId/questions` and `/api/questions` in places — watch for duplicate mounts.
- Auth: JWT-based. Middleware `server/src/middleware/auth.js` provides `isAuth`, `isInstructor`, `isStudent`, `isAdmin`. Tokens must be sent as `Authorization: Bearer <token>`.
- DB access: controllers import `pool` from `server/src/config/db.js` and use `pool.query()` or get connections/transactions via `pool.getConnection()`. Many controllers detect missing tables gracefully (catching `ER_NO_SUCH_TABLE`) — infer migrations may be optional for dev.
- Transactions: Long multi-step operations (e.g., `createCourse`, `registerTeacher`) use manual transactions and `connection.release()` in finally blocks.
- File uploads: helper `server/src/utils/fileUpload.js` is used (see `auth.routes.js` for CV uploads). Files are stored under `uploads/` and served via `app.use('/uploads', ...)`.

Developer workflows (how to run & debug)
- Start server in dev mode (auto-restart): cd `server` then `npm run dev` (uses nodemon -> runs `src/server.js`).
- Start client in dev mode: cd `client` then `npm run dev` (vite). Client expects the API at `/api/*` (proxy is handled in code or platform).
- Initialize or seed DB (if present): from `server` run `npm run db:init` (runs `node src/db/init.js`).
- Cloud-related scripts: `npm run test-cloud` and `npm run migrate-cloud` exist in `server/package.json`.

Environment variables the agent should consider
- `JWT_SECRET` — required for authentication token signing/verification.
- DB: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `DB_SSL`, `DB_SSL_REJECT_UNAUTHORIZED` — see `server/src/config/db.js` for defaults and logging.
- `PORT` — server listen port.

Code style and small conventions to follow in PRs
- Prefer existing SQL + pool usage pattern (raw SQL queries in controllers). Keep queries in controllers unless refactoring; controllers intentionally mix query text and small helper functions inside the same file (see `courses.controller.js`).
- Keep ES module imports and top-level await avoidance (follow existing `async` functions).
- When touching transactional code, follow the pattern: `const connection = await pool.getConnection(); await connection.beginTransaction(); try { ... await connection.commit(); } catch { await connection.rollback(); } finally { connection.release(); }`.

Where to look for examples
- Authentication flow: `server/src/routes/auth.routes.js` + `server/src/controllers/auth.controller.js` + `server/src/middleware/auth.js`.
- Course model and nested resources: `server/src/controllers/courses.controller.js` and `server/src/routes/courses.routes.js` (shows section/lesson/enrollment patterns).
- File serving & uploading: `server/src/routes/file.routes.js`, `server/src/utils/fileUpload.js`, and `app.js` static mounts.

Safety notes for changes
- Tests are not present; validate runtime via local dev runs (`npm run dev` in both `server` and `client`).
- DB migrations may be incomplete; many controller files guard against missing DB tables. When adding schema-dependent features, update `server/db/` SQL and `src/db/init.js` accordingly.

If anything above is unclear or you'd like more detail (API surface, sample requests, or schema mapping), tell me which area to expand and I will update this file.
