#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generating RSA key pair for JWT signing...\n');

// Generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Generate session secret
const sessionSecret = crypto.randomBytes(32).toString('base64');

console.log('✅ Keys generated successfully!\n');
console.log('📝 Add these to your .env file:\n');
console.log('JWT_PRIVATE_KEY="' + privateKey.replace(/\n/g, '\\n') + '"\n');
console.log('JWT_PUBLIC_KEY="' + publicKey.replace(/\n/g, '\\n') + '"\n');
console.log('SESSION_SECRET="' + sessionSecret + '"\n');

// Optionally write to a file
const outputPath = path.join(process.cwd(), '.env.generated');
const envContent = `# Generated JWT keys - Copy these to your .env file
JWT_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"

JWT_PUBLIC_KEY="${publicKey.replace(/\n/g, '\\n')}"

SESSION_SECRET="${sessionSecret}"
`;

fs.writeFileSync(outputPath, envContent);
console.log(`💾 Keys also saved to ${outputPath}`);
console.log('⚠️  Remember to copy these to your .env file and delete .env.generated\n');
