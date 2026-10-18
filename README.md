# Node.js Notes App with MongoDB

This project is a full-stack notes and image-post application built with Node.js, Express, MongoDB/Mongoose, ImageKit, and a Vite React frontend. Notes and image-post metadata are persisted in MongoDB. Image content is uploaded to ImageKit and its returned URL is stored with each post.

## Overview

The project contains:

- A canonical backend in the project root (`server.js`, `src/app.js`, `src/models/post.model.js`, `src/db/db.js`)
- A Vite frontend in `backend/frontend/Devashish`
- A MongoDB-backed notes and image-post API with validation and health checks
- Image uploads using ImageKit's official Node.js SDK
- Environment-based configuration for database and CORS settings

## Tech stack

- Node.js
- Express.js
- MongoDB + Mongoose
- React + Vite
- dotenv
- CORS
- ImageKit Node.js SDK

## Canonical project structure

```text
Node-js-main/
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── server.js
├── src/
│   ├── app.js
│   ├── db/
│   │   └── db.js
│   ├── models/
│   │   ├── post.model.js
│   │   └── photo-post.model.js
│   └── services/
│       └── storage.services.js
├── backend/
│   ├── app3.js
│   ├── server.js
│   ├── server2.js
│   └── frontend/
│       └── Devashish/
│           ├── index.html
│           ├── package.json
│           ├── vite.config.js
│           └── src/
├── frontend/
│   └── Devashish/
└── duplicate folders kept for reference only
```

The root application is the working source of truth. The duplicate folders were checked and are not the canonical backend/frontend implementation.

## Prerequisites

- Node.js 18+ recommended
- npm
- MongoDB Community Edition, MongoDB Atlas, or a reachable MongoDB instance
- A browser for the frontend

## Environment variables

Create a `.env` file in the project root based on `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/node_js_app
CLIENT_URL=http://localhost:5173
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

Image uploads require a valid ImageKit **private key** from the ImageKit dashboard. Replace the sample placeholder in root `.env` with a rotated key, restart the backend, then use **Check configuration again** in the frontend. This key is only used on the backend; do not add it to any `VITE_*` variable or frontend environment file. Image URLs and file IDs come from ImageKit's upload response.

Important:

- Never commit `.env` or real credentials.
- `.env` is ignored by Git.
- Do not hardcode database passwords or API secrets in source files.
- If you use MongoDB Atlas, set `MONGO_URI` to your Atlas connection string instead of a local URI.
- A previously hardcoded ImageKit key was found in a legacy copy and has been removed. Treat that key as compromised and rotate it in the ImageKit dashboard before configuring uploads.

## Install dependencies

From the project root:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
```

From the frontend folder:

```powershell
cd backend/frontend/Devashish
npm install
```

## Run the backend

Start the backend from the project root. Both `server.js` and the legacy
`backend/server.js` entry point now start the same API:

```powershell
Set-Location C:\Users\devas\Downloads\Node-js-main\Node-js-main
npm start
```

Alternatively, from the `backend` directory run `npm start`. The database
connection is required before the API starts; if MongoDB is unavailable, start
MongoDB or update the root `.env` `MONGO_URI` before trying again.

The backend will fail fast if MongoDB is not reachable and will print a clear error like:

```text
MongoDB connection failed: connect ECONNREFUSED 127.0.0.1:27017
```

## Run the frontend

```powershell
Set-Location C:\Users\devas\Downloads\Node-js-main\Node-js-main\backend\frontend\Devashish
npm run dev
```

Then open:

```text
http://localhost:5173
```

## API endpoints

Base URL:

```text
http://localhost:5000/api
```

### Health check

```http
GET /api/health
```

Example response:

```json
{
  "success": true,
  "message": "Backend and database are healthy.",
  "data": {
    "status": "healthy",
    "dbConnected": true,
    "dbState": 1,
    "timestamp": "2026-10-18T00:00:00.000Z"
  }
}
```

### Get all notes

```http
GET /api/notes
```

### Get one note

```http
GET /api/notes/:id
```

### Create a note

```http
POST /api/notes
Content-Type: application/json
```

Request body:

