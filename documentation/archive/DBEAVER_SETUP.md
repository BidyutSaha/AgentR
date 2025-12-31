# 🔧 Viewing Database Tables in DBeaver

## Issue: Tables Not Visible in DBeaver

The tables exist (you can see them in Prisma Studio), but they're not showing in DBeaver. Here's how to fix it:

---

## Solution 1: Check the Schema

PostgreSQL databases have schemas. Your tables are likely in the **`public`** schema.

### Steps in DBeaver:

1. **Expand your database connection**
2. **Expand "Databases"**
3. **Expand your database name** (`agent_r`)
4. **Expand "Schemas"**
5. **Expand "public"** ← Your tables are here!
6. **Expand "Tables"**

You should see:
- `users`
- `email_verification_tokens`
- `password_reset_tokens`
- `refresh_tokens`

---

## Solution 2: Refresh the Connection

### In DBeaver:

1. **Right-click** on your database connection
2. Click **"Refresh"** or press **F5**
3. Expand the schema again

---

## Solution 3: Check Connection Settings

### Verify Your Connection:

**Host:** `dpg-d58h10ali9vc73a2g3dg-a.singapore-postgres.render.com`  
**Port:** `5432`  
**Database:** `agent_r`  
**Username:** `agent_r_user`  
**Password:** `WpEbsAXE8s8nsRBagQZIpAzE4TeUZ594`  
**SSL:** Required (Render requires SSL)

### DBeaver SSL Settings:

1. Go to connection properties
2. Click **"Driver properties"** tab
3. Add property: `ssl` = `true`
4. Or in **"Connection settings"** → **"SSL"** → Enable SSL

---

## Solution 4: Run SQL Query

If you still can't see tables in the tree, run this SQL query:

```sql
-- List all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
```

**Expected Result:**
```
table_name
--------------------------
users
email_verification_tokens
password_reset_tokens
refresh_tokens
```

---

## Solution 5: View Table Data Directly

Run these queries to see your data:

### View Users
```sql
SELECT * FROM public.users;
```

### View Email Verification Tokens
```sql
SELECT * FROM public.email_verification_tokens;
```

### View Password Reset Tokens
```sql
SELECT * FROM public.password_reset_tokens;
```

### View Refresh Tokens
```sql
SELECT * FROM public.refresh_tokens;
```

---

## Common Issues

### Issue 1: Wrong Schema Selected

**Problem:** Looking at wrong schema (e.g., `information_schema` instead of `public`)

**Solution:** 
- Expand `Schemas` → `public` → `Tables`

### Issue 2: SSL Not Enabled

**Problem:** Render requires SSL connections

**Solution:**
1. Edit connection
2. Go to **"Driver properties"**
3. Set `ssl` = `true`
4. Or use connection string with `?sslmode=require`

### Issue 3: Tables Not Refreshed

**Problem:** DBeaver cached old state

**Solution:**
- Right-click database → Refresh (F5)
- Or restart DBeaver

### Issue 4: Wrong Database

**Problem:** Connected to different database

**Solution:**
- Check you're connected to `agent_r` database
- Not `postgres` or other default database

---

## Verify Tables Exist

### Using Prisma Studio (Easiest)

Already running at: **http://localhost:5555**

You can see all tables and data there!

### Using psql (Command Line)

```bash
# Connect to database
psql "postgresql://agent_r_user:WpEbsAXE8s8nsRBagQZIpAzE4TeUZ594@dpg-d58h10ali9vc73a2g3dg-a.singapore-postgres.render.com/agent_r?sslmode=require"

# List tables
\dt

# View users table
SELECT * FROM users;

# Exit
\q
```

---

## DBeaver Connection String

Use this complete connection string in DBeaver:

```
jdbc:postgresql://dpg-d58h10ali9vc73a2g3dg-a.singapore-postgres.render.com:5432/agent_r?user=agent_r_user&password=WpEbsAXE8s8nsRBagQZIpAzE4TeUZ594&ssl=true&sslmode=require
```

---

## Step-by-Step: DBeaver Setup

### 1. Create New Connection

- Click **"New Database Connection"**
- Select **"PostgreSQL"**
- Click **"Next"**

### 2. Main Settings

```
Host: dpg-d58h10ali9vc73a2g3dg-a.singapore-postgres.render.com
Port: 5432
Database: agent_r
Username: agent_r_user
Password: WpEbsAXE8s8nsRBagQZIpAzE4TeUZ594
```

### 3. SSL Settings

**Tab: "Driver properties"**
- Add: `ssl` = `true`
- Add: `sslmode` = `require`

**Or Tab: "SSL"**
- Enable: "Use SSL"
- SSL Mode: "require"

### 4. Test Connection

- Click **"Test Connection"**
- Should show: "Connected"

### 5. Finish & Refresh

- Click **"Finish"**
- Expand connection
- Navigate to: `Databases` → `agent_r` → `Schemas` → `public` → `Tables`

---

## Quick SQL Test

Run this in DBeaver SQL editor:

```sql
-- Check if tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public';

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'email_verification_tokens', COUNT(*) FROM email_verification_tokens
UNION ALL
SELECT 'password_reset_tokens', COUNT(*) FROM password_reset_tokens
UNION ALL
SELECT 'refresh_tokens', COUNT(*) FROM refresh_tokens;
```

---

## Alternative: Use Prisma Studio

**Easiest option!** Already running at:
```
http://localhost:5555
```

Prisma Studio shows:
- All tables
- All data
- Easy to browse
- No configuration needed

---

## Summary

**Most likely issue:** Tables are in `public` schema, need to expand it in DBeaver.

**Quick fix:**
1. Expand `Schemas` → `public` → `Tables`
2. Or run SQL: `SELECT * FROM public.users;`

**Alternative:** Use Prisma Studio at http://localhost:5555

---

**The tables definitely exist!** They're visible in Prisma Studio. Just need to find them in DBeaver by expanding the correct schema. 🎯
