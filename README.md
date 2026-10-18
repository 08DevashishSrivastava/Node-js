# Devashish Notes

A full-stack notes and image-post application built with React, Express, MongoDB, and ImageKit. Create and manage notes, search your collection, and share image posts from a clean, responsive dashboard.

Notes and image-post metadata are stored in MongoDB. When ImageKit is configured, image files are uploaded there and the returned image URLs are saved with their posts.

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

## Features

- Create, browse, search, edit, and delete notes backed by MongoDB
- Responsive dashboard with note counts, readable timestamps, and empty/loading/error states
- Edit notes in an in-app dialog; confirm before deleting a note
- Create and browse image posts with captions
- Validate image type, file content, and size before upload
- Store uploaded image URLs and post metadata in MongoDB
- Check backend, database, and ImageKit configuration through the health endpoint

Image uploads require a valid ImageKit private key. Notes work without ImageKit credentials.

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

Image uploads require a valid ImageKit **private key** from the ImageKit dashboard. Replace the sample placeholder in root `.env` with a rotated key, restart the backend, then use **Check configuration again** in the frontend. The key is only used by the backend; never add it to a `VITE_*` variable or frontend environment file. Image URLs and file IDs come from ImageKit's upload response.

Important:

- Never commit `.env` or real credentials.
- `.env` is ignored by Git.
- Do not hardcode database passwords or API secrets in source files.
- If you use MongoDB Atlas, set `MONGO_URI` to your Atlas connection string instead of a local URI.
- A previously hardcoded ImageKit key was found in a legacy copy and has been removed. Treat that key as compromised and rotate it in the ImageKit dashboard before configuring uploads.

## Install dependencies

Open PowerShell in the project root:

```powershell
Set-Location C:\Users\devas\Downloads\Node-js-main\Node-js-main
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
```

Install frontend dependencies in a second PowerShell window:

```powershell
Set-Location C:\Users\devas\Downloads\Node-js-main\Node-js-main\backend\frontend\Devashish
npm install
```

## Run the backend

Start MongoDB first, then start the API in a PowerShell window:

```powershell
Set-Location C:\Users\devas\Downloads\Node-js-main\Node-js-main
npm start
```

The backend connects to MongoDB before listening. If the database is unavailable, the backend exits with an error instead of starting in a broken state.

The backend will fail fast if MongoDB is not reachable and will print a clear error like:

```text
MongoDB connection failed: connect ECONNREFUSED 127.0.0.1:27017
```

## Run the frontend

In a second PowerShell window:

```powershell
Set-Location C:\Users\devas\Downloads\Node-js-main\Node-js-main\backend\frontend\Devashish
npm run dev
```

Open:

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
    "imageKitConfigured": false,
    "timestamp": "2026-10-18T00:00:00.000Z"
  }
}
```

`imageKitConfigured` is `true` only when the backend has a non-placeholder ImageKit private key. A healthy database does not require ImageKit to be configured.

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

Both `title` and `description` can be included in the update request. At least one field is required.

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

The Vite frontend loads and manages notes through the API, with title/description validation, searchable note cards, an edit dialog, and delete confirmation. It also loads, creates, and deletes image posts. Upload is disabled until the backend confirms ImageKit is configured, and the UI explains how to set up the private key.

The API base URL is `VITE_API_URL` when set; otherwise it defaults to `http://localhost:5000/api`.

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

The current implementation has been verified against a running local MongoDB:

- Backend syntax checks, including compatibility entry points: pass
- Frontend production build: pass
- `/api/health`: HTTP 200 and `dbConnected: true`
- Notes create, list, get-one, update, delete, invalid payload, invalid ID, and not-found: pass
- CORS allowed origin and preflight: pass; unconfigured origin rejected
- Image-post listing on canonical and legacy routes: pass
- Multipart image validation and missing ImageKit configuration: HTTP 503, with no false MongoDB post created
- ImageKit upload to the external service: not verified because `IMAGEKIT_PRIVATE_KEY` is not configured in this environment
- Note search and edit-dialog open/close behavior: verified in the browser

# Node.js Authentication API

A backend authentication project built using Node.js, Express.js, MongoDB, and JSON Web Tokens (JWT). It provides a registration endpoint for creating user accounts and issuing authentication tokens.

## Features

- User registration using username, email, and password
- Express.js REST API
- MongoDB database integration using Mongoose
- JWT token generation
- HTTP cookie support using `cookie-parser`
- Environment-based configuration
- JSON request and response handling

## Tech Stack

- **Runtime:** Node.js
- **Backend:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication tokens:** JSON Web Token (JWT)
- **Environment configuration:** dotenv
- **Cookie handling:** cookie-parser

## Project Structure

```text
Authenthication/
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── src/
    ├── app.js
    ├── .env
    ├── controllers/
    │   └── auth.controller.js
    ├── db/
    │   └── db.js
    ├── models/
    │   └── user.model.js
    └── routes/
        └── auth.routes.js
```

## Prerequisites

- Node.js and npm
- A running MongoDB instance or MongoDB Atlas database
- Postman for API testing

## Installation

