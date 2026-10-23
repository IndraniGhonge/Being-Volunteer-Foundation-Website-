# Being Volunteer Foundation – Website

A real, working website: public pages (Home, About, 4E's, Upcoming/Past Events) plus a
secure **Admin portal** where you add, edit, delete events and upload images.

- **Backend:** Node.js + Express
- **Database:** SQLite (built into Node, a single file, no setup)
- **Security:** hashed passwords, login cookie the browser can't read, login rate-limit, upload checks

## 1. Run it on your computer

1. Install **Node.js** (version 18 or newer) from https://nodejs.org
2. Open a terminal inside this folder and run:
   ```
   npm install
   cp .env.example .env        (Windows: copy .env.example .env)
   ```
3. Open `.env` and change `JWT_SECRET`, `ADMIN_USER` and `ADMIN_PASSWORD`.
4. Start it:
   ```
   npm start
   ```
5. Visit http://localhost:3000 – the admin login is under **Admin Login** in the menu.

## 2. Put it on the internet

Your site stores events in a database file and images in a folder, so the host must offer a
**persistent disk / volume** (otherwise your data disappears on every restart).

**Option A – Render / Railway (easiest)**
1. Upload this folder to a GitHub repository (the `.gitignore` already keeps secrets out).
2. Create a new *Web Service* from that repo. Build command: `npm install`. Start command: `npm start`.
3. Add environment variables: `NODE_ENV=production`, `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASSWORD`,
   `SEED_DEMO=false`, and `DATA_DIR=/data`.
4. Attach a persistent disk/volume mounted at `/data`.
5. Add your own domain in the service's settings (e.g. beingvolunteer.org) – HTTPS is automatic.

**Option B – A VPS (DigitalOcean, AWS Lightsail, etc.)**
Install Node, copy the folder, set the `.env`, run with `pm2 start server.js`, and put
Nginx/Caddy in front for HTTPS.

**Option C – Docker**: `docker build -t bvf .` then run with a volume:
`docker run -p 3000:3000 -v bvf-data:/data --env-file .env -e DATA_DIR=/data -e NODE_ENV=production bvf`

## 3. Daily use

- Log in → **Add New Event** (the form on the right) → upload an image → Save.
- When an event is over, click **To Past**, enter volunteers + impact.
- Forgot your password? Run: `npm run set-password -- admin NewPassword123`
- **Back up** the `data` folder (database + images) regularly.

## 4. Things to edit

- Text, stats, phone, address → `public/app.js` (home section) and `public/index.html` (header)
- Colours/layout → `public/styles.css`
- Real photos for the hero/welcome sections: put them in `public/` and replace the emoji placeholders
- Map: replace the 📍 box with a Google Maps embed (allow `frame-src https://www.google.com` in the CSP in `server.js`)
- Social media icons in the header are not linked yet – wrap each in `<a href="your-url">`

## Project layout
```
server.js      the web server + API
db.js          database setup
scripts/       password reset tool
public/        the website itself (index.html, styles.css, app.js)
data/          created automatically: bvf.db + uploads/
```
