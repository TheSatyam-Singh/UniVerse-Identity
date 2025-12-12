#!/usr/bin/env node

const readline = require('readline');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🔧 OAuth Client Generator\n');
  
  const name = await question('Client Name: ');
  const clientId = await question('Client ID (press Enter to auto-generate): ') || nanoid(16);
  const clientSecret = await question('Client Secret: ');
  const redirectUrisInput = await question('Redirect URIs (comma-separated): ');
  
  const redirectUris = redirectUrisInput.split(',').map(uri => uri.trim());
  const hashedSecret = bcrypt.hashSync(clientSecret, 12);
  
  console.log('\n✅ OAuth Client Configuration:\n');
  console.log('Copy this data into Prisma Studio or use it in your database:\n');
  console.log('Client ID:', clientId);
  console.log('Client Secret (hashed):', hashedSecret);
  console.log('Name:', name);
  console.log('Redirect URIs:', JSON.stringify(redirectUris));
  console.log('\n⚠️  Save the plain client secret somewhere safe! You\'ll need it for authentication.');
  console.log('Client Secret (plain):', clientSecret);
  
  console.log('\n📋 SQL Insert (update USER_ID):\n');
  console.log(`INSERT INTO "OAuthClient" ("id", "clientId", "clientSecret", "name", "redirectUris", "ownerId", "createdAt", "updatedAt")
VALUES (
  '${nanoid()}',
  '${clientId}',
  '${hashedSecret}',
  '${name}',
  '{${redirectUris.map(uri => `"${uri}"`).join(',')}}',
  'USER_ID_HERE',
  NOW(),
  NOW()
);`);
  
  rl.close();
}

main().catch(console.error);
