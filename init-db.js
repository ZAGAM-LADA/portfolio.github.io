// scripts/init-db.js — small convenience command for manual database initialization.
const { initDatabase } = require('./database'); // Reuse the exact server initialization logic.
initDatabase(); // Create schema and seed content.
console.log('ZAGFORGE database initialized.'); // Confirm successful completion.
