# Decap CMS Setup (Method 2)

Your blog is now powered by Markdown + frontmatter and editable from `/admin`.

## Split hosting (recommended for your preference)

- **Vercel** hosts the public website.
- **Netlify** hosts CMS auth + editing flow.
- Publishing from Netlify CMS commits to GitHub, which then redeploys Vercel.

To make `/admin` on Vercel forward to Netlify CMS, set this env var in Vercel:

- `CMS_ADMIN_URL=https://your-site-name.netlify.app`

The project already includes a redirect in `next.config.mjs` that uses this value.

## What changed

- CMS UI lives at `/admin` (`public/admin/index.html`)
- CMS collection config is in `public/admin/config.yml`
- Blog posts live in `public/posts/*.md`
- Each post now has frontmatter (title/date/category/excerpt/etc.)
- `/blogs` and `/article/[id]` are generated from those markdown files

## Local authoring flow

1. Run your site: `npm run dev`
2. In a second terminal, run Decap local backend: `npm run cms:proxy`
3. Open `http://localhost:<next-port>/admin` (usually `3000`, or `3001` if 3000 is busy)
4. Create/edit posts in the CMS editor

Decap writes directly to `public/posts/*.md` while running locally.

## Production setup (Netlify Identity + Git Gateway)

Your `public/admin/config.yml` now uses:

- `backend.name: git-gateway`
- `branch: main`
- `local_backend: true` (for local authoring)

### Step-by-step

1. Push this repo to GitHub (already done in your case).
2. In Netlify, **Add new site** → **Import from Git** → pick this repo.
3. In Netlify site dashboard, go to **Site configuration → Identity**:
	- Click **Enable Identity**
	- Set **Registration** to **Invite only**
4. In the same Identity area, enable **Git Gateway**.
5. In **Identity → Users**, invite only your email.
6. Update `site_url` and `display_url` in `public/admin/config.yml` to your real Netlify URL.
7. Redeploy the site.
8. Open `/admin` on your deployed site and complete login via the invite email.
9. In Vercel project settings, set `CMS_ADMIN_URL` to the same Netlify URL and redeploy.

After this, visiting `https://your-vercel-domain/admin` will send you to Netlify CMS.

## Owner-only publishing

To ensure only you can publish:

1. Keep the repo private (or tightly permissioned)
2. Ensure only your GitHub account has write access
3. Protect `main` branch (optional but recommended)
4. In Netlify Identity, keep registration on **Invite only** and invite only yourself

If someone is not invited in Netlify Identity (and lacks repo write ability), they can’t create or edit posts.

## Frontmatter template for posts

```yaml
---
title: My New Note
date: 2026-03-31
category: Notes
excerpt: Short preview text for the blogs grid.
readTime: 4 min read
gradientClass: bg-gradient-to-br from-[#0a0a1a] to-[#00001c]
published: true
---
```
