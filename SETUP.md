# Backend Initialization Guide

This guide will help you set up the Node.js + PostgreSQL backend for the dating app.

## Prerequisites

Before starting, make sure you have:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)

## Step 1: Install PostgreSQL

### Windows
1. Download PostgreSQL installer from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Remember the password you set for the `postgres` user
4. PostgreSQL will be installed as a service and start automatically

### Verify Installation
Open Command Prompt or PowerShell and run:
```bash
psql --version
```

## Step 2: Create the Database

Open PostgreSQL (pgAdmin or psql):

### Using pgAdmin (GUI)
1. Open pgAdmin 4
2. Right-click on "Databases" → "Create" → "Database"
3. Name it `dating_app_db`
4. Click "Save"

### Using psql (Command Line)
```bash
psql -U postgres
```
Then run:
```sql
CREATE DATABASE dating_app_db;
\q
```

## Step 3: Set Up Backend

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- express - Web framework
- pg - PostgreSQL client
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- cors - Cross-origin resource sharing
- dotenv - Environment variables

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and update the values:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dating_app_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production

# CORS
FRONTEND_URL=http://localhost:5173
```

**Important:** Replace `your_postgres_password_here` with the password you set during PostgreSQL installation.

### 3. Create Database Tables

Run the SQL schema to create all necessary tables:

**Using psql:**
```bash
psql -U postgres -d dating_app_db -f database/schema.sql
```

**Using pgAdmin:**
1. Open pgAdmin
2. Right-click on `dating_app_db` → "Query Tool"
3. Copy and paste contents of `backend/database/schema.sql`
4. Click "Execute"

This will create:
- `users` - User accounts and profiles
- `matches` - User matches
- `messages` - Chat messages
- `swipes` - Like/dislike swipes

## Step 4: Start the Backend Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

You should see:
```
🚀 Server is running on http://localhost:5000
✅ Connected to PostgreSQL database
✅ Database connection successful: ...
```

## Step 5: Test the Backend

Open your browser or use curl:

```bash
curl http://localhost:5000/health
```

Should return:
```json
{"status":"OK","message":"Dating app backend is running!"}
```

## Step 6: Configure Frontend

Create a `.env.local` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Testing the API

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "age": 25,
    "bio": "This is my bio"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### Database Connection Error
**Problem:** `❌ Database connection failed`

**Solutions:**
1. Check PostgreSQL is running:
   - Windows: Services → PostgreSQL
2. Verify credentials in `.env`
3. Check if database exists: `psql -U postgres -l`

### Port Already in Use
**Problem:** `EADDRINUSE: address already in use :::5000`

**Solutions:**
1. Change PORT in `.env`
2. Or kill the process: `netstat -ano | findstr :5000`

### Module Not Found
**Problem:** `Cannot find module '...'`

**Solution:**
```bash
cd backend
npm install
```

### Permission Denied
**Problem:** Database permission error

**Solution:**
Grant necessary permissions in PostgreSQL:
```sql
GRANT ALL PRIVILEGES ON DATABASE dating_app_db TO postgres;
```

## Next Steps

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Open browser: `http://localhost:5173`

The backend is now fully initialized and ready to use!
