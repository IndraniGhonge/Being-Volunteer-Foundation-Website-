require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { db, UPLOAD_DIR } = require('./db');

const PROD = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;
const CATS = ['Environment', 'Education', 'Engagement', 'Enablement'];

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.startsWith('change-me')) {
  if (PROD) { console.error('Set a strong JWT_SECRET in your environment.'); process.exit(1); }
  JWT_SECRET = crypto.randomBytes(32).toString('hex'); // dev only: logins reset on restart
}

/* ---------- first-run setup ---------- */
function ensureAdmin() {
  const count = db.prepare('SELECT COUNT(*) c FROM admins').get().c;
  if (count) return;
  const u = process.env.ADMIN_USER, p = process.env.ADMIN_PASSWORD;
  if (!u || !p || p.length < 8) {
    console.error('No admin exists. Set ADMIN_USER and ADMIN_PASSWORD (min 8 chars) in .env, then restart.');
    process.exit(1);
  }
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(u, bcrypt.hashSync(p, 12));
  console.log(`Admin "${u}" created. You can now remove ADMIN_PASSWORD from .env.`);
}
function seedDemo() {
  if (process.env.SEED_DEMO !== 'true') return;
  if (db.prepare('SELECT COUNT(*) c FROM events').get().c) return;
  const ins = db.prepare(`INSERT INTO events (name,date,time,loc,cat,description,ins,link,max,vol,status,impact)
    VALUES (@name,@date,@time,@loc,@cat,@description,@ins,@link,@max,@vol,@status,@impact)`);
  const e = (o) => ({ ins: '', link: '', max: 0, vol: 0, impact: '', ...o });
  [
    e({ name: 'Tree Plantation Drive', date: '2026-11-08', time: '7:30 AM', loc: 'Sinhagad Fort, Pune', cat: 'Environment', description: 'Join us to plant native saplings and restore green cover.', ins: 'Wear comfortable shoes and carry a water bottle.', link: 'https://forms.gle/', max: 50, status: 'upcoming' }),
    e({ name: 'Winter Clothes Distribution', date: '2026-12-02', time: '10:00 AM', loc: 'Pashan, Pune', cat: 'Engagement', description: 'Distribute warm clothes to families in need.', ins: 'Report 15 minutes early.', link: 'https://forms.gle/', max: 40, vol: 12, status: 'upcoming' }),
    e({ name: 'Digital Literacy Workshop', date: '2026-12-14', time: '11:00 AM', loc: 'Baner, Pune', cat: 'Education', description: 'Teach basic computer skills to school children.', ins: 'Bring your laptop if possible.', link: 'https://forms.gle/', max: 30, status: 'upcoming' }),
    e({ name: 'Volunteer Kitchen', date: '2026-09-20', time: '9:00 AM', loc: 'Pune', cat: 'Engagement', description: 'Meals cooked and served to the community.', max: 50, vol: 35, status: 'past', impact: '500+ meals served' }),
    e({ name: 'Livelihood Skills Camp', date: '2026-08-15', time: '10:00 AM', loc: 'Baner, Pune', cat: 'Enablement', description: 'Hands-on vocational training for women.', max: 30, vol: 25, status: 'past', impact: '40 women trained' }),
    e({ name: 'River Clean-up', date: '2026-07-05', time: '8:00 AM', loc: 'Mula River, Pune', cat: 'Environment', description: 'Community clean-up along the riverbank.', max: 60, vol: 50, status: 'past', impact: '2 tonnes of waste removed' }),
  ].forEach((x) => ins.run(x));
  console.log('Demo events added.');
}
ensureAdmin();
seedDemo();

/* ---------- app ---------- */
const app = express();
app.set('trust proxy', 1); // needed behind Render/Railway/Nginx so rate limiting & secure cookies work
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      formAction: ["'self'"],
      upgradeInsecureRequests: PROD ? [] : null,
    },
  },
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

/* ---------- auth ---------- */
const COOKIE = 'bvf_token';
const cookieOpts = { httpOnly: true, sameSite: 'strict', secure: PROD, maxAge: 8 * 3600 * 1000, path: '/' };

function requireAdmin(req, res, next) {
  try {
    req.admin = jwt.verify(req.cookies[COOKIE], JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Please log in again.' });
  }
}
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in 15 minutes.' } });

app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  const row = db.prepare('SELECT * FROM admins WHERE username = ?').get(String(username || ''));
  // compare even when user is missing, so timing doesn't reveal valid usernames
  const hash = row ? row.password_hash : '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid.';
  const ok = bcrypt.compareSync(String(password || ''), hash) && row;
  if (!ok) return res.status(401).json({ error: 'Invalid username or password.' });
  const token = jwt.sign({ id: row.id, u: row.username }, JWT_SECRET, { expiresIn: '8h' });
  res.cookie(COOKIE, token, cookieOpts).json({ ok: true });
});
app.post('/api/auth/logout', (req, res) => { res.clearCookie(COOKIE, { path: '/' }).json({ ok: true }); });
app.get('/api/auth/me', (req, res) => {
  try { jwt.verify(req.cookies[COOKIE], JWT_SECRET); res.json({ admin: true }); }
  catch (e) { res.json({ admin: false }); }
});

