# ZAGFORGE — Premium Full-Stack Client-Attract Portfolio

Version 4.1.0 refines the full-stack portfolio with an editable owner profile, server-side photo upload, flexible public links, and a polished portrait card. It retains persistent storage and the protected admin control center added in earlier versions.

## What is included

The public site keeps the premium dark technology design while becoming database-backed. The contact form now stores project briefs as inquiries instead of opening only a local mail client.

The private `/admin` dashboard provides:

- Secure admin login.
- Client inquiry inbox with status management.
- Project create/edit/delete.
- Service create/edit/delete.
- Public social/availability settings, editable profile identity and bio.
- Profile photo upload (PNG/JPG/WebP, up to 4 MB) or a hosted image URL.
- Additional public links entered as `Label | URL` lines, including social profiles, portfolio pages, certificates, and other HTTPS destinations.
- Password rotation.
- Dashboard KPIs for leads, new inquiries, projects, and services.
- Default public theme control for the five built-in visual themes.

## Architecture

```text
Visitor
  ↓
Premium public portfolio
  ↓
Node.js API
  ├── /api/public
  ├── /api/contact
  └── protected /api/admin/*
        ↓
   database.js
      ├── SQLite (Node 22.5+)
      └── JSON fallback (older Node)
```

## Single-level project structure

All included project files are placed directly in the repository root (no source folders):

```text
README.md
package.json
server.js
database.js
init-db.js
.env.example
.gitignore
index.html
styles.css
app.js
config.js
admin.html
admin.css
admin.js
404.html
robots.txt
site.webmanifest
sitemap.xml
ADMIN-PANEL-STATUS.md
ARCHITECTURE.md
CHANGELOG.md
```

The app automatically creates `data/` for its database and `uploads/` for profile photos at runtime. These generated folders are intentionally not included in the ZIP.

## Run locally

1. Install Node.js 18 or newer. Node 22.5+ is recommended so the project uses SQLite rather than the JSON fallback.
2. Open a terminal in this folder.
3. Optionally set administrator environment variables:

```bash
ADMIN_EMAIL=admin@yourdomain.com ADMIN_PASSWORD='use-a-long-password' npm start
```

On Windows PowerShell:

```powershell
$env:ADMIN_EMAIL='admin@yourdomain.com'
$env:ADMIN_PASSWORD='use-a-long-password'
npm start
```

4. Visit `http://localhost:3000/` for the public site.
5. Visit `http://localhost:3000/admin` for the dashboard.

When no admin variables are set, the server creates a local administrator named `admin@zagforge.local` and prints a generated first-run password in the terminal.

## Database

The preferred database file is:

`data/zagforge.sqlite`

The server creates the schema and seed content automatically on first start. `npm run init-db` can initialize the database manually.

For production, keep `data/` on persistent storage. If your hosting platform uses an ephemeral filesystem, the database can disappear when the instance is recreated.

## Security notes

Passwords are stored as salted scrypt hashes. Session cookies are HttpOnly and SameSite=Lax. Session tokens are hashed before persistence. The login route has a basic brute-force limiter. The API validates and bounds incoming fields, while the browser escapes database content before rendering it as HTML.

This is a strong portfolio-grade foundation, but a high-traffic production deployment should still add HTTPS, centralized rate limiting, audit logging, backups, monitoring, and a managed multi-instance database/session layer.

## Admin workflow

1. Receive a client project brief through the public contact form.
2. Open `/admin` and sign in.
3. Review the inquiry and change its status.
4. Edit projects/services from the portfolio CMS.
5. Update social links and availability from public settings.
6. Set the public default theme from **Public settings**.
7. Upload your portrait, edit your profile details, and add extra links from **Public settings**. Extra links use one line each: `Label | URL`. Domains without a scheme are automatically treated as HTTPS.
8. Rotate the admin password from the security panel.

See `ARCHITECTURE.md` and `ADMIN-PANEL-STATUS.md` for the implementation details.


## ZAGFORGE 4.0 — premium portfolio layer

The 4.0 build extends the existing 3.1 architecture without introducing a dependency-heavy frontend framework.

### Public experience
- Multi-theme visual system remains client-selectable and admin-defaultable.
- Scroll-aware border/reveal effects now cover CMS-rendered cards and content.
- Project filter pills with Featured/category filtering.
- Case-study modal powered by CMS fields: role, duration, outcome, stack, and narrative.
- Testimonials and FAQ sections are database-backed and editable from admin.
- Command palette (`Ctrl/Cmd + K`) for section/project navigation.
- Mobile conversion CTA, back-to-top control, copy-email action, and brief templates.
- Announcement bar and optional booking link controlled from admin settings.
- SEO metadata, Open Graph basics, JSON-LD, sitemap and 404 fallback.

### Private operations
- Existing protected admin authentication and password rotation retained.
- Anonymous daily analytics for page views, contact starts/submissions, project opens, and theme switches.
- Lead priority + private notes in addition to status workflow.
- CSV inquiry export and JSON backup download.
- Testimonial and FAQ CRUD.
- Expanded project case-study CMS.
- SEO, announcement, response-time, location, booking and social controls.

### Publishing notes
Replace the seeded placeholder testimonial, contact email, social URLs, and project demos with real evidence before using the portfolio as a public client-acquisition asset. The CMS deliberately makes these values editable rather than hard-coding them into the design.


## Uploading to GitHub

All source files—including the public website, admin panel, documentation, and database initializer—are placed directly in the archive root with no nested source folders. The server only exposes the intended public website assets; backend code and configuration files are not served as public pages. Runtime-generated database and profile-photo directories are created automatically. Do not commit real `.env` values, generated database files, or uploaded personal photos unless you intentionally want them public in the repository.

## Public link safety

Additional profile links accept ordinary HTTP/HTTPS destinations (including popular social platforms and links without an explicit `https://`). For safety, executable `javascript:` URLs and other unsafe schemes are not rendered as public links.
