import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

// DigitalOcean Spaces is S3-compatible, so we just point the AWS SDK's
// S3Client at the Spaces endpoint instead of an AWS region endpoint.
function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Did you set it in .env?`
    );
  }
  return value;
}

export function getSpacesConfig() {
  return {
    endpoint: requiredEnv("DO_SPACES_ENDPOINT"),
    region: requiredEnv("DO_SPACES_REGION"),
    bucket: requiredEnv("DO_SPACES_BUCKET"),
    accessKeyId: requiredEnv("DO_SPACES_KEY"),
    secretAccessKey: requiredEnv("DO_SPACES_SECRET"),
  };
}

let cachedClient: S3Client | null = null;

// Lazily create the client on first use (not at module load) so that simply
// importing this file doesn't crash pages/builds before the DO_SPACES_* env
// vars are set.
export function getSpacesClient(): S3Client {
  if (cachedClient) return cachedClient;

  const config = getSpacesConfig();

  cachedClient = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: false,
  });

  return cachedClient;
}

// Builds the public URL for an object once uploaded. No CDN — this is always
// the direct Spaces URL: https://<bucket>.<region>.digitaloceanspaces.com/<key>
export function buildPublicUrl(key: string): string {
  const { bucket, region } = getSpacesConfig();
  return `https://${bucket}.${region}.digitaloceanspaces.com/${key}`;
}
