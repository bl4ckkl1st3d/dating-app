import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import path from 'path'; // <-- Import the 'path' module
import { fileURLToPath } from 'url'; // <-- Needed for __dirname

// Load environment variables
dotenv.config(); //

const app = express();
const PORT = process.env.PORT || 5000; //

// Helper for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL , //
  credentials: true //
}));
app.use(express.json()); //
app.use(express.urlencoded({ extended: true })); //

// Serve Uploaded Files Statically
const uploadsPath = path.join(__dirname, 'uploads');
console.log(`📂 [Server] Attempting to serve static files from: ${uploadsPath} at /uploads`);
app.use('/uploads', express.static(uploadsPath)); //

// Test database connection
pool.query('SELECT NOW()') //
  .then((res) => {
    console.log('✅ Database connection successful:', res.rows[0]); //
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err); //
  });

// Routes
app.get('/health', (req, res) => { //
  res.json({ status: 'OK', message: 'Dating app backend is running!' }); //
});

app.use('/api/auth', authRoutes); //
app.use('/api/users', userRoutes); //


// Error handling middleware
app.use((err, req, res, next) => { //
  console.error(err.stack); //
  res.status(500).json({ error: 'Something went wrong!' }); //
});

// Start server
app.listen(PORT, () => { //
  console.log(`🚀 Server is running on http://localhost:${PORT}`); //
});

// Removed duplicate const uploadsPath = path.join(__dirname, 'uploads');