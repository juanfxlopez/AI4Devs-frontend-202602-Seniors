---
project_name: 'LTI - Talent Tracking System'
user_name: 'Juanfer Lopez'
date: '2026-05-11'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules']
existing_patterns_found: 28
status: 'complete'
rule_count: 58
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Repo Layout

- Two packages: `frontend/` (React) and `backend/` (Express). Root `package.json` is minimal: it only pins root-level `dotenv` and points Prisma at `backend/prisma/schema.prisma`. Run installs and scripts inside `frontend/` or `backend/`; do not assume root has app devDependencies.

### Backend (`backend/`)

- Runtime: Node.js.
- Framework: Express `^4.19.2`.
- Language: TypeScript `^4.9.5`; `backend/tsconfig.json` uses `"module": "commonjs"`, `"target": "es5"`, `"strict": true`, `"outDir": "./dist"`, and only includes `src/**/*.ts` (Prisma seed lives under `prisma/` and is run via script, not via `tsc` include).
- ORM/DB: Prisma `^5.13.0` / `@prisma/client` `^5.13.0` with PostgreSQL.
- OpenAPI-related npm packages are present (`swagger-jsdoc`, `swagger-ui-express`) but there is no Swagger UI or JSDoc wiring in `src/` today; the hand-maintained spec is `backend/api-spec.yaml`.
- Tests: Jest `^29.7.0` with `ts-jest` `^29.1.2`; config at `backend/jest.config.js` (`preset: ts-jest`, `testEnvironment: node`).
- Lint/format: ESLint `^9.2.0`, Prettier `^3.2.5`, `eslint-config-prettier`, `eslint-plugin-prettier`; `backend/.prettierrc` uses `singleQuote: true` and `trailingComma: all`.
- Prisma generator `binaryTargets`: `["native", "debian-openssl-3.0.x"]`.

### Database (Docker)

- `docker-compose.yml` defines a single service `db` using image `postgres:18`, port `${DB_PORT}:5432`, credentials from `POSTGRES_*` env vars (`DB_PASSWORD`, `DB_USER`, `DB_NAME`). This is standard Postgres, not pgvector.

### Frontend (`frontend/`)

- Framework: React `^18.3.1` with Create React App `react-scripts@5.0.1`.
- Language: mixed JS and TS; `tsconfig.json` has `allowJs: true`, `strict: true`, `isolatedModules: true`, `jsx: "react-jsx"`.
- Routing: `react-router-dom` `^6.23.1`.
- UI: Bootstrap `^5.3.3`, React-Bootstrap `^2.10.2`, React Bootstrap Icons `^1.11.4`, `react-datepicker` `^6.9.0`.
- HTTP: active code paths use `fetch` in `AddCandidateForm.js` and `FileUploader.js`. `frontend/src/services/candidateService.js` uses `axios`, but `axios` is not listed in `frontend/package.json`; treat that file as broken or add the dependency before use.

### Domain Model (Prisma)

- Beyond candidates/education/work/resume, the schema includes recruiting entities: `Company`, `Employee`, `InterviewType`, `InterviewFlow`, `InterviewStep`, `Position`, `Application`, `Interview`. Any feature touching hiring flows must stay consistent across these relations and `backend/prisma/schema.prisma`.

## Critical Implementation Rules

### Language-Specific Rules

- Backend TypeScript strict mode is enabled. Avoid spreading `any`; narrow `unknown` in catches and add types at API boundaries when touching code.
- Backend is CommonJS. Do not introduce ESM-only runtime patterns unless the build/runtime contract is intentionally changed.
- Backend build/runtime: `npm run build` emits `backend/dist/`; `npm start` runs `node dist/index.js`.
- Frontend is mixed JS/TS. Match the file’s language. Prefer `.tsx` for new typed React; do not paste TypeScript-only syntax into existing `.js` files.
- Comments and UI strings are often Spanish; preserve meaning and use UTF-8 when editing.
- `backend/src/routes/positionRoutes.ts` mixes `import`/`export` with `require('express').Router()`; match local file style or normalize carefully if refactoring imports.

### Framework-Specific Rules

#### Backend: Express + Prisma

- `backend/src/index.ts` exports `app` and also calls `app.listen(...)`. Importing `app` for tests can start the server unless tests mock or refactor around that.
- `Express.Request` is extended with `prisma`, and middleware attaches a singleton `PrismaClient`. Domain models and some services also instantiate `new PrismaClient()`. Do not add a third access pattern; consolidate only with an explicit refactor.
- **Candidate POST mismatch:** `candidateRoutes` imports `addCandidate` from `candidateController`, but that symbol is a **re-export of the service** `addCandidate` from `candidateService`, not `addCandidateController`. The live POST `/candidates` response shape is therefore the service return value (`res.status(201).send(result)`), not the JSON wrapper from `addCandidateController`. If you change the route, align controller tests, client expectations, and `api-spec.yaml`.
- Routes: `/candidates` (candidate CRUD/stage updates), POST `/upload` (file upload), `/position/:id/candidates` and `/position/:id/interviewflow` (position-related reads). Keep new APIs consistent with this prefix style.
- Middleware order: JSON body parser and Prisma attachment run before routes; CORS allows `http://localhost:3000` with credentials (do not use `*` with credentials). Request logging runs **after** `/candidates`, `/upload`, and `/position` mounts, so those paths are not logged by that middleware.
- Uploads: Multer field name `file`, PDF and DOCX only, 10MB max; destination `../uploads/` relative to process CWD—verify when Docker or deployment cwd changes.
- Candidate persistence is not one transaction: candidate, educations, work experiences, and resume are separate saves. Use a Prisma `$transaction` if you change multi-table writes.
- Duplicate email: map Prisma `P2002` to a clear user-facing error (existing pattern in `candidateService`).

