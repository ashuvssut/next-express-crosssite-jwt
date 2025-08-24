# Why this playground works without `credentials: "include"` even though we are calling a different origin (localhost:4000)?

1. **Next.js rewrites make requests same-origin**

   * `/api/:path*` is rewritten to `http://localhost:4000/:path*` at runtime.
   * The browser **sees it as same-origin** (relative path `/api/...`) and automatically sends cookies for `/api/...`.

2. **HttpOnly cookies**

   * Your backend sets `accessToken` and CSRF cookies with `HttpOnly` (and `Secure` in prod).
   * These cookies are sent automatically by the browser on fetch to `/api/...`.
   * You **cannot read the `accessToken` cookie** in JS, which is correct — your frontend never touches it.

3. **CSRF double-submit cookie**

   * You fetch `/api/csrf-token` to get a JS-readable token (`HttpOnly: false`).
   * You then include it in the `x-csrf-token` header for unsafe methods (`POST`, `/refresh`, `/logout`, `/profile`).

4. **No cross-origin complications**

   * You do **not need `credentials: "include"`** because cookies are automatically sent for same-origin requests.
   * Adding `credentials: "include"` won’t break anything, but it’s redundant here.

# Next.js Readme Clutter (invalid commands)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
