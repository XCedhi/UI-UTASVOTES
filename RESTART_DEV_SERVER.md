# Restart Dev Server to Clear Schema Cache

After running the SQL migrations, you MUST restart your development server to clear Supabase's schema cache.

## How to Restart:

1. **Stop the current server:**
   - Go to your terminal where `npm run dev` is running
   - Press `Ctrl + C` to stop it

2. **Start it again:**
   ```bash
   npm run dev
   ```

3. **Wait for it to compile:**
   - Wait until you see "Ready in X ms"
   - Then go to http://localhost:4028

4. **Test election creation:**
   - Login with: jkorkugah23.stu@cktutas.edu.gh / Admin@2026
   - Go to Admin System Control → Election Management
   - Click "Create Election"
   - Fill in the form and submit

The schema cache error should be gone! ✅
