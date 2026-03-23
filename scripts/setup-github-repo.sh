#!/usr/bin/env bash
# Run in Terminal.app (full disk access). Creates local git + optional GitHub repo.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f package.json ]]; then
  echo "Error: run from survey-review-app (package.json missing)."
  exit 1
fi

if [[ ! -d .git ]]; then
  git init
  git add -A
  git commit -m "Initial commit: survey review UI"
  git branch -M main
  echo "Local git repo created."
else
  echo "Git already initialized."
fi

REPO_NAME="${1:-survey-review-app}"

if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    echo "Creating GitHub repo and pushing with GitHub CLI..."
    gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
    echo "Done. Repo: https://github.com/$(gh api user -q .login)/$REPO_NAME"
    exit 0
  fi
  echo "GitHub CLI is installed but not logged in. Run: gh auth login"
else
  echo "GitHub CLI (gh) not found. Install: brew install gh"
fi

echo ""
echo "Manual steps:"
echo "  1. Create an empty repo at https://github.com/new (name: $REPO_NAME, no README)"
echo "  2. Then run (use YOUR username/org):"
echo "     git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
echo "     git push -u origin main"
echo ""
