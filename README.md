# Budget App Coursework Enhancement

This is a vanilla HTML/CSS/JavaScript budget management app enhanced for CPT304 Software Engineering 2. It keeps the original income, expense, balance, list, edit, delete, and chart workflow, while adding maintainability, accessibility, privacy, persistence, internationalisation, and automated tests.

## Features

- Add, edit, and delete income and expense transactions.
- Calculates total income, total expense, and current balance.
- Keeps the existing canvas chart summary.
- Persists budget records in browser localStorage with damaged-data fallback.
- English and Chinese language switching with saved preference.
- Accessible form labels, inline validation errors, keyboard-friendly buttons, and aria-live updates.
- Cookie banner with saved consent and a standalone privacy policy page.
- Vitest unit tests with coverage reporting.

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

## Run Tests

```bash
npm run test
```

## Generate Coverage

```bash
npm run coverage
```

The HTML coverage report is generated in `coverage/index.html`.

## Build

```bash
npm run build
```

The static production build is generated in `dist/`.

## Preview Build

```bash
npm run preview
```

## Deployment on Vercel

1. Push the repository to GitHub.
2. Go to Vercel and create a New Project.
3. Import the GitHub repository.
4. Use the following settings:
   - Framework Preset: Vite
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click Deploy.
6. After deployment, copy the production URL into `live-url.txt`.
7. Keep the deployment live for at least 7 consecutive days and capture the Vercel deployment/uptime evidence for the coursework report.

Vercel can auto-detect this as a Vite project from `package.json`, so a separate `vercel.json` is not required.

## Coursework Evidence

See `docs/deficiency-notes.md` for four suggested deficiency write-ups and Before vs. After code locations.
