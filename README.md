# Iraaya

Iraaya is an Indian handicrafts e-commerce platform connecting customers with handmade work and artisan traditions from across India.

## Tech stack

- **Frontend:** React, Vite, React Router, Axios, vanilla CSS
- **Backend:** Python, FastAPI, PyMongo
- **Database:** MongoDB Atlas
- **Authentication:** JWT with bcrypt password hashing
- **Image uploads:** Cloudinary
- **Deployment:** Vercel (frontend) and Render (backend)

## Project layout

```text
Iraaya/
├── frontend/     # React + Vite application
└── backend/      # FastAPI application and API routes
```

## Run locally

You need Python 3.11, Node.js, and a reachable MongoDB instance. The backend dependencies are pinned for Python 3.11; use that version when creating the virtual environment.

### 1. Configure the backend

In PowerShell, from the repository root:

```powershell
cd backend
Copy-Item .env.example .env
```

Edit `backend/.env` and set at least:

```env
MONGODB_URI=mongodb+srv://<database-user>:<encoded-password>@<your-cluster>.mongodb.net/iraaya?retryWrites=true&w=majority
SECRET_KEY=<a-long-random-secret>
```

For a local MongoDB instance, use its connection URI instead. If using Atlas, make sure the cluster is active and the machine's IP address is in the Atlas project's **Network Access** list. URL-encode special characters in the database password when it is part of the URI. Cloudinary values are needed for admin image uploads.

Create and activate the Python 3.11 environment, then install the backend dependencies:

```powershell
py -3.11 -m venv .venv311
.\.venv311\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Start the API from the `backend` directory:

```powershell
uvicorn main:app --reload
```

The API runs at <http://127.0.0.1:8000>. Interactive API documentation is at <http://127.0.0.1:8000/docs>, and the health endpoint is <http://127.0.0.1:8000/health>.

### 2. Run the frontend

Open a second terminal at the repository root:

```powershell
cd frontend
npm install
npm run dev
```

The Vite development server is usually at <http://localhost:5173>. `frontend/.env` can set the API base URL:

```env
VITE_API_URL=http://localhost:8000
```

Restart Vite after changing frontend environment variables.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `SECRET_KEY` | Secret used to sign JWTs; use a unique random value outside local development |
| `ALGORITHM` | JWT signing algorithm (currently `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT lifetime in minutes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for image uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `ADMIN_EMAIL` | Admin account email |
| `ADMIN_PASSWORD` | Admin account password; set a unique strong value |
| `VITE_API_URL` | Backend URL used by the frontend at build time |

Use `backend/.env.example` as a template. Never commit `.env` files or put server-side secrets in frontend environment variables.

## Privacy and deployment

The project is intended to run locally unless you choose otherwise. Nothing has been deployed or published by this project setup. Keep any GitHub repository private if you use GitHub, and do not deploy to a public Render or Vercel URL unless you explicitly want the site and API accessible online. Hosting access controls depend on the plan and settings you choose.

Never commit `.env` files or put server-side secrets in frontend environment variables. `backend/.env.example` contains blank values only; copy it to `backend/.env` and fill it in locally. If you later choose to deploy, configure secrets in the host's private environment settings and restrict backend CORS to the frontend URL.

## Current scope

The project includes product browsing, state and category filters, authentication, cart, wishlist, reviews, admin product management, and Cloudinary upload support. Payment processing is not configured; checkout is left for a later integration.
