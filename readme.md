# Migrant Worker Healthcare System

## Overview

This repository contains a client-first web application called "Migrant Worker Healthcare System" — a lightweight healthcare record management system focused on migrant workers. It provides registration, visit tracking, document storage, QR-based quick access, multilingual UI, and simple admin tools. The app is built with Next.js (App Router) and stores data locally (localStorage) with field-level obfuscation and integrity checks for prototyping and low-infrastructure environments.

## Why this project exists

- Provide a portable, low-infrastructure solution for clinics and community health workers to manage basic health records for migrant workers.
- Allow quick identification and access to records via QR codes and a doctor-facing dashboard for triage and follow-ups.
- Demonstrate design patterns for offline-capable client apps with audit logging and simple storage management.

## Key features

- Worker registration and profile management
- Medical visit logging (visits, diagnoses, prescriptions, follow-ups)
- Document upload and management (prescriptions, lab reports)
- Doctor dashboard with search, filters, today’s patients, follow-up alerts and notifications
- Admin panel for system overview, storage stats, and import/export
- Multilingual UI (English, Malayalam, Hindi) via `useTranslations`
- Client-side audit logging and basic data integrity checks
 - Live camera QR scanning (BarcodeDetector) with a simulated fallback and deep-link handling to open printable health cards

## Tech stack

- Next.js 14 (App Router) + React + TypeScript
- Tailwind CSS for styling
- UI primitives in `components/ui/*` (cards, buttons, forms, tabs, selects)
- Utilities in `lib/*` (security, storage, data manager)
- Icons: `lucide-react`
- Local persistence: `localStorage` (with helper wrappers)

## Project structure (important files/folders)

- `app/` — Next.js routes (pages and subpages). Key routes are described below.
- `components/` — reusable UI primitives and `ThemeProvider`.
- `lib/` — application helpers: `utils.ts` (SecurityUtils, DataManager, storage helpers), `translations.ts`.
- `public/` — static assets (placeholder images).
- `styles/` and `app/globals.css` — global styling, Tailwind tokens and theme variables.
- `package.json` — scripts and dependencies.

## Page-by-page walkthrough

Note: file paths are under `app/`.

- `/` — `app/page.tsx` — Landing page and gateway. Language selector, primary CTAs (register, search, worker dashboard, doctor dashboard, admin).
- `/workers` — `app/workers/page.tsx` — List of registered workers, with option to register or view a worker.
- `/workers/register` — (form) Register a new worker, validate inputs, encrypt sensitive fields and store record in localStorage.
- `/workers/[id]` — Worker profile page: personal details, visits, documents, health card/QR. Subpages:
  - `add-visit` — Add a medical visit (doctor notes, diagnosis, prescription, follow-up date).
  - `documents/[id]` — View/download a specific document.
  - `health-card/[id]` — Printable / QR-enabled health card.
- `/workers/search` — Search interface supporting name, id, phone, location, blood group. Includes QR scanner route for quick lookup.
- `/doctors` — `app/doctors/page.tsx` — Doctor dashboard. Loads worker records from localStorage, verifies integrity, decrypts sensitive fields, shows today's patients, follow-up alerts, chronic-condition lists and notifications. Heavy client logic and filters.
- `/doctors/qr-scanner` — QR scanning helper to quickly open a worker profile.
 - `/doctors/qr-scanner` — QR scanning helper to quickly open a worker profile.
  - The scanner now supports live camera scanning in Chromium-based browsers using the `BarcodeDetector` API. When a QR payload contains a health-record JSON (for example: `{"id":"MW123","type":"health_record", ...}`) the scanner deep-links to `/workers/health-card/:id`. A simulated-scan button remains for demo/testing and for browsers without BarcodeDetector support.
- `/admin` — `app/admin/page.tsx` — Admin dashboard: system stats (workers, documents, storage), audit logs and import/export JSON for backup.
- `/security/audit-logs` — View and filter audit logs stored locally.
- `/storage/management` — Storage stats and cleanup utilities.
- `/system-status` — System health and configuration overview.
- `/help` — User help and documentation page.