/* ---------- uploads ---------- */
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + EXT[file.mimetype]),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => (EXT[file.mimetype] ? cb(null, true) : cb(new Error('Only PNG, JPG or WebP images are allowed.'))),
});
const removeImage = (url) => {
  if (url && url.startsWith('/uploads/')) fs.unlink(path.join(UPLOAD_DIR, path.basename(url)), () => {});
};
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', index: false }));

/* ---------- events ---------- */
const toApi = (r) => ({ id: r.id, name: r.name, date: r.date, time: r.time, loc: r.loc, cat: r.cat,
  desc: r.description, ins: r.ins, link: r.link, max: r.max, vol: r.vol, status: r.status, impact: r.impact, img: r.img });

function clean(b) {
  const s = (v, n) => String(v ?? '').trim().slice(0, n);
  const out = { name: s(b.name, 150), date: s(b.date, 10), time: s(b.time, 30), loc: s(b.loc, 200),
    cat: CATS.includes(b.cat) ? b.cat : 'Engagement', description: s(b.desc, 2000), ins: s(b.ins, 500),
    link: s(b.link, 500), max: Math.max(0, parseInt(b.max, 10) || 0) };
  if (!out.name || !out.loc) return { error: 'Event name and location are required.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(out.date) || isNaN(Date.parse(out.date))) return { error: 'Please enter a valid date.' };
  if (out.link && !/^https?:\/\//i.test(out.link)) return { error: 'Registration link must start with http:// or https://' };
  return { data: out };
}

app.get('/api/events', (req, res) => {
  res.json(db.prepare('SELECT * FROM events ORDER BY date').all().map(toApi));
});

app.post('/api/events', requireAdmin, upload.single('image'), (req, res) => {
  const { data, error } = clean(req.body);
  if (error) { if (req.file) removeImage('/uploads/' + req.file.filename); return res.status(400).json({ error }); }
  const img = req.file ? '/uploads/' + req.file.filename : '';
  const r = db.prepare(`INSERT INTO events (name,date,time,loc,cat,description,ins,link,max,img)
    VALUES (@name,@date,@time,@loc,@cat,@description,@ins,@link,@max,@img)`).run({ ...data, img });
  res.status(201).json(toApi(db.prepare('SELECT * FROM events WHERE id=?').get(r.lastInsertRowid)));
});

app.put('/api/events/:id', requireAdmin, upload.single('image'), (req, res) => {
  const old = db.prepare('SELECT * FROM events WHERE id=?').get(req.params.id);
  if (!old) { if (req.file) removeImage('/uploads/' + req.file.filename); return res.status(404).json({ error: 'Event not found.' }); }
  const { data, error } = clean(req.body);
  if (error) { if (req.file) removeImage('/uploads/' + req.file.filename); return res.status(400).json({ error }); }
  let img = old.img;
  if (req.file) { removeImage(old.img); img = '/uploads/' + req.file.filename; }
  db.prepare(`UPDATE events SET name=@name,date=@date,time=@time,loc=@loc,cat=@cat,description=@description,
    ins=@ins,link=@link,max=@max,img=@img WHERE id=@id`).run({ ...data, img, id: old.id });
  res.json(toApi(db.prepare('SELECT * FROM events WHERE id=?').get(old.id)));
});

app.post('/api/events/:id/complete', requireAdmin, (req, res) => {
  const vol = Math.max(0, parseInt(req.body.vol, 10) || 0);
  const impact = String(req.body.impact ?? '').trim().slice(0, 300);
  const r = db.prepare(`UPDATE events SET status='past', vol=?, impact=? WHERE id=?`).run(vol, impact, req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Event not found.' });
  res.json({ ok: true });
});

app.delete('/api/events/:id', requireAdmin, (req, res) => {
  const old = db.prepare('SELECT img FROM events WHERE id=?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'Event not found.' });
  db.prepare('DELETE FROM events WHERE id=?').run(req.params.id);
  removeImage(old.img);
  res.json({ ok: true });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

/* ---------- static site ---------- */
app.use(express.static(path.join(__dirname, 'public'), { maxAge: PROD ? '1h' : 0 }));
app.get('/healthz', (req, res) => res.send('ok'));

// errors (e.g. upload too big / wrong file type)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 5MB.' : err.message });
  if (err && err.message && /image/i.test(err.message)) return res.status(400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Server error. Please try again.' });
});

app.listen(PORT, () => console.log(`BVF website running on http://localhost:${PORT}`));
