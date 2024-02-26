const crypto = require('crypto');

function generateKey() {
    return crypto.randomBytes(64).toString('hex');
}

console.log(generateKey());