Clone the repository:

```bash
git clone https://github.com/08DevashishSrivastava/Node-js.git
cd Node-js
```

Install dependencies:

```bash
npm install
```

## Environment Configuration

Create `src/.env` and configure the required variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Replace the example values with your own configuration. Never commit `.env` files or expose database credentials and JWT secrets.

## Run the Server

Start the backend from the project root:

```bash
node server.js
```

The server should connect to MongoDB and start listening on the configured port.

## API Documentation

### Register a User

**Endpoint:** `POST /api/auth/register`

**Local URL:**

```text
http://localhost:3000/api/auth/register
```

**Headers:**

```text
Content-Type: application/json
```

**Request body:**

```json
{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "your-password"
}
```

**Expected success response:** HTTP `201 Created`

```json
{Devashish Notes
A full-stack notes and image-post application built with React, Express, MongoDB, and ImageKit. Create and manage notes, search your collection, and share image posts from a clean, responsive dashboard.

Notes and image-post metadata are stored in MongoDB. When ImageKit is configured, image files are uploaded there and the returned image URLs are saved with their posts.

Overview
The project contains:

A canonical backend in the project root (server.js, src/app.js, src/models/post.model.js, src/db/db.js)
A Vite frontend in backend/frontend/Devashish
A MongoDB-backed notes and image-post API with validation and health checks
Image uploads using ImageKit's official Node.js SDK
Environment-based configuration for database and CORS settings
Tech stack
Node.js
Express.js
MongoDB + Mongoose
React + Vite
dotenv
CORS
ImageKit Node.js SDK
Canonical project structure
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
The root application is the working source of truth. The duplicate folders were checked and are not the canonical backend/frontend implementation.

Features
Create, browse, search, edit, and delete notes backed by MongoDB
Responsive dashboard with note counts, readable timestamps, and empty/loading/error states
Edit notes in an in-app dialog; confirm before deleting a note
Create and browse image posts with captions
Validate image type, file content, and size before upload
Store uploaded image URLs and post metadata in MongoDB
Check backend, database, and ImageKit configuration through the health endpoint
Image uploads require a valid ImageKit private key. Notes work without ImageKit credentials.

Prerequisites
Node.js 18+ recommended
npm
MongoDB Community Edition, MongoDB Atlas, or a reachable MongoDB instance
A browser for the frontend
Environment variables
Create a .env file in the project root based on .env.example:

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/node_js_app
CLIENT_URL=http://localhost:5173
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
Image uploads require a valid ImageKit private key from the ImageKit dashboard. Replace the sample placeholder in root .env with a rotated key, restart the backend, then use Check configuration again in the frontend. The key is only used by the backend; never add it to a VITE_* variable or frontend environment file. Image URLs and file IDs come from ImageKit's upload response.

Important:

Never commit .env or real credentials.
.env is ignored by Git.
Do not hardcode database passwords or API secrets in source files.
If you use MongoDB Atlas, set MONGO_URI to your Atlas connection string instead of a local URI.
A previously hardcoded ImageKit key was found in a legacy copy and has been removed. Treat that key as compromised and rotate it in the ImageKit dashboard before configuring uploads.
Install dependencies
Open PowerShell in the project root:

Set-Location C:\Users\devas\Downloads\Node-js-main\Node-js-main
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
Install frontend dependencies in a second PowerShell window:

Set-Location C:\Users\devas\Downloads\Node-js-main\Node-js-main\backend\frontend\Devashish
npm install
Run the backend
Start MongoDB first, then start the API in a PowerShell window:

Set-Location C:\Users\devas\Downloads\Node-js-main\Node-js-main
npm start
The backend connects to MongoDB before listening. If the database is unavailable, the backend exits with an error instead of starting in a broken state.

The backend will fail fast if MongoDB is not reachable and will print a clear error like:

MongoDB connection failed: connect ECONNREFUSED 127.0.0.1:27017
Run the frontend
In a second PowerShell window:

Set-Location C:\Users\devas\Downloads\Node-js-main\Node-js-main\backend\frontend\Devashish
npm run dev
Open:

http://localhost:5173
API endpoints
Base URL:

http://localhost:5000/api
Health check
GET /api/health
Example response:

{
  "success": true,
  "message": "Backend and database are healthy.",
  "data": {
    "status": "healthy",
    "dbConnected": true,
    "dbState": 1,
    "imageKitConfigured": false,
    "timestamp": "2026-10-18T00:00:00.000Z"
  }
}
imageKitConfigured is true only when the backend has a non-placeholder ImageKit private key. A healthy database does not require ImageKit to be configured.

Get all notes
GET /api/notes
Get one note
GET /api/notes/:id
Create a note
POST /api/notes
Content-Type: application/json
Request body:

{
  "title": "Learn Node.js",
  "description": "Practice Express and MongoDB"
}
Update a note
PATCH /api/notes/:id
Content-Type: application/json
Example body:

{
  "description": "Updated description"
}
Both title and description can be included in the update request. At least one field is required.

Delete a note
DELETE /api/notes/:id
Image posts
GET    /api/posts
POST   /api/posts
DELETE /api/posts/:id
POST /api/posts accepts multipart/form-data with:

image — required JPEG, PNG, GIF, or WebP image (maximum 5 MB)
caption — required text up to 500 characters
The server validates the image type and content, uploads the image to ImageKit, then persists caption and the returned imageUrl in MongoDB. If ImageKit is not configured, the endpoint returns 503 and does not create a post. Deleting a post removes its ImageKit file and its MongoDB record. The legacy GET /posts and POST /create-post paths remain available; use /api/posts in new clients.

MongoDB setup
Local MongoDB
Install MongoDB locally.
Start the MongoDB service from an elevated PowerShell terminal if installed as a Windows service:
Start-Service MongoDB
If the MongoDB service has a different name or is not installed as a service, start mongod.exe with a writable data directory:

mongod.exe --dbpath C:\data\db
Keep that terminal open while running the backend. 3. Use:

MONGO_URI=mongodb://127.0.0.1:27017/node_js_app
MongoDB Atlas
Use your Atlas connection string, such as:

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/node_js_app
Frontend behavior
The Vite frontend loads and manages notes through the API, with title/description validation, searchable note cards, an edit dialog, and delete confirmation. It also loads, creates, and deletes image posts. Upload is disabled until the backend confirms ImageKit is configured, and the UI explains how to set up the private key.

The API base URL is VITE_API_URL when set; otherwise it defaults to http://localhost:5000/api.

The frontend environment template is backend/frontend/Devashish/.env.example. If you change the backend address, copy it to that folder's .env and set VITE_API_URL to the full API base URL.

Troubleshooting
MongoDB connection errors
Check whether MongoDB is running.
Confirm the MONGO_URI is correct.
Verify the database host and port.
Confirm your local database or Atlas credentials are valid.
Port conflicts
Backend default port is 5000.
Frontend default Vite port is 5173.
If needed, change the ports in .env and vite.config.js.
CORS errors
Ensure CLIENT_URL matches your frontend origin.
For local Vite, use http://localhost:5173.
Backend CORS rules allow only configured origins.
Missing environment variables
Make sure .env exists.
Check the variable names shown in .env.example.
Dependency failures
Reinstall from the correct folder.
Remove lockfiles and node_modules if necessary, then reinstall.
Ensure you are using the project root for backend dependencies and backend/frontend/Devashish for frontend dependencies.
Security notes
Keep all credentials in .env and never commit them.
Do not print secret values in logs or documentation.
The ImageKit private key must be kept out of source control and rotated if exposed in the past.
Verification status
The current implementation has been verified against a running local MongoDB:

Backend syntax checks, including compatibility entry points: pass
Frontend production build: pass
/api/health: HTTP 200 and dbConnected: true
Notes create, list, get-one, update, delete, invalid payload, invalid ID, and not-found: pass
CORS allowed origin and preflight: pass; unconfigured origin rejected
Image-post listing on canonical and legacy routes: pass
Multipart image validation and missing ImageKit configuration: HTTP 503, with no false MongoDB post created
ImageKit upload to the external service: not verified because IMAGEKIT_PRIVATE_KEY is not configured in this environment
Note search and edit-dialog open/close behavior: verified in the browser
Final notes
The project uses the root app as its canonical backend. Notes work with MongoDB alone; image-post uploads additionally require the user to configure a valid ImageKit private key in the root .env.
  "message": "User registered successfully",
  "user": {
    "_id": "generated-user-id",
    "username": "testuser",
    "email": "testuser@example.com"
  },
  "token": "generated-jwt-token"
}
```

