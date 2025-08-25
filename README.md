# Next.js + Express JWT-based Cookie Playground

This repo demonstrates **JWT-based auth using cookies** with a Next.js frontend and Express backend hosted on different origins. It demonstates usage of Next.js API rewrites to make the client requests same-origin. It’s a playground for experimenting with **secure cookie storage, CSRF protection, and auth middleware**.

## Features

- Secure cookies policies (HttpOnly, Secure, SameSite)
- CSRF protection (double-submit cookie)
  - When `SameSite=Lax`, CSRF tokens are required for state-changing HTTP requests (e.g., POST `/login`, POST `/logout`)
  - When `SameSite=Strict`, CSRF tokens are not required. The `requireCsrf` middleware is disabled
- Rate limiting, helmet, compression
- Public and protected routes
- Role-based routes (`hasRole` middleware) — e.g., `/admin`
- `isAuth` middleware: protects routes by verifying JWT in cookies
- `logout` endpoint: clears cookies

## Endpoints

| Method | Path    | Description                     |
| ------ | ------- | ------------------------------- |
| POST   | /login  | Login (sets JWT + CSRF cookie)  |
| POST   | /logout | Clears cookies                  |
| GET    | /public | Public route                    |
| GET    | /me     | Protected route (requires auth) |
| GET    | /admin  | Admin-only route                |


# Local development
These instructions should get you set up ready to work on the project locally.

## Getting Started
1. Install dependencies: `yarn`
2. Install `mkcert`: `brew install mkcert` followed by `yarn setup-https`. If you are not using macOS, follow the instructions [here](https://github.com/FiloSottile/mkcert?tab=readme-ov-file#installation).
3. Create a host entry in your local hosts file, `/etc/hosts` for `app.playground.localtest` and `api.playground.localtest` pointing to `localhost`:
```
127.0.0.1       app.playground.localtest
127.0.0.1       api.playground.localtest
```

## Running the Dev Servers
- Run both the frontend and backend servers concurrently: `yarn dev:https`
