# DentaCare Pro: Backend

REST API for the DentaCare Pro dental clinic system. It handles user accounts, treatment packages, appointments, treatment records and the AI assistant (Google Gemini).

Built with **Node.js, Express and TypeScript**. Data is stored in plain JSON files, so no database needs to be installed.

## Requirements

- Node.js 18 or newer
- npm
- A Google Gemini API key (optional; the AI features fall back to built-in answers without it)

## Getting started

```bash
cd backend
npm install
```

Create a `.env` file in this folder:

```env
PORT=5000
JWT_SECRET=replace_with_a_long_random_string
GEMINI_API_KEY=your_gemini_api_key
```

Run the server:

```bash
npm run dev
```

The API is now available at `http://localhost:5000`. Check it with `http://localhost:5000/api/health`.

> On Windows, `START_CLINIC.bat` in the project root installs everything and starts both the backend and the frontend.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Port to listen on. Default `5000`. |
| `JWT_SECRET` | Yes in production | Secret used to sign login tokens. A weak built-in fallback is used if it is missing, so always set your own. |
| `GEMINI_API_KEY` | No | Enables live AI answers. Without it, DentaBot uses canned Sinhala and English replies. |

Never commit your real `.env` file or share it in a zip.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the server with `ts-node`. |
| `npm start` | Same as `dev`. |

## Project structure

```
backend/
├── data/                 JSON data files, created automatically on first run
├── src/
│   ├── config/
│   │   └── jsonStore.ts  File-based storage (users, appointments, treatments, packages)
│   ├── controllers/      Request handling logic
│   ├── middleware/
│   │   └── authMiddleware.ts   JWT token reader
│   ├── routes/           Route definitions
│   └── index.ts          App entry point
├── .env
├── package.json
└── tsconfig.json
```

## API reference

Base URL: `http://localhost:5000/api`. Send the login token as `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Create an account (`name`, `email`, `password`, optional `role`, `phone`). |
| POST | `/auth/login` | Log in with `email` and `password`. Returns a token valid for 7 days. |

### Packages

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/packages` | List treatment packages. |
| POST | `/packages` | Create a package (`title`, `description`, `price`, `duration`). |
| DELETE | `/packages/:id` | Delete a package. |

Two default packages are created on first run: Teeth Scaling & Polishing (LKR 4,500, 30 mins) and Root Canal Therapy (LKR 15,000, 60 mins).

### Appointments

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/appointments` | List appointments. |
| POST | `/appointments` | Book an appointment (`date`, `time`, `reason`). |
| PUT | `/appointments/:id` | Update an appointment, for example its `status`. |

Status values: `Pending`, `Confirmed`, `Completed`, `Cancelled`.

### Treatments

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/treatments` | List treatment records. |
| POST | `/treatments` | Add a record (`patientName`, `procedure`, `notes`, `cost`). |

### AI assistant

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/ai/suggest` | Clinical suggestion from symptoms or a prompt. Also available as `/ai/analyze`. |
| POST | `/ai/chat` | Chat with DentaBot (`message`, optional `history`). |

The suggest endpoint can also create packages from text such as `Root Canal - LKR 15000` when `autoCreatePackages` is set to `true`.

### Health

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Returns `{ "status": "ok" }` when the server is running. |

## Data storage

Each collection is one file in `data/`: `users.json`, `appointments.json`, `treatments.json` and `packages.json`. To reset the system, stop the server and delete these files. They are recreated on the next start.

## Known limitations

This project is suited to demos and learning. Before using it with real patients, address the following:

- **Authorization is not enforced.** The `protect` middleware reads a token when one is sent, but never rejects a request without one. Anyone who can reach the API can read and change data.
- **Roles are not checked.** Any user can register as a `dentist` by sending `role` in the request, and role-specific actions are not restricted.
- **Data is not scoped per user.** Patients can see every appointment and treatment.
- **AI endpoints are open** and need no login.
- **CORS allows all origins** (`*`).
- **JSON file storage** rewrites the whole file on every change and has no locking, so it is not safe for many simultaneous users.
- **Passwords are hashed** with bcrypt, but there is no rate limiting or input validation yet.
- Old Mongoose files (`config/db.ts` and the files in `models/`) are left over and unused. They can be removed.

## Tech stack

Express 4, TypeScript, jsonwebtoken, bcryptjs, cors, dotenv, @google/generative-ai (model `gemini-2.5-flash`).
