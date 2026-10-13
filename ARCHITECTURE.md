# ZAGFORGE Full-Stack Architecture

## Public side

`index.html` provides the visual shell and fallback content. `app.js` calls `/api/public` and hydrates projects, services, availability, and social links from the database.

## Admin side

`admin.html` + `admin.css` + `admin.js` form the private control center. The browser never receives database credentials or password hashes.

## Server side

`server.js` provides:

- Static asset delivery.
- Public content APIs.
- Contact/lead creation.
- Authentication and session management.
- Protected CRUD routes.
- Security headers and input-size limits.

## Persistence

`database.js` contains the storage adapter. It supports SQLite through Node's `node:sqlite` and a JSON fallback for older runtimes.

## Main data model

- `admin_users`: administrator identity + scrypt password hash.
- `sessions`: hashed login tokens + expiry.
- `projects`: portfolio content and presentation settings.
- `services`: service catalog.
- `inquiries`: visitor project briefs and lead statuses.
- `settings`: editable public site configuration.

## Security boundary

The public API exposes only public site content. Administrative records are available only after session authentication. HTML rendering in the browser escapes database content before injecting it into the page.