```json
{
  "title": "Learn Node.js",
  "description": "Practice Express and MongoDB"
}
```

### Update a note

```http
PATCH /api/notes/:id
Content-Type: application/json
```

Example body:

```json
{
  "description": "Updated description"
}
```

### Delete a note

```http
DELETE /api/notes/:id
```

### Image posts

```http
GET    /api/posts
POST   /api/posts
DELETE /api/posts/:id
```

`POST /api/posts` accepts `multipart/form-data` with:

- `image` — required JPEG, PNG, GIF, or WebP image (maximum 5 MB)
- `caption` — required text up to 500 characters

The server validates the image type and content, uploads the image to ImageKit,
then persists `caption` and the returned `imageUrl` in MongoDB. If ImageKit is
not configured, the endpoint returns `503` and does not create a post.
Deleting a post removes its ImageKit file and its MongoDB record. The legacy
`GET /posts` and `POST /create-post` paths remain available; use `/api/posts`
in new clients.

## MongoDB setup

### Local MongoDB

1. Install MongoDB locally.
2. Start the MongoDB service from an elevated PowerShell terminal if installed as a Windows service:

```powershell
Start-Service MongoDB
```

If the MongoDB service has a different name or is not installed as a service,
start `mongod.exe` with a writable data directory:

```powershell
mongod.exe --dbpath C:\data\db
```

Keep that terminal open while running the backend.
3. Use:

```env
MONGO_URI=mongodb://127.0.0.1:27017/node_js_app
```

### MongoDB Atlas

Use your Atlas connection string, such as:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/node_js_app
```

## Frontend behavior

The Vite frontend:

- Loads existing notes from the backend
- Submits new notes to `POST /api/notes`
- Allows editing note descriptions via `PATCH /api/notes/:id`
- Deletes notes via `DELETE /api/notes/:id`
- Shows loading, validation, empty, and error states
- Uses `VITE_API_URL` if defined; otherwise it defaults to `http://localhost:5000/api`
- Uploads images and displays persisted image posts when ImageKit is configured
- Displays a clear upload error when ImageKit credentials are not configured

The frontend environment template is `backend/frontend/Devashish/.env.example`.
If you change the backend address, copy it to that folder's `.env` and set
`VITE_API_URL` to the full API base URL.

## Troubleshooting

### MongoDB connection errors

- Check whether MongoDB is running.
- Confirm the `MONGO_URI` is correct.
- Verify the database host and port.
- Confirm your local database or Atlas credentials are valid.

### Port conflicts

- Backend default port is `5000`.
- Frontend default Vite port is `5173`.
- If needed, change the ports in `.env` and `vite.config.js`.

### CORS errors

- Ensure `CLIENT_URL` matches your frontend origin.
- For local Vite, use `http://localhost:5173`.
- Backend CORS rules allow only configured origins.

### Missing environment variables

- Make sure `.env` exists.
- Check the variable names shown in `.env.example`.

### Dependency failures

- Reinstall from the correct folder.
- Remove lockfiles and `node_modules` if necessary, then reinstall.
- Ensure you are using the project root for backend dependencies and `backend/frontend/Devashish` for frontend dependencies.

## Security notes

- Keep all credentials in `.env` and never commit them.
- Do not print secret values in logs or documentation.
- The ImageKit private key must be kept out of source control and rotated if exposed in the past.

## Verification status

The current implementation was verified against the running local MongoDB:

- Backend syntax checks, including compatibility entry points: pass
- Frontend production build: pass
- `/api/health`: HTTP 200 and `dbConnected: true`
- Notes create, list, get-one, update, delete, invalid payload, invalid ID, and not-found: pass
- CORS allowed origin and preflight: pass; unconfigured origin rejected
- Image-post listing on canonical and legacy routes: pass
- Multipart image validation and missing ImageKit configuration: HTTP 503, with no false MongoDB post created
- ImageKit upload to the external service: not verified because `IMAGEKIT_PRIVATE_KEY` is not configured in this environment

## Final notes

The project uses the root app as its canonical backend. Notes work with MongoDB alone; image-post uploads additionally require the user to configure a valid ImageKit private key in the root `.env`.
