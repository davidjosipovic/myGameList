# myGameList 🎮

A full-stack web application for gamers to track, rate, and review their video game collection. Built with **Next.js 13 (App Router)**, **Prisma**, **PostgreSQL**, and the **IGDB API** (via Twitch).

---

## Features

| Feature | Description |
|---|---|
| **Game Library** | Search the IGDB database and add games to your personal list |
| **Ratings & Reviews** | Rate games (1-10) and write reviews |
| **User Profiles** | Custom profile pictures via UploadThing, user bios |
| **Charts** | Top 100 & Most Popular games with interactive D3.js visualisations |
| **Authentication** | Credentials (email/username + password), Google OAuth, Twitch OAuth |
| **AI Chatbot** | Wit.ai-powered assistant for game information queries |
| **Responsive** | Mobile-first design with Tailwind CSS |

---

## Tech Stack

- **Framework:** Next.js 13.5 (App Router, React 18)
- **Language:** TypeScript
- **Database:** PostgreSQL (Vercel Postgres / Neon)
- **ORM:** Prisma 5
- **Auth:** NextAuth.js 4 (Credentials, Google, Twitch)
- **Styling:** Tailwind CSS 3
- **File Uploads:** UploadThing
- **External API:** IGDB (via Twitch OAuth)
- **Visualisation:** D3.js
- **NLP:** Wit.ai (chatbot)
- **Deployment:** Vercel

---

## Prerequisites

| Requirement | Version |
|---|---|
| **Node.js** | >= 22.x |
| **npm** | >= 9.x (ships with Node 22) |
| **PostgreSQL** | 14+ (or a hosted service like Vercel Postgres / Neon) |

You will also need accounts on:

1. **Twitch Developer Console** — <https://dev.twitch.tv/console/apps> (for IGDB API + Twitch login)
2. **Google Cloud Console** — <https://console.cloud.google.com/apis/credentials> (optional, for Google login)
3. **UploadThing** — <https://uploadthing.com/dashboard> (for profile picture uploads)
4. **Wit.ai** — <https://wit.ai> (optional, for AI chatbot)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/myGameList.git
cd myGameList
```

### 2. Install dependencies

```bash
npm install
```

This also runs `prisma generate` automatically via the `postinstall` script.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in all required values. See the comments inside `.env.example` for guidance on where to get each key.

### 4. Set up the database

```bash
# Push the Prisma schema to your database (creates tables)
npx prisma db push

# (Optional) Open Prisma Studio to inspect data
npx prisma studio
```

### 5. Run the development server

```bash
npm run dev
```

Open <http://localhost:3000> in your browser.

### 6. Build for production

```bash
npm run build   # runs prisma generate + next build
npm start       # starts the production server
```

---

## Project Structure

```
myGameList/
├── app/                        # Next.js App Router
│   ├── layout.tsx              #   Root layout (Navbar, Footer, Providers)
│   ├── page.tsx                #   Home page (hero, carousels, D3 chart)
│   ├── globals.css             #   Global styles
│   ├── api/                    #   API routes (serverless functions)
│   │   ├── auth/               #     NextAuth + registration
│   │   ├── chat/               #     Wit.ai chatbot endpoint
│   │   ├── game/[id]/          #     Single game from IGDB
│   │   ├── games/{new,popular,top}/ # Game lists from IGDB
│   │   ├── gamelist/           #     User game list CRUD
│   │   ├── searchgame/         #     Game search via IGDB
│   │   ├── stats/public/       #     Public game statistics
│   │   ├── editprofile/        #     Edit user profile
│   │   ├── deletepicture/      #     Delete profile picture
│   │   ├── uploadthing/        #     UploadThing webhook
│   │   └── user/[id]/          #     Fetch user data
│   ├── charts/[id]/            #   Charts pages (top, popular)
│   ├── context/                #   React Context (session, app state)
│   ├── editprofile/            #   Edit profile page
│   ├── game/[id]/              #   Game detail page
│   ├── gamelist/[id]/          #   User game list page
│   ├── login/                  #   Login page
│   ├── profile/[id]/           #   User profile page
│   ├── register/               #   Registration page
│   └── search/[id]/            #   Search results page
├── components/                 # Shared React components
│   ├── Navbar.tsx              #   Navigation bar
│   ├── Footer.tsx              #   Footer
│   ├── HomeCarousel.tsx        #   IGDB game carousel
│   ├── GameStatsChart.tsx      #   D3.js interactive chart
│   ├── ChatbotButton.tsx       #   AI chatbot widget
│   ├── SearchGame.tsx          #   Game search input
│   └── ...                     #   Buttons, forms, profile picture, etc.
├── constants/                  # Navigation link definitions
├── lib/                        # Server-side utilities
│   ├── igdb.ts                 #   IGDB API client (auto token refresh)
│   ├── prisma.ts               #   Prisma client singleton
│   ├── gameSearchUtils.ts      #   IGDB search helpers
│   ├── responseFormatter.ts    #   Chat response formatting
│   ├── genreUtils.ts           #   Genre mappings
│   └── platformUtils.ts        #   Platform mappings
├── prisma/
│   ├── schema.prisma           # Database schema (User, Game)
│   └── migrations/             # Migration history
├── public/                     # Static assets (images, SVGs)
├── server/                     # UploadThing server config
├── src/utils/                  # UploadThing client utils
├── middleware.ts               # NextAuth route protection
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind + UploadThing plugin
├── vercel.json                 # Vercel deployment settings
└── package.json                # Dependencies & scripts
```

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Start dev server with hot reload |
| `build` | `npm run build` | Generate Prisma client + build for production |
| `start` | `npm start` | Start production server |
| `lint` | `npm run lint` | Run ESLint |
| `postinstall` | *(auto)* | Runs `prisma generate` after `npm install` |

---

## Database Schema

Two models defined in `prisma/schema.prisma`:

- **User** — `id` (UUID), `email` (unique), `password`, `name` (unique), `info?`, `picture?`, `games[]`
- **Game** — `id` (autoincrement), `gameId` (IGDB game ID), `rating?`, `review?`, `status?`, `userId` (FK → User)

---

## IGDB API Authentication

The app uses Twitch's OAuth **Client Credentials** flow to obtain tokens for the IGDB API. The token is automatically refreshed when it expires or receives a 401.

**Important:** When creating your Twitch Developer app, ensure it is a **Confidential** client (not Public). The IGDB API will reject tokens from Public-type apps even though the OAuth endpoint returns them successfully.

If you see persistent `401 Authorization Failure` errors:

1. Go to <https://dev.twitch.tv/console/apps>
2. Verify your app's **Client Type** is set to **Confidential**
3. Regenerate your **Client Secret**
4. Update `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` (and `TWITCH_ID` / `TWITCH_SECRET`) in `.env`
5. Restart the dev server

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Set all environment variables from `.env.example` in the Vercel dashboard
4. Vercel will run `prisma generate && next build` automatically

---

## License

This project is open source. See the repository for license details.
