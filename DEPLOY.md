# Deploy `survey-review-app`

Standalone repo for the **View surveys** review UI. Root `/` redirects to **`/surveys`**.

## Quick path (Vercel + GitHub)

1. Create a **new empty repository** on GitHub (e.g. `survey-review-app`).
2. From this folder on your machine:

   ```bash
   cd ~/survey-review-app
   git init
   git add .
   git commit -m "Initial commit: survey review UI"
   git branch -M main
   git remote add origin git@github.com:YOUR_ORG/survey-review-app.git
   git push -u origin main
   ```

3. [vercel.com](https://vercel.com) → **Add New Project** → import that repo → **Deploy**.

Every PR/branch gets a **preview URL**; `main` is **production** (e.g. `https://survey-review-app.vercel.app/surveys`).

### Custom subdomain

Vercel → Project → **Settings** → **Domains** → add `surveys-review.yourcompany.com` → add the **CNAME** in DNS as instructed.

## GitHub Actions (optional)

Add repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (see `.github/workflows/`). If you also connect the same repo in Vercel’s UI, you may get duplicate builds—use one method or the other.

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to `/surveys`.
