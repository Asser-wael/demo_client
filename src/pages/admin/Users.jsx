import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PiUsersDuotone, PiMagnifyingGlassDuotone } from "react-icons/pi";

import { getUsers } from "../../features/users/usersSlice";

/* =========================================================
   ROLE BADGE
========================================================= */

function RoleBadge({ role }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
        isAdmin
          ? "border-accent/30 bg-accent/10 text-accent"
          : "border-border text-muted"
      }`}
    >
      {role}
    </span>
  );
}

/* =========================================================
   ROW SKELETON
========================================================= */

function RowSkeleton() {
  return (
    <tr className="border-b border-border">
      <td className="px-4 py-4" colSpan={4}>
        <div className="h-4 w-full animate-pulse bg-border/50" />
      </td>
    </tr>
  );
}

/* =========================================================
   USERS
========================================================= */

export default function Users() {
  const dispatch = useDispatch();
  const { users, pagination, loading } = useSelector((state) => state.users);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(getUsers({ page, limit: 20, search }));
    }, 300);

    return () => clearTimeout(timeout);
  }, [dispatch, page, search]);

  return (
    <main className="min-h-screen bg-bg text-text">
      {/* =================================================
          HEADER
      ================================================= */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8 sm:py-7 lg:px-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
            Restaurant Admin
          </p>
          <h1 className="mt-1 font-serif text-2xl tracking-tight text-text sm:text-3xl lg:text-4xl">
            Users
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted">
            Everyone with an account — diners and admins.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8 sm:py-7 lg:px-10">
        {/* =================================================
            SEARCH
        ================================================= */}
        <div className="flex items-center gap-2 border border-border bg-card px-3 py-2.5 sm:max-w-sm">
          <PiMagnifyingGlassDuotone className="shrink-0 text-lg text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search by name or email"
            className="w-full bg-transparent text-sm text-text placeholder:text-muted focus:outline-none"
          />
        </div>

        {/* =================================================
            TABLE
        ================================================= */}
        <section className="mt-6 border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
                    Name
                  </th>
                  <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
                    Email
                  </th>
                  <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
                    Role
                  </th>
                  <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && !users.length ? (
                  <>
                    <RowSkeleton />
                    <RowSkeleton />
                    <RowSkeleton />
                  </>
                ) : !users.length ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center">
                      <PiUsersDuotone className="mx-auto text-3xl text-muted" />
                      <p className="mt-3 text-sm font-medium text-text">
                        No users found
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Try a different search.
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b border-border last:border-0 hover:bg-bg/60"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-bg text-xs font-semibold text-text">
                            {(u.name || "?")[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-text">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted">{u.email}</td>
                      <td className="px-4 py-3.5">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-4 py-3.5 text-muted">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* =================================================
            PAGINATION
        ================================================= */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-4 py-4">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border border-border px-4 py-2 text-sm font-medium transition hover:bg-border/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm text-muted">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="border border-border px-4 py-2 text-sm font-medium transition hover:bg-border/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
