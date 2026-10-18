# Node.js Backend 🚀

A backend development project built with **Node.js and Express.js**, demonstrating server setup, REST API development, request handling, and database integration.

## 📌 Overview

This repository contains my Node.js backend learning and development work. It includes Express server configuration, API routes for managing notes, and separate modules for application logic, database connectivity, and data models.

The project is designed to build a strong foundation in backend development and RESTful APIs.

## ✨ Features

- **Express.js server** — Set up and run a backend server.
- **REST API development** — Handle HTTP requests and responses.
- **JSON request handling** — Process JSON data using Express middleware.
- **Notes API** — Create and update notes using API endpoints.
- **Modular code structure** — Separate application, database, and model files.
- **Database integration setup** — Dedicated database connection module.
- **API testing** — Test endpoints using Postman.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| JavaScript | Application logic |
| npm | Package management |
| Postman | API testing |
| Database module | Database connectivity and configuration |

## 📂 Project Structure

```text
complete-backend/
│
├── src/
│   ├── app.js
│   ├── app2.js
│   ├── db/
│   │   └── db.js
│   └── models/
│       └── post.model.js
│
├── app3.js
├── server.js
├── server2.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### 1. Prerequisites

Install the following tools:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- [Postman](https://www.postman.com/) for API testing
- A database server, if required by the database configuration

### 2. Clone the Repository

```bash
git clone https://github.com/08DevashishSrivastava/Node-js.git
```

### 3. Navigate to the Project

```bash
cd Node-js
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Configure Environment Variables

If the project uses a database URL or other credentials, create a `.env` file in the project root and add the required variables.

```env
PORT=3000
DATABASE_URL=your_database_connection_string
```

Replace the example values with your actual configuration. Do not commit `.env` or expose passwords, API keys, or database credentials.

### 6. Start the Server

The project contains multiple server files. Run the entry point that matches the API you want to test.

For the notes API:

```bash
node server2.js
```

If configured correctly, the terminal should display:

```text
server is running on port 3000
```

The API will be available at:

`http://localhost:3000`

## 🔌 API Endpoints

The following endpoints apply to the notes API implemented in `src/app.js`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/notes` | Create a note |
| PATCH | `/notes/:index` | Update a note by its array index |

### Create a Note

**Request**

```http
POST http://localhost:3000/notes
Content-Type: application/json
```

**Example JSON body**

```json
{
  "title": "Learn Node.js",
  "description": "Practice Express REST APIs"
}
```

### Update a Note

**Request**

```http
PATCH http://localhost:3000/notes/0
Content-Type: application/json
```

**Example JSON body**

```json
{
  "description": "Learn Express and build REST APIs"
}
```

The index `0` refers to the first note in the in-memory notes array. Create a note before attempting to update it. Notes stored in an in-memory array are not retained after the server restarts.

## 🧪 Testing with Postman

1. Start the backend server.
2. Open Postman.
3. Select the required HTTP method.
4. Enter the endpoint URL.
5. For POST and PATCH requests, select **Body → raw → JSON**.
6. Enter your JSON data and click **Send**.
7. Review the response and status code.

## 🔐 Security Best Practices

- Keep credentials in environment variables.
- Never commit `.env` files or database passwords.
- Add `node_modules/` to `.gitignore`.
- Validate incoming request data.
- Handle errors and invalid request parameters.
- Use appropriate HTTP status codes.

## 🎯 Learning Objectives

Through this project, I am practicing:

- Node.js fundamentals
- Express.js application setup
- HTTP methods and REST APIs
- JSON middleware and request handling
- Modular backend architecture
- Database connectivity concepts
- API testing with Postman
- Git and GitHub version control

## 🚀 Future Improvements

- Add GET and DELETE endpoints for notes.
- Add request validation and centralized error handling.
- Connect the API to a persistent database.
- Implement CRUD operations.
- Add authentication and authorization.
- Write automated API tests.
- Add API documentation using Swagger.

## 👨‍💻 Author

**Devashish Srivastava**

GitHub: [@08DevashishSrivastava](https://github.com/08DevashishSrivastava)

---

⭐ If you find this project useful, consider giving the repository a star.

*Built while learning and practicing Node.js backend development.*
