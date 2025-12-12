// Simple environment variable validation
function getEnv(key, defaultValue) {
  const value = process.env[key] || defaultValue;
  if (!value && !defaultValue) {
    console.warn(`Warning: Missing environment variable ${key}`);
  }
  return value;
}

export const env = {
  DATABASE_URL: getEnv('DATABASE_URL'),
  UPSTASH_REDIS_REST_URL: getEnv('UPSTASH_REDIS_REST_URL'),
  UPSTASH_REDIS_REST_TOKEN: getEnv('UPSTASH_REDIS_REST_TOKEN'),
  BREVO_API_KEY: getEnv('BREVO_API_KEY'),
  SENDER_EMAIL: getEnv('SENDER_EMAIL'),
  SENDER_NAME: getEnv('SENDER_NAME', 'UniVerse Identity'),
  JWT_PRIVATE_KEY: getEnv('JWT_PRIVATE_KEY'),
  JWT_PUBLIC_KEY: getEnv('JWT_PUBLIC_KEY'),
  JWT_ISSUER: getEnv('JWT_ISSUER'),
  JWT_AUDIENCE: getEnv('JWT_AUDIENCE'),
  SESSION_SECRET: getEnv('SESSION_SECRET'),
  CSRF_SECRET: getEnv('CSRF_SECRET'),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  NEXT_PUBLIC_APP_URL: getEnv('NEXT_PUBLIC_APP_URL'),
  NEXT_PUBLIC_APP_NAME: getEnv('NEXT_PUBLIC_APP_NAME', 'UniVerse Identity'),
};
