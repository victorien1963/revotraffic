# Database Upgrade Guide

This document outlines the database setup and upgrade process for the RevoTraffic application.

## Initial Setup (Fresh Database)

If you are starting with an empty database, the application will:

1. Automatically create all required table structures on first run
2. Create an initial user with `SUPER_ADMIN` role based on credentials in `.env` file
3. After initialization, you can login using the admin credentials defined in the `.env` file

## Upgrading from Previous Version

If you are upgrading from a previous version with an existing database, you need to:

1. Create a new PostgreSQL enum type called `role` with the following values:
   ```sql
   CREATE TYPE role AS ENUM ('SUPER_ADMIN', 'PROJECT_ADMIN', 'PROJECT_DESIGNER', 'VISITOR');
   ```

2. Add a new column named `role` to the users table:
   ```sql
   ALTER TABLE users ADD COLUMN role role;
   ```

3. Set default roles for existing users (adjust as needed):
   ```sql
   -- Set the admin user from .env to SUPER_ADMIN
   UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'admin_email_from_env_file';
   
   -- Set other users to PROJECT_DESIGNER by default
   UPDATE users SET role = 'PROJECT_DESIGNER' WHERE role IS NULL;
   ```

## Role Management

After upgrading, roles can be managed through the User Management interface in the application. The available roles are:

1. `SUPER_ADMIN`: Full system access with user management capabilities
2. `PROJECT_ADMIN`: Can create and manage projects and assign designers
3. `PROJECT_DESIGNER`: Can work on assigned projects
4. `VISITOR`: Read-only access to view projects

## Verification Steps

After completing the upgrade:

1. Verify that the `role` enum type exists in the database
2. Confirm that the `users` table has the `role` column
3. Check that all users have a role assigned
4. Test login functionality with different user roles
5. Verify that role-based access control works as expected

## Troubleshooting

If you encounter issues after upgrading:

1. Check PostgreSQL logs for any errors
2. Verify that the enum type was created correctly
3. Ensure all users have a valid role
4. Restart the application server after database changes

## Rollback Procedure

If you need to roll back the changes:

```sql
ALTER TABLE users DROP COLUMN role;
DROP TYPE role;
```

Note that rolling back will remove all role-based access control functionality.
