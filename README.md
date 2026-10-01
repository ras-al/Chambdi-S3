# Chambdi Season 5 (S5)

A social deduction party game (hidden roles, trust and betrayal) played by the class. Upgraded for Season 5 with a brutalist poster aesthetic and authenticated with TKMCE Google accounts mapped to the student roster.

---

## What is New in Season 5

1. Google Sign-In with Roster Verification
   - Replaced old username and roll number password forms with Google Sign-In.
   - Restricts authentication strictly to verified `@tkmce.ac.in` student emails.
   - Extracts the admission number from the email prefix and validates against the Firestore `users` student roster.
   - Links the Firebase Auth `uid` and `email` to existing student records on first login, preserving all voting history and stats.
   - Immediate access revocation and brutalist Access Denied screen for unlisted accounts.

2. Minimalist Brutalist Poster Aesthetics
   - Custom palette: Paper (#E6E4DF), Ink (#0B0B0B), Blood Red (#9E1B17), and Muted Grey (#6E6C68).
   - Typography: Anton display header clamp sizes and Space Grotesk tracking.
   - Handcrafted inline SVG graphics: Angular Mask motif, Layered Silhouette motif, Pure SVG Barcode, and SVG Turbulence paper grain overlay.
   - Zero border radii, 3px solid ink borders, hard offset block shadows, 48px min touch targets.

3. Complete Screen Flow
   - Hero Login screen with corner label stacks and barcode.
   - Brutalist Access Denied screen.
   - Classified Role Reveal dossier with full-screen tap-to-reveal mechanic.
   - Round 1 General Voting arena with centered, non-scrollable vote confirmation modal.
   - Round 2 Top 5 Finalists fresh vote arena.
   - Class Roster and Player Dossiers view.
   - Final Declare Winner announcement card and Runners Up tally.
   - Dedicated Admin Console page with phase progression, live ballot audit, and database reset controls.

---

## Environment Configuration

Copy `.env.example` to `.env` and fill in your Firebase project credentials:

```bash
cp .env.example .env
```

Required variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_ADMIN_PASSWORD` (Master password to unlock the `/admin` command console)

Note: Legacy `VITE_API_KEY`, `VITE_AUTH_DOMAIN`, etc. are also supported for backwards compatibility.

---

## Admin Console and Security Gate (`/admin`)

1. Isolated Route:
   - The administration dashboard is hosted exclusively at the `/admin` path.
   - Normal users on the public arena (`/`) have zero visibility into administrative controls; all admin buttons, quick bars, and phase triggers are completely stripped from student views.

2. Master Password Protection:
   - Access to `/admin` is locked behind the brutalist Admin Gateway.
   - The gate verifies the input against `VITE_ADMIN_PASSWORD` defined in `.env`.
   - Successful entry grants an authenticated session in `sessionStorage`.
   - Administrators can lock the console at any time with the "LOCK CONSOLE" control.

3. Administrative Capabilities:
   - Advance game phases (Round 1 Voting -> Round 2 Top 5 Finalists -> Final Winner Announcement).
   - Real-time audit metrics (ballot counts, participation percentages, leader rankings).
   - System reinitialization (full reset of votes, voting flags, and roster restore).
   - Google account linking to verify Firestore administrative privileges (`240236@tkmce.ac.in`).

---

## Firebase Console Setup Checklist

Perform the following manual steps in the Firebase Console:

1. Enable Google Sign-In:
   - Go to Firebase Console > Build > Authentication > Sign-in method.
   - Enable "Google".
   - Select your project support email and save.

2. Configure Authorized Domains:
   - In Authentication > Settings > Authorized domains, add:
     - `localhost`
     - `127.0.0.1`
     - `chambdi-s4.vercel.app`
     - Your production Vercel or custom deployment domains.

3. Deploy Firestore Security Rules:
   - Install Firebase CLI if not already installed: `npm install -g firebase-tools`
   - Log in: `firebase login`
   - Deploy the included rules file: `firebase deploy --only firestore:rules`
   - Verify in Firestore > Rules tab that domain verification and roster restrictions are active.

---

## How Google and Roster Login Works

1. The user clicks "SIGN IN WITH GOOGLE".
2. The Google provider is configured with the UI hint `hd: "tkmce.ac.in"` and `prompt: "select_account"`.
3. Upon authentication, client code verifies that `email` is lowercase, ends with `@tkmce.ac.in`, and splits the admission number before the `@`.
4. The admission number is looked up in the `users` collection.
5. If the student document does not exist, or the email domain is not `tkmce.ac.in`, `signOut()` is called immediately and the user is shown:
   "ACCESS DENIED. YOU ARE NOT ON THE LIST."
6. If the student is found, their record is loaded, their `uid` and `email` are merged into their existing document, and their session is persisted via `onAuthStateChanged`.
7. Admins are recognized via `isAdmin: true` in Firestore or the designated class owner admission number (`240236`), never via client side passwords.

---

## Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Run linter
npm run lint

# Build production bundle
npm run build
```
