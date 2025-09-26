# Admin Dashboard

This document describes the Admin Dashboard structure, how data fetching works, and how to extend the dashboard with new modules.

## Structure

The dashboard lives at the route `/admin` and is composed of modular components:

- `app/admin/page.tsx`
  - Loads the main dashboard component `AnalysisDashboard`.

- `components/analysis-dashboard.tsx`
  - Provides a clean layout with a collapsible sidebar and a main content area using primitives from `components/ui/sidebar`.
  - Sidebar sections are placeholders for modules (Applications, Reports, Emails, Settings). The content area only renders the active module.
  - Designed to be easily extended by adding more modules.

- `components/admin/applications-table.tsx`
  - Displays a paginated, filterable table of applications with actions.
  - Columns: Name, Submission Date, Analysis Status, Email Sent, Actions.
  - Actions include "View Report" and "Resend Email" (when email not sent).
  - Includes filters by status and by date range, a manual Refresh button, and lazy pagination controls.

- `components/admin/report-modal.tsx`
  - When clicking "View Report" in the table, opens a modal that loads the AI report for the selected application.
  - Displays summary information, total score, eligibility, and structured details (criteria results and recommendations) when available.
  - Uses progressive loading (modal opens immediately; content loads asynchronously).

## API Endpoints and Data Flow

Data is fetched from SQLite via `lib/database.ts` and surfaced through Next.js App Router API routes.

- `lib/database.ts`
  - `getApplications({ status?, dateFrom?, dateTo?, limit, offset })`: Returns a paginated list of applications joined with analysis summary fields.
  - `getReport(candidatureId)`: Returns a single candidature with its analysis payload (scores, eligibility, textual/structured report).

- `app/api/admin/applications/route.ts`
  - Method: GET
  - Query params: `page`, `pageSize`, `status`, `dateFrom`, `dateTo`
  - Returns: `{ page, pageSize, total, totalPages, items: ApplicationItem[] }`
  - Also enriches each item with an `emailSent` boolean derived from a local JSON log `email_sent_log.json` (fallback mechanism).

- `app/api/admin/applications/[id]/report/route.ts`
  - Method: GET
  - Returns the AI analysis report for a specific candidature ID, including `totalScore`, `isEligible`, `summary`, and `structured` details if present.

- `app/api/admin/applications/[id]/resend-email/route.ts`
  - Method: POST
  - Placeholder endpoint to trigger resending an email for a candidature.
  - For now, marks the application as sent in `email_sent_log.json` and returns `{ success: true }`.
  - You can replace the placeholder with a call to your Python email service/queue.

## Email Sent Status

- The table shows `✅` when email is marked as sent and `❌` when it is not.
- The status currently reads from `email_sent_log.json` at the project root as a simple persistence layer.
- The "Resend Email" button calls the resend endpoint; after success, the table refreshes automatically. The button disables during the request to prevent multiple uncontrolled resends.

## Extending the Dashboard with New Modules

1. Add a new module entry in `components/analysis-dashboard.tsx` sidebar and a conditional content block for its main view.
2. Create a new component under `components/admin/<your-module>.tsx` that renders the module UI.
3. If backend data is required, create a new API route under `app/api/admin/<your-module>/route.ts` and corresponding database access methods in `lib/database.ts`.
4. Reuse UI primitives from `components/ui/` (table, dialog, select, pagination, etc.) for a consistent look and feel.

## Wiring Real Email Resend

To replace the placeholder resend logic with the Python service:

- Update `app/api/admin/applications/[id]/resend-email/route.ts` to spawn your Python CLI or call a service endpoint that enqueues or sends the email.
- The repository includes email tooling under `ai_agent/src/my_email/` (e.g., `email_service.py`, `email_cli.py`).
- After successful send/enqueue, update `email_sent_log.json` or store the "sent" status in your database to reflect the change in the UI.

## Notes

- Pagination in the UI is simple (Previous/Next). The API returns `total` and `totalPages` if you want to implement page numbers.
- Date filters use ISO date strings and are applied with SQLite `date()` comparisons.
- The dashboard uses only existing UI primitives; no external UI dependency changes are required.
