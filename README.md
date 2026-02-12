# To-Do List (Full-Stack)

A small full-stack to-do app: Node.js backend with SQLite, React frontend. You can add, edit, and delete tasks.

## What's in the repo

- **backend/** – Express server, REST API for tasks, SQLite DB
- **frontend/** – React (Vite) UI
- **docker-compose.yml** – run backend + frontend in containers

## Run locally (without Docker)

You need Node.js (v18 or similar) installed.

**Backend**

```bash
cd backend
npm install
npm start
```

Server runs at http://localhost:5000. The SQLite DB file is created in `backend/data/`.

**Frontend**

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The dev server proxies `/api` to the backend.

## Run with Docker

From the project root:

```bash
docker compose up --build
```

- Frontend: http://localhost (port 80)
- Backend API: http://localhost:5000

Data is stored in a Docker volume so it survives container restarts.

## How to use the app

1. **List** – Tasks are shown on the main page, newest first.
2. **Add** – Fill in “Title” (required) and optionally “Description”, then click “Add task”.
3. **Edit** – Click “Edit” on a task, change title/description, then “Save” or “Cancel”.
4. **Delete** – Click “Delete” on a task to remove it.

## Deploy on GCP

One way to run this on Google Cloud is with Cloud Run (containers) and optionally a DB. Below is a minimal path using the existing Docker setup.

**Prereqs**

- Google Cloud CLI (`gcloud`) installed and logged in.
- A GCP project. Set it: `gcloud config set project YOUR_PROJECT_ID`

**Option A: Run the whole stack with Docker on a VM**

1. Create a small Compute Engine VM (e.g. e2-micro) with Docker installed (or use a “Container-Optimized OS” image).
2. Clone this repo on the VM (or copy the project files).
3. Run:

   ```bash
   docker compose up -d
   ```

4. Open the VM’s external IP in the browser (port 80 for the app, or 5000 for API only). In the VM’s firewall / VPC, allow TCP 80 (and 5000 if you want direct API access).

**Option B: Backend and frontend as separate Cloud Run services**

1. **Backend**
   - Build and push the backend image to Artifact Registry (or Container Registry):
     ```bash
     gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/todo-backend ./backend
     ```
   - Create a Cloud Run service from that image, allow unauthenticated access if you want public API.
   - Note the service URL (e.g. `https://todo-backend-xxx.run.app`).

2. **Frontend**
   - The frontend talks to the backend via `/api`. For Cloud Run you’d either:
     - Build the frontend with an env var for the API base URL and use that in `fetch()`, then build a frontend image that serves the built static files (e.g. with nginx) and proxy `/api` to the backend URL, or
     - Run the current nginx image and set the backend host via env (would require a small change in the nginx config to use a variable).
   - Build and push the frontend image, then deploy to Cloud Run:
     ```bash
     gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/todo-frontend ./frontend
     gcloud run deploy todo-frontend --image gcr.io/YOUR_PROJECT_ID/todo-frontend --platform managed --allow-unauthenticated
     ```

3. **Database**  
   The app uses a local SQLite file. On Cloud Run the filesystem is ephemeral, so data is lost when the instance stops. For a real deployment you’d either:
   - Use Cloud SQL (PostgreSQL/MySQL) and change the backend to use that instead of SQLite, or
   - Use a persistent volume if your setup supports it (e.g. with GKE).

So for a quick “run the app on GCP” you can use Option A (single VM + Docker). For a more scalable setup, use Option B and switch the backend to Cloud SQL.

## API (backend)

- `GET /api/tasks` – list all tasks
- `GET /api/tasks/:id` – one task
- `POST /api/tasks` – create (body: `{ "title": "...", "description": "..." }`)
- `PUT /api/tasks/:id` – update (body: `{ "title": "...", "description": "..." }`)
- `DELETE /api/tasks/:id` – delete

## Improvement directions (functional, modern todo-app style)

- **Completed state** – Mark tasks done (checkbox) and keep them in the list; filter views: All / Active / Completed; optional “clear completed”.
- **Due dates and reminders** – Optional due date per task, sort or filter by due; optional reminder (e.g. notify on due or at a set time).
- **Priority** – Priority field (e.g. none / low / medium / high) with sort and filter; optional priority-based ordering in the list.
- **Subtasks** – Break a task into sub-items with their own completed state; show progress (e.g. “2/5 done”) in the main list.
- **Recurring tasks** – Repeat rule (daily, weekly, monthly, custom) so the task reappears after completion.
- **Search and filter** – Full-text search on title/description; filter by date range, priority, or tags.
- **Tags or lists** – Optional tags or “lists” (e.g. Work, Personal) to group tasks without replacing the single-list view.
- **Reorder** – Drag-and-drop or up/down controls to reorder tasks; persist order (e.g. `position` column or ordered IDs).
- **Keyboard and shortcuts** – Quick add (e.g. focus input on “N”), mark complete (e.g. Space on focused row), delete (e.g. Backspace), and optional command palette.
- **Undo** – Undo last delete or bulk complete (e.g. toast with “Undo” or a small history buffer).
- **Persistence and sync** – Keep current SQLite for local; add optional sync (e.g. per-user backend with PostgreSQL) so the same features work across devices.

## Tech

- Backend: Node.js, Express, better-sqlite3
- Frontend: React, Vite
- DB: SQLite (id, title, description, created_at, updated_at)
