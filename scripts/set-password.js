// Usage: npm run set-password -- <username> <new-password>
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const [u, p] = process.argv.slice(2);
if (!u || !p || p.length < 8) { console.error('Usage: npm run set-password -- <username> <new-password (min 8 chars)>'); process.exit(1); }
const hash = bcrypt.hashSync(p, 12);
const r = db.prepare('UPDATE admins SET password_hash=? WHERE username=?').run(hash, u);
if (!r.changes) db.prepare('INSERT INTO admins (username,password_hash) VALUES (?,?)').run(u, hash);
console.log(r.changes ? 'Password updated.' : 'New admin created.');
