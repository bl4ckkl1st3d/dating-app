# Dating App Backend

A Node.js backend with Express and PostgreSQL for the dating app.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)

## Setup Instructions

### 1. Install PostgreSQL

If you haven't installed PostgreSQL yet:

**Windows:**
- Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
- Run the installer
- Remember the postgres user password you set

### 2. Create Database

Open PostgreSQL (pgAdmin or psql) and create a new database:

```sql
CREATE DATABASE dating_app_db;
```

Or using psql command line:
```bash
psql -U postgres
CREATE DATABASE dating_app_db;
\q
```

### 3. Set Up Database Schema

Run the schema file to create tables:

```bash
psql -U postgres -d dating_app_db -f database/schema.sql
```

### 4. Install Backend Dependencies

```bash
cd backend
npm install
```

### 5. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dating_app_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=http://localhost:5173
```

### 6. Start the Backend Server

For development (with auto-reload):
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Check if server is running

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile/:id` - Update user profile (requires auth)

## Example API Usage

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe","age":25,"bio":"Software developer"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   ├── auth.controller.js   # Authentication logic
│   └── user.controller.js  # User operations
├── middleware/
│   └── auth.middleware.js  # JWT authentication middleware
├── routes/
│   ├── auth.routes.js      # Auth routes
│   └── user.routes.js      # User routes
├── database/
│   ├── schema.sql          # Database schema
│   └── init.sql            # Sample data
├── server.js               # Main server file
└── package.json            # Dependencies
```

## Troubleshooting

**Database connection error:**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

**Port already in use:**
- Change PORT in `.env`
- Or stop the process using port 5000

**Module not found:**
- Run `npm install` again
- Check if you're in the correct directory
