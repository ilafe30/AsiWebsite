## Auth Setup Guide

### 1) Install dependencies

```bash
pnpm add iron-session nodemailer bcryptjs
# or
npm i iron-session nodemailer bcryptjs
# or
yarn add iron-session nodemailer bcryptjs
```

uuid is already present in dependencies.

### 2) Environment variables

Create a `.env.local` in `AsiWebsite/` with:

```bash
# Session secret (32+ chars)
SESSION_PASSWORD=replace-with-a-long-random-secret

# Public app URL (used to build email verification link)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SMTP settings
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
FROM_EMAIL=no-reply@example.com
```

Notes:
- Use a strong `SESSION_PASSWORD` in production.
- If deploying to Vercel, set these in Project Settings → Environment Variables.

### 3) Database

- The auth tables are automatically created in `unified_extraction.db` at app start (via `AuthDatabaseService`).
- No manual migration step is required.

Tables created:
- `users` (hashed passwords, email verification flag)
- `email_verification_tokens` (one-time tokens with 24h expiry)

### 4) Routes added

- `POST /api/auth/register`: body `{ startupName, email, password }`. Sends verification email.
- `GET /api/auth/verify?token=...`: verifies email and redirects to `/login?verified=1`.
- `POST /api/auth/login`: body `{ email, password }`. Sets secure session cookie.
- `POST /api/auth/logout`: destroys session.

### 5) Pages and protection

- Login page posts to `/api/auth/login` and redirects to `/dashboardfortheuser` on success.
- Signup page posts to `/api/auth/register` and shows status/errors.
- Protected page: `app/dashboardfortheuser/page.tsx` (server component) reads session and shows user info.
- Middleware (`middleware.ts`) redirects unauthenticated users hitting `/dashboardfortheuser` to `/login`.

### 6) Security notes

- Passwords are hashed with `bcryptjs` (12 rounds) and never stored in plain text.
- Session cookie is `httpOnly`, `secure` in production, `sameSite=lax`, with 30 min inactivity timeout.
- Email verification tokens expire after 24h.

### 7) Run the app

```bash
pnpm dev
# or npm run dev / yarn dev
```

Visit `http://localhost:3000/signup` to create an account, verify via email, then login at `/login`.



