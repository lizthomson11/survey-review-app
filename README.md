# Survey review app

Small **Next.js** app with a single **View surveys** screen (left nav + summary cards + responses table). Use it for **design review** and **Vercel preview URLs** without coupling to other products.

- **Local:** `npm install && npm run dev` → [http://localhost:3000](http://localhost:3000) (redirects to `/surveys`)
- **Deploy:** see [DEPLOY.md](./DEPLOY.md)

## Put this on GitHub (one command)

Cursor / some environments cannot create `.git` or talk to GitHub for you. On your Mac, open **Terminal.app** and run:

```bash
cd ~/survey-review-app
bash scripts/setup-github-repo.sh
```

Optional: pass a repo name: `bash scripts/setup-github-repo.sh my-survey-ui`

If you have [GitHub CLI](https://cli.github.com/) installed and logged in (`brew install gh` then `gh auth login`), the script creates the remote repo and pushes. Otherwise it prints the exact `git remote` / `git push` steps after you create an empty repo on [github.com/new](https://github.com/new).

## Stack

Next.js 14 (App Router), TypeScript, Tailwind CSS, Radix primitives (select, progress), Lucide icons.