The exact response depends on the user schema and controller implementation. The token is also set in a cookie by the registration controller.

### Common HTTP Status Codes

| Status | Meaning                                        |
| ------ | ---------------------------------------------- |
| `201`  | User registered successfully                   |
| `400`  | Required registration fields are missing       |
| `409`  | Email is already registered                    |
| `500`  | Registration failed due to a server-side error |

These responses depend on the implemented controller and error handling.

## Testing with Postman

1. Start the backend using `node server.js`.
2. Create a new Postman request.
3. Select the `POST` method.
4. Enter `http://localhost:3000/api/auth/register`.
5. Select **Body → raw → JSON**.
6. Send a JSON request containing `username`, `email`, and `password`.
7. Check the response status and server terminal output.

## Security Notes

- Never upload `.env` files or real credentials to GitHub.
- Passwords must be hashed using a suitable password-hashing library such as `bcryptjs` before storing them in a production database.
- Use a strong, private JWT secret.
- Add appropriate token expiration and cookie security settings before production deployment.
- Validate user input and handle duplicate email addresses.

**Current scope:** This README documents the registration endpoint. Login, logout, and protected routes should only be documented once they are implemented and tested.

## Author

**Devashish Srivastava**

GitHub: [08DevashishSrivastava](https://github.com/08DevashishSrivastava)

## License

Add a license if you intend to distribute this project as open source.



## Final notes

The project uses the root app as its canonical backend. Notes work with MongoDB alone; image-post uploads additionally require the user to configure a valid ImageKit private key in the root `.env`.
