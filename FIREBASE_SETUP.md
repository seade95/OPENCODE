# Firebase Setup for EduVerse

## Prerequisites
- A Google account (Gmail)
- Your EduVerse project deployed on Netlify

## Step 1: Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Create a project**
3. Enter project name: `eduverse` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click **Create project**

## Step 2: Enable Authentication

1. In the Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Email/Password**
3. Toggle **Enable** → **Save**

## Step 3: Create Cloud Firestore Database

1. In the Firebase Console, go to **Cloud Firestore**
2. Click **Create database**
3. Choose **Start in test mode** (for initial setup)
4. Select a region closest to your users
5. Click **Enable**

## Step 4: Get Your Firebase Config

1. In Project Settings → **General** → **Your apps** → **Web app**
2. Register a web app (nickname: `eduverse`)
3. Copy the `firebaseConfig` object
4. Open `js/firebase-config.js` in your project
5. Replace each `"YOUR_..."` placeholder with the real values

## Step 5: Deploy Firestore Security Rules

1. In the Firebase Console, go to **Cloud Firestore** → **Rules**
2. Paste the contents of `firestore.rules` from your project
3. Click **Publish**

## Step 6: Deploy to Netlify

1. Commit and push all changes
2. Netlify will auto-deploy
3. Test by logging in at `/login` with a Firebase Auth user

## Step 7: Migrate Existing Data

1. Open your site's Super Admin panel (`/superadmin`)
2. The migration happens automatically when you save data through the app
3. To force a full migration, call this in the browser console:
   ```js
   migrateLocalStorageToFirestore();
   ```
4. You'll see a toast: "Migrated X documents to Firestore"

## Verifying It Works

- Open the app in two browser tabs
- Make a change in one tab (e.g., add a student)
- The other tab should show the update within 1-2 seconds
- Check Firebase Console → Firestore → Data to see documents appearing
