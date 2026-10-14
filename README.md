# DO Spaces Demo

Basic Next.js app: enter a **Name**, pick a **Thumbnail** image, upload it to
**DigitalOcean Spaces** (S3-compatible) via a Server Action, and save the
record in **Neon Postgres** via Prisma. Uploaded items are listed on the
home page.

## Tech stack

- Next.js 16
- Prisma 7.10.0 + `@prisma/adapter-neon` (Neon serverless driver adapter)
- AWS SDK v3 (`@aws-sdk/client-s3`) pointed at the DO Spaces endpoint
- Tailwind CSS

## Setup

### 1. Fill in `.env`

This repo does not (and should not) contain real credentials. Open `.env`
and fill in:

```
DATABASE_URL=              # Neon connection string (Neon dashboard -> Connection Details)
DO_SPACES_ENDPOINT=        # e.g. https://nyc3.digitaloceanspaces.com
DO_SPACES_REGION=          # e.g. nyc3
DO_SPACES_BUCKET=          # your Space's name
DO_SPACES_KEY=             # Spaces access key
DO_SPACES_SECRET=          # Spaces secret key
DO_SPACES_PUBLIC_URL=      # optional: CDN base URL, otherwise auto-derived
```

### 2. Push the schema to your database

```bash
npx prisma db push
```

(Or `npx prisma migrate dev` if you'd rather track migrations.)

### 3. Run the app

```bash
npm run dev
```

Visit http://localhost:3000.

## How it works

- [prisma/schema.prisma](prisma/schema.prisma) — single `Item` model: `name`, `thumbnailUrl`, `thumbnailKey`.
- [src/lib/prisma.ts](src/lib/prisma.ts) — Prisma client using the Neon adapter, lazily created so a missing `DATABASE_URL` doesn't crash the build.
- [src/lib/spaces.ts](src/lib/spaces.ts) — S3 client configured for the DO Spaces endpoint, plus a helper to build the public file URL.
- [src/app/actions.ts](src/app/actions.ts) — `createItem` Server Action: validates input, uploads the file to Spaces, then writes the row to the database.
- [src/components/UploadForm.tsx](src/components/UploadForm.tsx) — the form (Name + Thumbnail file input).
- [src/app/page.tsx](src/app/page.tsx) — server component that renders the form and lists saved items.

Make sure your Space's file permissions allow public read on uploaded
objects (the action uploads with `ACL: public-read`) if you want the
thumbnails to be viewable directly via the returned URL.
