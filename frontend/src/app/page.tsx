"use client";

import { useState } from "react";
import {
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  usePublicQuery,
  useAdminQuery,
} from "../../hooks/useReactQueryHooks";

export default function PlaygroundPage() {
  const [role, setRole] = useState<"user" | "admin">("user");

  // ====== Mutations ======
  const loginMutation = useLoginMutation(role);
  const logoutMutation = useLogoutMutation();

  // ====== Queries ======
  const meQuery = useMeQuery();
  const publicQuery = usePublicQuery();
  const adminQuery = useAdminQuery();

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Playground</h1>

      {/* Login / Logout Section */}
      <div className="space-y-2">
        <h2 className="font-semibold">Authentication</h2>
        <p className="text-sm text-gray-500">
          Login sets an HttpOnly JWT cookie. Logout clears it. CSRF token is
          issued on login and stored in a readable cookie.
        </p>
        <div className="flex gap-2 items-center">
          <label>
            Role:{" "}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "user" | "admin")}
              className="border p-1 rounded"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button
            onClick={() => loginMutation.mutate()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Login
          </button>
          <button
            onClick={() => logoutMutation.mutate()}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Endpoint Testing Section */}
      <div className="space-y-2">
        <h2 className="font-semibold">API Endpoints</h2>
        <div className="grid gap-2">
          <div>
            <button
              onClick={() => publicQuery.refetch()}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              /public
            </button>
            <p className="text-xs text-gray-400">
              Public endpoint. No authentication required.
            </p>
          </div>
          <div>
            <button
              onClick={() => meQuery.refetch()}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              /me
            </button>
            <p className="text-xs text-gray-400">
              Returns user info. Requires JWT cookie (login first).
            </p>
          </div>
          <div>
            <button
              onClick={() => adminQuery.refetch()}
              className="bg-purple-500 text-white px-4 py-2 rounded"
            >
              /admin
            </button>
            <p className="text-xs text-gray-400">
              Admin-only endpoint. Only accessible if logged in as role
              &quot;admin&quot;.
            </p>
          </div>
        </div>
      </div>

      {/* Logs Section */}
      <div className="space-y-2">
        <h2 className="font-semibold">Success Responses</h2>
        <p className="text-sm text-gray-500">
          Displays the latest response for each query or mutation.
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded max-h-[400px] overflow-auto">
          {JSON.stringify(
            {
              "/login": loginMutation.data,
              "/logout": logoutMutation.data,
              "/me": meQuery.data,
              "/public": publicQuery.data,
              "/admin": adminQuery.data,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
