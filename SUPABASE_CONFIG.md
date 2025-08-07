# Konfigurasi Supabase untuk Vercel Deployment

## Masalah

Email verification redirect masih mengarah ke `localhost:3000` padahal aplikasi sudah di-deploy ke Vercel.

## Solusi

### 1. Update Site URL di Supabase Dashboard

1. Buka Supabase Dashboard: https://app.supabase.com
2. Pilih project: `evyxexsnzfcwfavhwzlj`
3. Masuk ke **Settings** → **Authentication**
4. Di bagian **Site URL**, ubah dari:
   ```
   http://localhost:3000
   ```
   Menjadi:
   ```
   https://posyandu-klitikan.vercel.app
   ```

### 2. Update Redirect URLs

Di bagian **Redirect URLs**, tambahkan:

```
https://posyandu-klitikan.vercel.app/
https://posyandu-klitikan.vercel.app/**
```

### 3. Environment Variables di Vercel

Pastikan environment variables di Vercel Dashboard sudah benar:

```
VITE_SUPABASE_URL=https://evyxexsnzfcwfavhwzlj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eXhleHNuemZjd2Zhdmh3emxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDM4NTYsImV4cCI6MjA2ODMxOTg1Nn0.ryjnYnvprSNkNEj8Xcu29VTfWpC7SrJ8cB51zrg50XU
VITE_SITE_URL=https://posyandu-klitikan.vercel.app
```

### 4. Redeploy

Setelah mengubah konfigurasi di Supabase:

1. Commit dan push perubahan kode
2. Trigger redeploy di Vercel
3. Test email verification

## Perubahan Kode yang Dibuat

1. **useAuth.ts**:

   - Menambahkan `getBaseUrl()` function untuk URL dinamis
   - Update `emailRedirectTo` menggunakan environment variable
   - Menambahkan logic untuk handle email confirmation token
   - Auto-clear URL hash setelah confirmation

2. **Environment Variables**:
   - Menambahkan `.env.production`
   - Variable `VITE_SITE_URL` untuk production URL

## Testing

Setelah konfigurasi:

1. Register user baru di https://posyandu-klitikan.vercel.app
2. Cek email verification
3. Link harus mengarah ke `https://posyandu-klitikan.vercel.app/` bukan `localhost:3000`
