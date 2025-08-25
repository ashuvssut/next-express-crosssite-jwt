export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const APP_URL =
  typeof window !== "undefined" ? window.location.origin : undefined;
