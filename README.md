# Dating App - Full Stack

A modern dating app built with React + Vite frontend and Node.js + PostgreSQL backend.

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd dating-app
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Set up PostgreSQL database:
```bash
# Create database
psql -U postgres
CREATE DATABASE dating_app_db;

# Run schema
psql -U postgres -d dating_app_db -f database/schema.sql
```

Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

From the root directory:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Project Structure

```
dating-app/
├── backend/                 # Node.js + Express backend
│   ├── config/             # Database configuration
│   ├── controllers/         # Business logic
│   ├── routes/              # API routes
│   ├── middleware/          # Auth middleware
│   └── database/            # SQL schemas
├── src/                     # React frontend
│   ├── components/          # React components
│   ├── pages/               # Page components
│   └── lib/                 # Utilities
└── public/                  # Static assets
```

## API Documentation

See `backend/README.md` for detailed API documentation.

## Development

- Frontend: `npm run dev` (port 5173)
- Backend: `cd backend && npm run dev` (port 5000)

## Building for Production

Frontend:
```bash
npm run build
```

Backend:
```bash
cd backend
npm start
```
