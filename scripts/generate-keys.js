const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('Generating RS256 key pair for JWT signing...\n');

// Generate RSA key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

console.log('Private Key (PKCS8):');
console.log(privateKey);
console.log('\nPublic Key (SPKI):');
console.log(publicKey);

// Format for .env file
const privateKeyEscaped = privateKey.replace(/\n/g, '\\n');
const publicKeyEscaped = publicKey.replace(/\n/g, '\\n');

console.log('\n-----------------------------------');
console.log('Add these to your .env file:');
console.log('-----------------------------------\n');
console.log(`JWT_PRIVATE_KEY="${privateKeyEscaped}"`);
console.log(`JWT_PUBLIC_KEY="${publicKeyEscaped}"`);

// Optionally save to files
const keysDir = path.join(__dirname, '..', 'keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
}

fs.writeFileSync(path.join(keysDir, 'private-key.pem'), privateKey);
fs.writeFileSync(path.join(keysDir, 'public-key.pem'), publicKey);

console.log('\n-----------------------------------');
console.log('Keys also saved to:');
console.log(`  - keys/private-key.pem`);
console.log(`  - keys/public-key.pem`);
console.log('-----------------------------------');
console.log('\nIMPORTANT: Keep private-key.pem secure and never commit it to version control!');
