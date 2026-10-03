# Deployment

## Frontend: GitHub Pages

The `deploy-frontend.yml` workflow builds `frontend/` and deploys `frontend/dist` to GitHub Pages on pushes to `main` that change frontend files. It can also be run manually. Enable **Settings → Pages → Build and deployment → GitHub Actions** in the repository. The site URL is `https://justacreater27.github.io/MuseAI/`.

Add these repository Actions secrets before the first deployment:

- `VITE_API_URL`: the Vercel backend origin, such as `https://<vercel-project>.vercel.app` (no trailing slash)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`: `museai-ec4d3`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

Firebase web configuration is read from Vite environment variables. Authentication remains on Firebase project `museai-ec4d3`; no Firebase values are committed.
Add `justacreater27.github.io` to Firebase Authentication's authorized domains so Google and email authentication work from the Pages site.

## Backend: Vercel Hobby

Import `justacreater27/MuseAI` into Vercel and set the project root to the repository root. Vercel serves the existing FastAPI app from root `app.py` (which imports `backend.main:app`) using the root `requirements.txt` include of `backend/requirements.txt`. The backend URL has the form `https://<vercel-project>.vercel.app`.

Set these Vercel environment variables for production (and Preview if desired):

- `GEMINI_API_KEY`
- `GROQ_API_KEY`
- `FRONTEND_ORIGINS=https://justacreater27.github.io`

At least one AI provider key is needed for AI generation. `GEMINI_API_KEY` is also needed for trend embedding refresh. Optional social integration variables are `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_ACCESS_TOKEN`, `INSTAGRAM_ACCESS_TOKEN`, and `INSTAGRAM_BUSINESS_ACCOUNT_ID`. `MUSEAI_DATA_DIR` can select a writable data directory, but Vercel's function filesystem is ephemeral; JSON-backed user data is not durable across invocations/deployments.

The Vercel Hobby function duration is configured to 60 seconds. Frontend generation calls may need to account for that platform limit.

## Trend engine

The trend engine remains in `backend/trend_engine/`. It writes generated trend and RAG data to local JSON files, including files excluded from Git. A scheduled GitHub runner would discard those outputs at the end of each run, so automatic scheduling is not configured. Run it manually in an environment with the backend dependencies and `GEMINI_API_KEY` if needed.
