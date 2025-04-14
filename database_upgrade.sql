-- Database upgrade script for RevoTraffic application
-- This script adds role-based access control to an existing database

-- Step 1: Create the role enum type
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
        CREATE TYPE role AS ENUM ('SUPER_ADMIN', 'PROJECT_ADMIN', 'PROJECT_DESIGNER', 'VISITOR');
    END IF;
END $$;

-- Step 2: Add role column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role role;
    END IF;
END $$;

-- Step 3: Set default roles for existing users
-- Replace 'admin@example.com' with the actual admin email from your .env file
UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'admin@example.com' AND role IS NULL;

-- Set other users to PROJECT_DESIGNER by default
UPDATE users SET role = 'PROJECT_DESIGNER' WHERE role IS NULL;

-- Verification query - run this to check the results
-- SELECT id, email, role FROM users;
