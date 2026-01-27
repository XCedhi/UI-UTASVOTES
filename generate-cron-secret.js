/**
 * Generate a secure random secret for cron job authentication
 * Run: node generate-cron-secret.js
 */

const crypto = require('crypto');

// Generate a secure random string
const secret = crypto.randomBytes(32).toString('base64');

console.log('\n🔐 Generated CRON_SECRET:\n');
console.log(secret);
console.log('\n📝 Add this to your .env file:\n');
console.log(`CRON_SECRET=${secret}`);
console.log('\n✅ Keep this secret secure and never commit it to version control!\n');
