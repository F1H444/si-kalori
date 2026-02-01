-- Check admins table structure
SELECT * FROM admins LIMIT 1;

-- Get all users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- Insert admin manually (replace USER_ID_HERE with actual user ID)
-- INSERT INTO admins (user_id, role, created_at) 
-- VALUES ('USER_ID_HERE', 'super_admin', NOW());
