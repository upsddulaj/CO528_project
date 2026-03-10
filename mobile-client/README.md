# DECP Mobile Client (API Integration Starter)

This folder contains a minimal mobile integration starter specification for Flutter/React Native.

## Expected API usage
- `POST /auth/register` / `POST /auth/login`
- `GET /posts` / `POST /posts`
- `GET /jobs` / `POST /jobs/:id/apply`
- `GET /events` / `POST /events/:id/rsvp`
- `GET /notifications`

## Suggested implementation tasks
1. Create auth screens and JWT secure storage.
2. Build feed list + create post flow.
3. Build jobs list + apply flow.
4. Build events list + RSVP flow.
5. Build notifications screen.

This ensures both web and mobile clients consume the same backend service contracts.
