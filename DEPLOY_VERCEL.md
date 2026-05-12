# Vercel Deployment Instructions

## Problem

Vercel's project cache is stale. The current Vercel project was imported when Python
backend files existed at the repository root (`requirements.txt`, `setup.py`, etc.).
Vercel cached the project type as **Python** and now ignores all config changes
(`.vercelignore`, `vercel.json`, `package.json` updates).

Evidence from recent git history:
- Commit `9ca625e`: "fix: Rename requirements.lock to hidden .deps file"
- Commit `74fd2a3`: "fix: Remove all Vercel Python-triggering files from backend/"
- Commit `f42b4ba`: "fix: Vercel detecting Python backend -- rename requirements.txt"

These fixes were correct but cannot work because **Vercel's cached project type
overrides all configuration files**.

## Verified: Current Project Structure is Clean

The following checks confirm the root directory is 100% frontend-only:

| Check | Result |
|-------|--------|
| Python files (`.py`) outside `backend/` | **None found** |
| `requirements.txt` at root | **Not present** |
| `pyproject.toml` at root | **Not present** |
| `Pipfile` at root | **Not present** |
| `setup.py` / `setup.cfg` at root | **Not present** |
| `.env` files committed | **None found** |
| `Dockerfile` at root | **Not present** |
| Root directory has | `package.json` + `vite.config.ts` + `vercel.json` |

### Root Level Files (Frontend Only)

```
.env.example        -- Example only, no secrets (safe to keep)
.gitignore          -- Standard frontend ignores
.vercelignore       -- Explicitly ignores backend/, docs/, .github/
README.md
SECURITY.md
components.json     -- shadcn/ui config
eslint.config.js
index.html          -- Vite entry point
info.md
package.json        -- Vite/React/TypeScript dependencies
package-lock.json
postcss.config.js
tailwind.config.js
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vercel.json         -- Explicit: "framework": "vite"
vite.config.ts      -- Vite + React plugin config
```

### Directory Layout

```
statementwise/
|-- .github/          # GitHub templates (ignored by Vercel)
|-- backend/          # Python FastAPI (ignored by Vercel via .vercelignore)
|-- docs/             # Documentation (ignored by Vercel)
|-- node_modules/     # npm packages (gitignored)
|-- public/           # Static assets for frontend
|-- src/              # React/TypeScript source code
|-- vercel.json       # Vite framework config + SPA rewrites
|-- package.json      # Frontend dependencies + Vite scripts
|-- vite.config.ts    # Vite build configuration
`-- ...config files
```

### Current Vercel Configuration (`vercel.json`)

```json
{
  "framework": "vite",
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}],
  "headers": [...]
}
```

### Current Vercel Ignore (`.vercelignore`)

```
backend/
docs/
.github/
```

### Current Package Scripts (`package.json`)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview"
  }
}
```

## Solution: Fresh Vercel Import (Required)

Only deleting and re-importing the project will clear the stale cache.

### Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Open https://vercel.com/dashboard
   - Find the "statementwise" project

2. **Delete the Existing Project**
   - Click the project -> Settings -> General
   - Scroll to **"Delete Project"**
   - Confirm deletion (this clears all cached project type data)

3. **Re-Import the Repository**
   - Go to https://vercel.com/new
   - Click **"Import Git Repository"**
   - Select: `attm1122/statementwise`
   - Vercel will scan the repo fresh and detect **Vite** from:
     - `package.json` (has `vite` dependency and `vite` scripts)
     - `vite.config.ts` (exists at root)
     - `vercel.json` (has `"framework": "vite"`)

4. **Verify Build Settings** (should auto-detect, but confirm):

   | Setting | Value |
   |---------|-------|
   | Framework Preset | **Vite** |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Root Directory | `./` (repository root) |
   | Install Command | `npm install` |

5. **Add Environment Variables** (if needed)
   - `VITE_API_URL` = `https://api.statementwiseai.com/v1`
   - Any other env vars from `.env.example`

6. **Click Deploy**

7. **Configure Custom Domain**
   - After successful deploy, go to Project -> Domains
   - Add: `statementwiseai.com`
   - Follow DNS instructions if needed

## Why This Is the Only Fix

| Approach | Why It Doesn't Work |
|----------|-------------------|
| Edit `vercel.json` | Cache overrides config changes |
| Edit `.vercelignore` | Cache ignores ignore-file changes |
| Push new commits | Cache still uses old project type |
| Rename `backend/` | Cache already locked the type |
| Clear deploy cache button | Only clears build cache, not project type cache |
| Re-link repository | Keeps the same cached project type |

**Only a full project deletion + fresh import** forces Vercel to re-scan the
repository from scratch with zero cached state.

## What Vercel Will See on Fresh Import

On a fresh import, Vercel's auto-detection runs in this order:

1. **Checks root directory** for framework signals
2. **Finds `package.json`** with `"vite"` in dependencies and scripts
3. **Finds `vite.config.ts`** at repository root
4. **Finds `vercel.json`** with `"framework": "vite"`
5. **Finds `index.html`** (Vite's entry point)
6. **No `requirements.txt`**, `pyproject.toml`, or `setup.py` at root
7. **Conclusion**: This is a **Vite** project -> use Node.js build pipeline

The `.vercelignore` file then excludes `backend/` from the uploaded files,
ensuring Vercel only sees the frontend code.

## Post-Deploy Checklist

- [ ] Frontend builds successfully (Node.js/Vite pipeline)
- [ ] SPA routing works (all paths serve `index.html`)
- [ ] API calls point to `api.statementwiseai.com`
- [ ] Custom domain `statementwiseai.com` is configured
- [ ] Security headers are applied (check in browser DevTools)
- [ ] Static assets are cached properly (`Cache-Control: immutable`)

## Notes

- **Do NOT** modify any source code for this fix -- the code is correct
- **Do NOT** delete backend files -- they are properly isolated in `backend/`
  and ignored by Vercel via `.vercelignore`
- The backend deploys separately (Fly.io / Render) via `backend/fly.toml`
  and `backend/render.yaml`
- If Vercel still shows Python after fresh import, check that the
  `main` branch on GitHub has all the cleanup commits (the git log shows
  the fixes are already committed and pushed)
