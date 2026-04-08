# Gallery / Upload Backend — Next Steps

Current state completed today:
- `gallery.html` now has the service/tag UX structure.
- `upload.html` now has the upload/tag/delete admin UX structure.
- `data/gallery.json` stores the current service list + photo metadata.
- `js/gallery-admin.js` renders gallery sections from `gallery.json` and supports in-browser tag/delete behavior as a front-end scaffold.

What is NOT complete yet:
- Real file upload persistence
- Real multi-tag save persistence
- Real delete persistence
- Resume submission backend for `apply.html`
- Auth/protection for `/upload`

Recommended next backend step:
1. Add a Cloudflare Worker API
2. Add object storage for images (R2 recommended)
3. Add metadata storage (D1 or KV; D1 preferred)
4. Wire these endpoints:
   - `GET /api/gallery`
   - `POST /api/gallery/upload`
   - `POST /api/gallery/:id/tags`
   - `DELETE /api/gallery/:id`
   - `POST /api/apply`
5. Protect `/upload` behind simple auth

Suggested data model:
## photos
- id
- file_key
- public_url
- caption
- created_at

## photo_tags
- photo_id
- tag_id

## tags
- id
- label
- sort_order

## applications
- id
- name
- phone
- email
- resume_file_key
- about
- created_at
