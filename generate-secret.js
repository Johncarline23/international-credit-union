const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('hex');
console.log('================================================');
console.log('Your new SESSION_SECRET:');
console.log(secret);
console.log('================================================');
console.log('Copy this value to your .env file and Vercel Environment Variables.');