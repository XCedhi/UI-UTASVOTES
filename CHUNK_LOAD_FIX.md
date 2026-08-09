# Fix for ChunkLoadError in Next.js 15

## Quick Fix Steps

1. **Stop the dev server** (Ctrl+C)

2. **Delete build caches:**
```bash
# Windows CMD
rmdir /s /q .next
rmdir /s /q node_modules\.cache

# Windows PowerShell  
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.cache
```

3. **Clear browser completely:**
   - Open DevTools (F12)
   - Right-click refresh button → "Empty Cache and Hard Reload"
   - Or: Ctrl+Shift+Delete → Clear everything

4. **Restart dev server:**
```bash
npm run dev
```

5. **Navigate to http://localhost:4028** in a fresh incognito window

## If Problem Persists

Try this temporary workaround in `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config ...
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
```

## Root Cause

This error happens in Next.js 15 when:
- The build cache gets corrupted
- Browser has stale chunk references
- Hot reload creates mismatched chunks
- Context providers cause circular dependencies

## Nuclear Option

If nothing works:

```bash
# Delete everything
rm -rf .next node_modules package-lock.json

# Reinstall
npm install

# Rebuild
npm run dev
```
