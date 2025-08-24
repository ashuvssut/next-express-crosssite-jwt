"use client";
import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<string>("");

  async function handleLogin() {
    const res = await fetch("/api/login", {
      method: "POST",
      // credentials: "include", // TODO: check if this is crucial or not
    });
    const data = await res.json();
    setStatus("Login: " + JSON.stringify(data));
  }

  async function handleMe() {
    const res = await fetch("/api/me", {
      // credentials: "include", // TODO: check if this is crucial or not
    });
    const data = await res.json();
    setStatus("Me: " + JSON.stringify(data));
  }

  return (
    <main className="p-4 space-y-4 flex gap-4">
      <button
        onClick={handleLogin}
        className="px-4 py-2 rounded bg-blue-600 text-white cursor-pointer"
      >
        Login (set cookie)
      </button>
      <button
        onClick={handleMe}
        className="px-4 py-2 rounded bg-green-600 text-white cursor-pointer"
      >
        Get /me (check cookie)
      </button>
      <p className="mt-4">{status}</p>
    </main>
  );
}
