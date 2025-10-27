-- This file can be used to insert sample data for development
-- Run after schema.sql has been executed

-- Sample users (password is 'password123' hashed)
INSERT INTO users (email, password_hash, name, age, bio) VALUES
    ('alice@example.com', '$2a$10$YourHashedPasswordHere', 'Alice Smith', 25, 'Love hiking and reading'),
    ('bob@example.com', '$2a$10$YourHashedPasswordHere', 'Bob Johnson', 28, 'Coffee enthusiast and photographer'),
    ('charlie@example.com', '$2a$10$YourHashedPasswordHere', 'Charlie Brown', 30, 'Yoga instructor and fitness lover')
ON CONFLICT (email) DO NOTHING;
