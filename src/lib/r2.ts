import { S3Client } from '@aws-sdk/client-s3'

/**
 * Cloudflare R2 is S3-compatible, so we talk to it with the AWS S3 SDK.
 * Region is always 'auto' for R2.
 */

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY

export const R2_BUCKET = process.env.R2_BUCKET || 'medcapsula'

/**
 * Public base URL files are served from — either the bucket's r2.dev
 * subdomain or a custom domain. No trailing slash.
 */
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '')

/** True when every env var needed to talk to R2 is present. */
export function isR2Configured(): boolean {
  return Boolean(ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY && R2_PUBLIC_URL)
}

let client: S3Client | null = null

export function getR2Client(): S3Client {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured — check the R2_* environment variables')
  }
  // Reused across invocations on a warm serverless instance.
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: ACCESS_KEY_ID!,
        secretAccessKey: SECRET_ACCESS_KEY!,
      },
    })
  }
  return client
}

/** Public URL for a stored object key. */
export function publicUrlFor(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`
}