#### Frontend: CRA + React

- Stay within CRA unless migrating tooling; do not eject casually.
- `frontend/src/index.tsx` imports `./App`. With both `App.js` and `App.tsx` present, bundler resolution favors **`App.js`** for that import. The live recruiter UI routes live in **`App.js`**; `App.tsx` is CRA boilerplate—do not assume it is the app root.
- `Positions.tsx` is a **mock-data** list screen (Figma-aligned layout); the Kanban detail view uses `/position/:id/candidates` and `/position/:id/interviewflow`.
- Prefer React-Bootstrap and Bootstrap utilities for UI consistency.
- API base URL `http://localhost:3010` is hardcoded in components/service stubs. Prefer centralizing via `REACT_APP_*` if introducing env-based config.
- Upload uses `FormData` with field name `file` to match Multer.
- Keep date payloads as `YYYY-MM-DD` where the backend validator expects `DATE_REGEX`.

### Testing Rules

- Backend tests use `backend/jest.config.js` and `ts-jest`. Run from `backend/` with `npm test`.
- Test files (current set): `candidateController.test.ts`, `candidateService.test.ts`, `positionController.test.ts`, `positionService.test.ts`—under `presentation/controllers/` and `application/services/`. Follow existing Jest mock patterns for services and Prisma.
- `candidateController.test.ts` currently exercises **`updateCandidateStageController` only**; it does not cover POST candidate creation or `addCandidateController`.
- Frontend `package.json` sets `"test": "jest --config jest.config.js"` but **there is no `frontend/jest.config.js`**. Use `react-scripts test` or add a real Jest config before relying on `npm test` in `frontend/`.
- DB integration tests need an isolated database and migration/reset strategy; never point automated tests at shared dev data.

### Code Quality & Style Rules

- Format backend with `backend/.prettierrc` (single quotes, trailing commas).
- Prefer fixing ESLint issues over disabling rules inline.
- Keep backend layout: `routes/`, `presentation/controllers/`, `application/services/`, `application/validator.ts`, `domain/models/`.
- When changing API contracts, update validation in `validator.ts`, `backend/api-spec.yaml`, Prisma schema/migrations if persistence changes, frontend forms, and affected tests.
- **Spec vs code drift:** e.g. `Education.title` is `VarChar(250)` in Prisma but `validator.ts` may still cap title length at 100—treat `validator.ts` and `schema.prisma` as the source of truth and reconcile docs when you touch them.
- Avoid extra `console.log` on hot paths; existing logging is minimal.

### Development Workflow Rules

- Run commands from the package you changed (`backend/` or `frontend/`).
- Backend scripts: `npm run dev`, `npm run build`, `npm start`, `npm run start:prod`, `npm run prisma:generate`, `npm test`, `npm run seed` (runs `prisma/seed.ts` with `ts-node` and dotenv).
- Frontend scripts: `npm start`, `npm run build`; fix or replace `npm test` before use (see above).
- Database: from repo root, `docker-compose up -d`. From `backend/`: `npx prisma migrate dev`, `npx prisma generate`.
- On Windows, stop the running backend before `prisma generate` if the query engine DLL is locked.
- Env: compose uses `DB_*`; Prisma uses `DATABASE_URL` in `backend/.env`. Do not commit secrets; keep `.env` / `backend/.env` local and aligned with compose.

### Critical Don't-Miss Rules

- Do not assume POST `/candidates` returns the `addCandidateController` JSON shape; the route uses the **service** `addCandidate` directly.
- Do not add Prisma clients casually; the codebase already mixes request-scoped attachment and per-module clients.
- Do not change candidate payloads in only one layer—keep form, validator, API spec, schema, service, and tests aligned.
- Do not use `candidateService.js` (axios) until `axios` is declared in `frontend/package.json` or the module is switched to `fetch`.
- Do not edit `App.tsx` expecting it to drive the recruiter UI; **`App.js`** does.
- Do not treat `Positions.tsx` mock data as backed by the API without implementing wiring.
- Do not run `frontend npm test` as-is without a Jest config or switching to CRA’s test runner.
- Do not change the upload field name from `file`.
- Do not trust `api-spec.yaml` alone for limits—compare with `validator.ts` and `schema.prisma`.

---

## Usage Guidelines

**For AI Agents**

- Read this file before implementing any change.
- Follow the rules as written; if a rule must be violated, document why in the PR or commit.
- Prefer the smallest coherent change that keeps package boundaries and runtime contracts intact.

**For Humans**

- Keep this file lean; remove rules that become obvious or obsolete.
- Update the stack section when dependencies, scripts, Docker images, or tooling change.
- Revisit when repeated AI mistakes show gaps.

Last Updated: 2026-05-11
