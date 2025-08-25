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
