# CHANGELOG

## 4.1.0 — Profile and admin publishing upgrade
- Added a dedicated profile portrait card in the About section with editable name, title, and bio.
- Added authenticated profile photo upload for PNG, JPEG, and WebP images up to 4 MB, with file-signature checks.
- Added a hosted profile-image URL option and admin photo preview.
- Added a flexible multi-link editor (`Label | URL`) for any ordinary public HTTPS/social/portfolio/certificate link.
- Normalized bare domains to HTTPS in supported admin link fields and blocked unsafe URL schemes in the public link renderer.
- Refined the dark theme with a premium glass header, subtle lighting, elevated cards, and responsive profile styling.
- Repacked the source archive with root project files outside an extra enclosing directory.


## 3.0.0

- Added a protected `/admin` dashboard with KPI cards, lead inbox, project CMS, service CMS, public settings, and password rotation.
- Added persistent SQLite storage through Node `node:sqlite` with a JSON compatibility fallback for older Node runtimes.
- Added salted scrypt password hashing and server-side hashed session tokens.
- Added HttpOnly/SameSite admin session cookies and basic login rate limiting.
- Changed the public contact form from `mailto:` to a database-backed inquiry endpoint.
- Connected projects, services, availability, and social links to the public API so admin edits appear on the portfolio.
- Added input validation, HTML escaping, request-size limits, security headers, and noindex metadata for the admin surface.
- Added architecture and deployment documentation.

## 2.0.0

- Reworked the visual system for a more premium, restrained client-facing presentation.
- Removed pseudo-metrics that could be mistaken for verified results.
- Marked example projects as concepts / portfolio builds.
- Replaced the original static contact workflow with the full-stack lead pipeline in 3.0.0.
- Replaced the Express dependency stack with Node.js built-ins only.
- Added `config.js` for the professional contact email fallback.
- Added `/api/health` for local deployment verification.
- Added explicit architecture messaging and source documentation.


## 3.1 — Multi-theme + scroll border polish

- Added five public themes: Forge, Matrix, Violet, Ember, and Pearl.
- Added a visitor-side theme picker with local persistence.
- Added an admin-controlled default public theme setting.
- Added animated border-line effects that activate as boxes enter the viewport and replay when scrolling back.
- Kept the existing authenticated admin/session architecture for private management.

## 4.0.0 — Premium agency layer
- Added case-study fields and modal presentation.
- Added testimonials and FAQ CMS with public rendering.
- Added private anonymous daily analytics.
- Added inquiry priority and private notes.
- Added CSV export and JSON backup.
- Added project filters, command palette, mobile CTA, brief templates and copy-email action.
- Added SEO/meta/announcement/booking controls, sitemap and 404 page.
