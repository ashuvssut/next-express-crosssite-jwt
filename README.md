# Next.js + Express Cookie/JWT Playground

This repo demonstrates **JWT-based auth using cookies** with a Next.js frontend and Express backend. It’s a playground for **secure cookie storage, CSRF protection, and auth middleware**.

## Features

- `isAuth` middleware: protects routes by verifying JWT in cookies
- `logout` endpoint: clears cookies
- CSRF protection (double-submit cookie)
- Role-based routes (`hasRole`) — e.g., `/admin`
- Public and protected routes
- Rate limiting, helmet, compression
- Secure cookies (`HttpOnly`, `SameSite=Strict`, `Secure`)

## Endpoints

| Method | Path        | Description                     |
| ------ | ----------- | ------------------------------- |
| GET    | /health     | Health check                    |
| GET    | /csrf-token | Issue CSRF token                |
| POST   | /login      | Login (sets JWT + CSRF cookie)  |
| POST   | /logout     | Clears cookies                  |
| GET    | /public     | Public route                    |
| GET    | /me         | Protected route (requires auth) |
| GET    | /admin      | Admin-only route                |
