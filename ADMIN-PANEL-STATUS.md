# ZAGFORGE ADMIN + DATABASE STATUS

## Version 3.1

The portfolio now uses a full-stack architecture:

`Browser → Node.js API → SQLite (preferred) / JSON fallback → Admin dashboard`

### Included

- Password-hashed administrator login using Node's built-in `crypto.scryptSync`.
- Server-side session tokens stored as SHA-256 hashes.
- HttpOnly + SameSite session cookie.
- Login rate limiting (five attempts per 15 minutes per client bucket).
- Persistent client inquiry / lead inbox.
- Lead status workflow: new → contacted → qualified → closed.
- Create, edit, and delete portfolio projects.
- Create, edit, and delete services.
- Public social links and availability settings.
- Public portfolio content is loaded from `/api/public`.
- Admin route is served at `/admin` and protected at the API layer.
- `robots` metadata prevents search indexing of the admin page.

### Database choice

Node 22.5+ uses the built-in `node:sqlite` module, so the project does not need an external npm database driver. The database file is created automatically at:

`data/zagforge.sqlite`

For Node versions where `node:sqlite` is unavailable, the same data access layer falls back to:

`data/zagforge.json`

The JSON path is intended as a compatibility option for local use. For production, use a current Node runtime with SQLite enabled.

### First login

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before starting the server. When those variables are not supplied, the server creates a local admin at `admin@zagforge.local` and prints a randomly generated first-run password to the terminal once.

After login, change the password from **Security → Change password**.

### Deployment notes

Use a persistent disk/volume for `data/` when deploying. A stateless server filesystem can lose the SQLite file when the host recreates the instance.

For a multi-instance production deployment, move the data layer to a managed database such as PostgreSQL and use a shared session strategy. The current project keeps the storage adapter isolated so that migration can happen without redesigning the public UI.


### Theme control
The admin dashboard now includes a **Default public theme** control. It writes to the existing protected settings API, and the public site uses that value for visitors who have not previously chosen a theme on their device.


## Profile media and links (4.1)

- Profile name, professional title, and introduction are editable from Public settings.
- A profile image can be uploaded to the server (PNG/JPEG/WebP, up to 4 MB) or referenced with a hosted image URL. Uploaded file signatures are checked before saving.
- Additional public links can be maintained as `Label | URL` lines; the public About card and footer render them dynamically. Bare domains are normalized to HTTPS by the server for known URL fields, and unsafe URL schemes are rejected by the public renderer.
