# 🚀 Smart Bookmark App

A real-time bookmark manager built using Next.js (App Router), Supabase
(Auth + PostgreSQL + Realtime), Tailwind CSS, and deployed on Vercel.

------------------------------------------------------------------------

## 📌 Features

-   Google OAuth authentication (No email/password)
-   Add bookmark (Title + URL)
-   Bookmarks are private per user
-   Delete own bookmarks
-   Real-time updates across multiple tabs
-   Deployed on Vercel with working live URL

------------------------------------------------------------------------

## 🛠 Tech Stack

-   Next.js (App Router)
-   Supabase Authentication
-   Supabase PostgreSQL Database
-   Supabase Realtime
-   Tailwind CSS
-   Vercel Deployment

------------------------------------------------------------------------

# 🔐 Authentication Implementation

The application uses **Google OAuth via Supabase**.

Authentication flow:

1.  User clicks "Login with Google"
2.  Supabase triggers Google OAuth
3.  Google verifies credentials
4.  Google redirects to Supabase callback URL
5.  Supabase creates or fetches the user
6.  User is redirected to `/dashboard`
7.  Session is stored securely

Login code used:

``` js
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: "http://localhost:3000/dashboard"
  }
})
```

------------------------------------------------------------------------

# ⚠️ Authentication Issues Faced & Solutions

## ❌ Issue 1: 404 After Login

After successful login, the app redirected to `/dashboard` but showed
404 error.

### ✅ Solution:

The `dashboard` folder was not created inside the `app` directory.

Correct structure:

    app/
     ├─ page.js
     ├─ layout.js
     ├─ dashboard/
          ├─ page.js

------------------------------------------------------------------------

## ❌ Issue 2: Google Login Popup Not Opening

Clicking login button did nothing.

### ✅ Solution:

Google provider was not enabled in Supabase.

Fix: - Supabase → Authentication → Providers - Enable Google - Add
Client ID and Client Secret

------------------------------------------------------------------------

## ❌ Issue 3: Redirect URI Mismatch Error

Google showed redirect URI mismatch error.

### ✅ Solution:

In Google Cloud Console → OAuth Credentials\
Added this exact redirect URI:

    https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback

Important: - Do NOT add localhost here - Only add Supabase callback URL

------------------------------------------------------------------------

## ❌ Issue 4: Not Redirecting Properly After Login

User was authenticated but not redirected correctly.

### ✅ Solution:

Configured in Supabase:

Authentication → URL Configuration

Site URL:

    http://localhost:3000

Redirect URL:

    http://localhost:3000/dashboard

------------------------------------------------------------------------

# 🔒 Row Level Security (RLS)

To make bookmarks private per user:

-   Enabled Row Level Security
-   Created SELECT, INSERT, DELETE policies
-   Used condition: `auth.uid() = user_id`

This ensures: - Users can only access their own bookmarks - No
cross-user data exposure

------------------------------------------------------------------------

# 🔴 Realtime Implementation

Implemented Supabase Realtime subscription:

``` js
supabase
  .channel("bookmarks")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "bookmarks"
    },
    () => {
      fetchBookmarks()
    }
  )
  .subscribe()
```

------------------------------------------------------------------------

# 🚀 Deployment

The application was deployed on Vercel.

Environment variables added:

    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY

Google OAuth redirect URL updated for production deployment.

------------------------------------------------------------------------

# 👨‍💻 Author

Abhishek Raju Wadile
