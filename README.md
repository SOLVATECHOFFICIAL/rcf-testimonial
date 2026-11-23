# Redeemed Christian Fellowship (RCF) — Official Website

A fast, mobile-first, Firebase-backed web application for **Redeemed Christian Fellowship (RCF)** built with React, TypeScript, Vite, Tailwind CSS, and Firebase (Authentication + Cloud Firestore).

## Features
- **Homepage (`/`)**: Welcoming fellowship introduction, RCF branding (`RCF.webp`), quick actions (Join RCF, Share Your Testimony, LastWord), live announcements, upcoming activities, and contact details.
- **Member Registration (`/register`)**: Fast public form with no password required, conditional fields for **Member**, **Worker**, and **Executive**, dynamic units/portfolios from Firestore settings, duplicate-submission prevention, and unique generated Member ID (`RCF-YYYY-XXXXXX`).
- **Welcome & Testimony Dashboard (`/welcome`)**: Warm member greeting and a **Facebook-style colored-card testimony composer** with 10 accessible color presets, live preview, automatic contrast adjustment, and explicit Sunday-sharing consent.
- **Protected Admin Dashboard (`/admin`)**: Google Sign-In restricted to authorized administrators (`rcflasuedepe12@gmail.com` initial super-admin + role directory in `/admins`), featuring:
  - **Overview**: Real Firestore member, worker, executive, and testimony statistics + recent submissions.
  - **Members, Workers & Executives**: Searchable, filterable directory with edit modal and CSV export.
  - **Testimonies**: Full colored card archive with exact Nigerian timestamps (`Africa/Lagos`), search/filters, copy, single-card print, separate presentation-copy editing, and Sunday list selection.
  - **Sunday Testimony List**: Order consented testimonies, set service date/title, copy, print/export to PDF, and save lists to Firestore.
  - **Announcements & Settings**: Manage public announcements, LastWord URL, configurable units & executive portfolios, About RCF content, and authorized admins.
- **About (`/about`), LastWord (`/lastword`), and Privacy Notice (`/privacy`)**.

---

## Environment Variables

Copy `.env.example` to `.env.local` for local development or add these in Vercel Project Settings:

| Variable | Description |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain (`<project>.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | Optional named Firestore database ID (leave empty for `(default)`) |
| `VITE_FIREBASE_APPCHECK_SITE_KEY` | Optional reCAPTCHA v3 site key for Firebase App Check |

Never commit `.env`, `.env.local`, or service account private key JSON files to GitHub.

---

## Firebase Console Setup & Initial Admin Provisioning

1. **Create / Open Firebase Project**:
   - In the [Firebase Console](https://console.firebase.google.com/), create a project (or use the provisioned project).
   - Register a **Web App** and copy the SDK values into `.env.local` / Vercel Environment Variables.
2. **Enable Google Authentication**:
   - Go to **Authentication → Sign-in method → Google**, enable it, and set a support email.
3. **Create Cloud Firestore**:
   - Go to **Firestore Database → Create database** in Production mode.
4. **Deploy Security Rules**:
   - Install Firebase CLI (`npm install -g firebase-tools`), run `firebase login`, select your project (`firebase use <project-id>`), and deploy rules:
     ```bash
     firebase deploy --only firestore:rules
     ```
5. **Provision Initial Administrator (`rcflasuedepe12@gmail.com`)**:
   - The security rules (`firestore.rules`) securely bootstrap `rcflasuedepe12@gmail.com` **only** when authenticated via Google with `email_verified == true`.
   - Visit `/admin` and sign in with `rcflasuedepe12@gmail.com`. On first verified sign-in, the app registers the `superAdmin` record in `/admins/{uid}`.
   - Additional admins can then be added from **Admin Dashboard → Settings → Authorized Administrators** using their Firebase UID and verified email.
6. **Add Authorized Domains**:
   - In **Authentication → Settings → Authorized domains**, add your Vercel domain (e.g., `your-app.vercel.app`) and any custom domain.
7. **Configure LastWord URL**:
   - Sign in at `/admin`, open **Settings**, enter your official **LastWord URL** (starting with `https://`), and click **Save All Settings**.

---

## Local Development & Tests

```bash
npm install
npm run test
npm run build
npm run dev
```

---

## GitHub & Vercel Deployment

1. Push this repository to GitHub (`.gitignore` excludes secrets and build artifacts).
2. Log in to [Vercel](https://vercel.com/) and click **Add New → Project**, then import your GitHub repository.
3. Framework preset: **Vite** (`npm run build`, output directory `dist`). `vercel.json` is already included so `/register`, `/welcome`, `/admin`, `/about`, `/lastword`, and `/privacy` route properly.
4. Add all `VITE_FIREBASE_*` environment variables in Vercel Project Settings.
5. Click **Deploy**.
6. Copy the deployed `.vercel.app` hostname and add it to **Firebase Console → Authentication → Settings → Authorized domains**.
7. Verify on the live URL:
   - Register a test member on `/register` and confirm the record in Firestore.
   - Submit a testimony on `/welcome` and confirm the timestamp and consent flag.
   - Sign in on `/admin` with `rcflasuedepe12@gmail.com` (authorized) and test denying a non-admin Google account.
