// backend/middleware/upload.middleware.js
import multer from 'multer';
import path from 'path'; // 
import fs from 'fs';
import { fileURLToPath } from 'url'; // 

// *** Manually define __dirname for ES Modules ***
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// *** End definition ***

// Define storage location and filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Now __dirname is defined and can be used here
    const uploadPath = path.join(__dirname, '../uploads'); // Adjust path as needed
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create a unique filename: userId-timestamp.extension
    const uniqueSuffix = req.user.userId + '-' + Date.now();
    const extension = path.extname(file.originalname);
    cb(null, 'profilePicture-' + uniqueSuffix + extension); // Changed fieldname part for clarity
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
    cb(null, true); // Accept file
  } else {
    // Pass an error object to cb to trigger error handling
    cb(new Error('Invalid file type. Only JPEG, PNG, or WEBP allowed.'), false); // Reject file
  }
};

// Configure multer instance
const upload = multer({
  storage: multer.memoryStorage(), // <--- CHANGE HERE
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Export the configured middleware for a single file upload named 'profilePicture'
// 'profilePicture' MUST match the field name used in the frontend FormData
export const uploadProfilePicMiddleware = upload.single('profilePicture');

// Middleware to handle potential multer errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Max size is 5MB.' });
    }
    // Handle other multer errors (e.g., unexpected field)
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  } else if (err) {
    // Handle errors passed from fileFilter or other non-Multer errors
    console.error('File filter or unknown upload error:', err);
     // Use the error message from the fileFilter if available
    return res.status(400).json({ error: err.message || 'Invalid file type or unknown upload error.' });
  }
  
  // Everything went fine, proceed.
  next();
};