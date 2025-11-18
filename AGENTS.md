# Repository Guidelines

## Project Structure & Module Organization
- `frontend/` hosts the Vite + React client. Components live in `src/components`, hooks and contexts sit in `src/hooks` and `src/contexts`, while feature pages are grouped in `src/pages`. Static assets belong in `public/` or `src/assets`.
- `backend/` contains the Express API with folders for `src/controllers`, `src/routes`, `src/services`, and shared helpers in `src/utils`. Database shape and seeding scripts are maintained under `backend/prisma/`.
- Environment and deployment runbooks (e.g., `DEPLOYMENT.md`, `SUPABASE_*` guides) document hosting, Supabase configuration, and OTP procedures—review them before changing infra-sensitive code.

## Build, Test, and Development Commands
- Client: `cd frontend && npm install` once, then `npm run dev` for hot reload, `npm run build` for production bundles, `npm run preview` to smoke-test the build, and `npm run lint` for ESLint/Tailwind validation.
- API: `cd backend && npm install`, `npm run dev` launches Nodemon + TypeScript, `npm run build` compiles to `dist/`, `npm start` serves the compiled files. Database workflows rely on Prisma (`npm run prisma:migrate`, `npm run prisma:seed`).

## Coding Style & Naming Conventions
- TypeScript is standard on both sides; keep files in PascalCase for components (`UserTable.tsx`), camelCase for hooks/utilities, and kebab-case for routes. JSX uses 2-space indentation, trailing commas, and descriptive prop names.
- Run `npm run lint` (frontend) and rely on ESLint + Tailwind rules; backend formatting follows the TypeScript compiler plus clear doc-comments on exported functions.

## Testing Guidelines
- No automated suite ships yet; prefer Vitest + React Testing Library under `frontend/src/__tests__` and supertest-based integration specs under `backend/tests`. Name specs after the unit (`residentService.spec.ts`).
- Gate new features behind meaningful test coverage when touching services, parsers, or complex components; seed Prisma with lightweight fixtures for repeatable runs.

## Commit & Pull Request Guidelines
- Follow the existing imperative, Conventional-Commit-like style (`feat:`, `fix:`, `style:`) observed in `git log`. Keep commits scoped to a single concern and mention affected areas.
- Pull requests should include: a summary of changes, testing evidence (commands or screenshots), linked Linear/Jira issue IDs, and any Supabase or deployment considerations so reviewers can reproduce your setup.

## Security & Configuration Tips
- Keep secrets in `.env` files excluded from version control; never hard-code Supabase keys or SendGrid tokens. When updating Prisma schema or OTP flows, sync the change log inside `DEPLOYMENT_CHECKLIST.md` so operations stays aligned.

## Roles & Access Controls
- Youth registrants under 30 are automatically tagged as `KK_MEMBER`, granting only SK event registration (`/sk/event-registration`, `/events/my-registrations`) plus public announcements access. Keep their permissions scoped to `EVENT_REGISTRATION`, `MY_EVENT_REGISTRATIONS`, `PUBLIC_ANNOUNCEMENTS`, and `PUBLIC_EVENTS`.
- Registrants 30 and above default to `PARENT_RESIDENT` with daycare, health, and broader resident permissions; when seeding or adjusting roles ensure Prisma's `seed-new.ts` stays in sync with backend role validation lists.
