import "dotenv/config";

// make sure required variables exist, so we fail early with a clear message
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  JWT_SECRET: required("JWT_SECRET"),
  DATABASE_URL: required("DATABASE_URL"),
};