Other nested routes exist (patients, prescriptions, documents) and follow the same patterns.

## Data model & storage

- Worker (decrypted): { workerId, fullName, dateOfBirth, gender, nativeState, nativeDistrict, currentAddress, phoneNumber, healthHistory, allergies, currentMedication, bloodGroup, consent, createdAt, lastModified }
- Encrypted worker stored shape: sensitive fields moved to `field_encrypted` (e.g., `healthHistory_encrypted`) plus `dataIntegrityHash` computed by `DataManager`.
- Documents: stored as `DocumentRecord` with base64 file data, metadata, checksum, versioning fields.
- Visit history: arrays stored with keys like `medical_visits_<workerId>`.
- Audit logs: `audit_logs` and `critical_audit_logs` kept in localStorage; helper functions append and prune logs.

Storage keys are consistent; helper classes in `lib/utils.ts` provide read/write, integrity verification and cleanup functions.

## Security & privacy notes

- Current encryption implementation (`SecurityUtils.encrypt`) is a simple XOR + base64 method intended for prototyping only. It obfuscates data but is not cryptographically secure.
- Storing sensitive medical data in `localStorage` is inherently risky (exposure to XSS, device compromise). For production, migrate to server-side storage or an encrypted client DB with authenticated access.
- Audit logs are client-side; in production logs should also be aggregated to a secure server for tamper-resistant auditing and compliance.
- Import/export produces unencrypted JSON backups. Protect backup files with a passphrase or move backups to server-side encrypted storage.

## How to run (local development)

The repository includes `package.json` scripts. `pnpm` is recommended because `pnpm-lock.yaml` is present.

Windows (cmd.exe):

```cmd
pnpm install
pnpm dev
```

Main scripts from `package.json`:

- `pnpm dev` — runs the Next.js dev server
- `pnpm build` — builds the project for production
- `pnpm start` — starts the production server after build
- `pnpm lint` — runs linting (if configured)

Open http://localhost:3000 after `pnpm dev` to use the app.

## Testing the QR scanner (live & simulated)

1. Open the app in a Chromium-based browser (Chrome/Edge) and visit:

   http://localhost:3000/doctors/qr-scanner

2. Click "Start Camera" and allow camera permission. Point a QR code at the camera.

- For testing, use the existing "Simulate QR Scan" button (works without camera).
- To test deep-link behavior, scan a QR that contains JSON like:

  {"id":"MW123","type":"health_record","name":"..."}

  That should navigate to /workers/health-card/MW123.
- If the browser does not support the BarcodeDetector API, the page will show a fallback note and you can use the Simulate QR Scan.

## Development notes

- The app is client-heavy; many pages use `"use client"` and depend on `localStorage` for data.
- If you intend to make the app multi-user or production-grade:
  1. Add authentication (doctors, admins, health workers).
  2. Replace ad-hoc encryption with secure crypto (Web Crypto API or server-side encryption with proper key management).
  3. Move sensitive storage to a server or an encrypted client store.

## Recommended next steps

1. Replace demo encryption with Web Crypto API (AES-GCM) and add secure key management.
2. Implement server-side storage and authentication for doctors/admins; provide optional offline sync.
3. Harden XSS protections and perform a security audit.
4. Add unit tests for `lib/utils.ts` (encryption, integrity hash, storage cleanup) and small E2E tests for main flows (register -> add visit -> view).
5. Populate this README with quick screenshots and a contributions section if the project will accept collaborators.

## Contribution

If you'd like me to implement any of the next steps (README expansion, unit tests, replace encryption with Web Crypto, or add server sync), tell me which one to do next and I'll implement it.

## License & contact

This repository currently does not include a license file. Add `LICENSE` if you plan to share or publish this project.

---

Generated on September 5, 2025 — overview and recommendations derived from the project files in this repository.
