<div align="center">

# 🧭 WanderLust

### Find a stay that makes the journey.

A travel-stay discovery and listing app for exploring distinctive places, sharing your own, and hearing from fellow travelers.

<br>

![Node.js](https://img.shields.io/badge/Node.js-24.21.0-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/Views-EJS-A91E50?style=for-the-badge)

<br>

**Discover · List · Review · Wander**

</div>

---

## ✨ The idea

Planning a trip often means searching across scattered listings and trying to work out whether a place is really right for the journey. **WanderLust brings stay discovery and community-created listings together in one simple place**: browse by destination or type of stay, see where a place is on a map, and learn from guest reviews.

### 💎 The USP

WanderLust combines **category-led discovery, traveler-created stays, location-aware listing pages, and guest reviews** in a lightweight, approachable marketplace. It is designed to make it easy to go from “Where should I stay?” to finding a place that fits the kind of trip you have in mind.

> **Scope note:** This project currently supports discovering, publishing, and reviewing stays. It does **not** implement reservations, availability calendars, payments, or booking management.

## 🌍 What you can do

| Experience | What it includes |
| --- | --- |
| 🧭 Explore stays | Browse listing cards with a price-per-night and filter by stay category. |
| 🔎 Search destinations | Search listing titles, locations, and countries; combine a search with a category filter. |
| 🏡 Publish a stay | Signed-in users can add a listing with its details, category, price, location, and an image. |
| ✏️ Manage your listing | Listing owners can edit or remove their own listings. |
| 🗺️ Find it on the map | Listing detail pages show a Mapbox map marker based on the location's geocoded coordinates. |
| ⭐ Share an experience | Signed-in users can leave a comment and a 1–5 star review; review authors can delete their own reviews. |
| 👤 Manage your account | Sign up, log in, log out, change your password, or delete your account. |

### 🗂️ Stay categories

🏨 Hotels · 🛏️ Rooms · 🧖 Resorts · ⛰️ Hill stations · 🏖️ Beach stays · 🛖 Cabins · 🏡 Villas · 🌾 Countryside · ⛺ Camping · 🌆 City stays

## 📋 Project specifications

### Listings

- Each listing has a title, description, category, price per night, location, country, image, owner, and geospatial coordinates.
- Listing images are required when creating a stay. Supported formats are **JPEG, PNG, GIF, WebP, and AVIF**, with a maximum upload size of **5 MB**.
- The app geocodes the provided location with Mapbox and stores the resulting point coordinates with the listing.
- A listing can only be edited or deleted by its owner.
- Listing search checks the title, location, and country; search input is trimmed and limited to 100 characters.

### Accounts and reviews

- Accounts use a username, email address, and password. Passport Local Mongoose handles local authentication.
- Account password changes and account deletion require the current password.
- Account deletion also removes the account's listings and associated reviews.
- Reviews require a **1–5** rating and a comment. Only the review's author can delete it.
- Joi validates listing and review submissions on the server; browser forms also provide required-field validation.

### Location and privacy

- Listing pages display a map marker at the geocoded listing coordinates. The map popup notes that the exact location is provided after booking; **booking itself is not implemented**.
- Sessions are stored in MongoDB. Session cookies are HTTP-only and configured for a seven-day lifetime.

## 🧰 Tech stack

| Layer | Technologies |
| --- | --- |
| Runtime | Node.js **24.21.0** (declared project engine), CommonJS |
| Server | Express **5**, EJS, EJS-Mate |
| Data | MongoDB, Mongoose **9**, Connect-Mongo |
| Authentication | Passport **0.7**, Passport Local, Passport Local Mongoose |
| Validation & feedback | Joi **18**, Connect-Flash, custom Express error middleware |
| Images | Multer **2** in-memory uploads, Supabase Storage |
| Geocoding & maps | Mapbox Geocoding SDK, Mapbox GL JS |
| UI | EJS templates, custom CSS, Bootstrap CDN, Font Awesome, Plus Jakarta Sans |
| Configuration | dotenv |

## 🚀 Get started

### 1. Prerequisites

- **Node.js 24.21.0** and npm
- A MongoDB database (local or MongoDB Atlas)
- A Mapbox access token for geocoding and listing maps
- A Supabase project and public Storage bucket for listing-image uploads

### 2. Install dependencies

```bash
git clone https://github.com/Jayanthravi16/Wanderlust.git
cd Wanderlust
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```dotenv
PORT=8080
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>/<database>
SECRET=replace-with-a-long-random-session-secret
MAP_TOKEN=your-mapbox-access-token

SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=your-supabase-server-side-secret-key
SUPABASE_STORAGE_BUCKET=listing-images
```

| Variable | Required? | Purpose |
| --- | --- | --- |
| `MONGODB_URL` | Yes | MongoDB connection string for app data and sessions. |
| `SECRET` | Yes | Signs and encrypts session data. Use a strong, private value. |
| `MAP_TOKEN` | For geocoding and maps | Mapbox access token; used to geocode listing locations and render maps. |
| `SUPABASE_URL` | For image uploads | Supabase project URL. |
| `SUPABASE_SECRET_KEY` | For image uploads | Server-side Supabase key. The app also accepts the legacy `SUPABASE_SERVICE_ROLE_KEY` name. **Never expose this key in browser code or commit it.** |
| `SUPABASE_STORAGE_BUCKET` | Optional | Storage bucket name; defaults to `listing-images`. Configure the bucket for public image URLs, which the app uses to display uploaded listing photos. |
| `PORT` | Optional | HTTP port; defaults to `8080`. |

Keep `.env` private; it is ignored by Git. Never paste real keys or database credentials into source control.

### 4. Start the app

```bash
node app.js
```

Open [http://localhost:8080](http://localhost:8080) (or the port configured in `PORT`). The root URL redirects to `/listings`.

## 🧪 Sample data

The repository includes sample listing data in [`init/data.js`](./init/data.js). The seed script is run manually:

```bash
node init/index.js
```

**Important:** Seeding requires a MongoDB connection, `MAP_TOKEN`, and an existing MongoDB user with the username `student3`. The script deletes **all existing listings** before inserting the sample set, so only run it against a database where replacing the listings is intended.

## 🗺️ Project map

```text
.
├── app.js                 # Express app, middleware, session setup, route mounting
├── controllers/           # Listing, account, and review request handlers
├── init/                  # Optional sample listing data and seed script
├── models/                # Mongoose User, Listing, and Review models
├── public/
│   ├── css/                # Application styles
│   └── js/                 # Browser behavior and Mapbox map
├── routes/                # Listing, account, and review routes
├── utils/                 # Search, categories, uploads, async/error helpers
├── views/                 # EJS pages, layouts, and shared partials
├── middleware.js          # Authentication and ownership checks
├── schema.js              # Joi request schemas
└── package.json           # Dependencies and Node.js engine
```

## 🛡️ Important implementation details

- Protected actions redirect unauthenticated visitors to sign in.
- Listing changes are restricted to the listing owner; review deletion is restricted to the review author.
- Uploaded image size and MIME type are checked before storage.
- Listing and review payloads are validated on the server.
- MongoDB connection and session secret are required at startup; image storage credentials are needed when uploading listing images.

## 🧭 Current status

This is an actively evolving project. The `package.json` currently contains a placeholder `npm test` command that exits with “no test specified”; automated tests are not configured yet.

---

<div align="center">

**Made for the places that make a trip memorable.** ✨

</div>
