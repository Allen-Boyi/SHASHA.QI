import { useState, useEffect } from "react";

const VITE_BASE = import.meta.env.VITE_BASEURL ?? "";

// ─── Normalisers ──────────────────────────────────────────────────────────────

function normaliseBotUser(u) {
  return {
    id:         u.wuser_id,
    sid:        u.sid_number              ?? "",
    email:      u.email                   ?? "",
    username:   (u.username ?? "").replace(/^@/, ""),
    status:     u.status                  ?? "Inactive",
    lastActive: u.last_active             ?? "—",
    credits:    u.ai_credits?.remaining   ?? 0,
    maxCredits: u.ai_credits?.max         ?? 200,
    downloads:  u.download_counts         ?? 0,
    jid:        u.jid                     ?? "",
    phone:      "",
    role:       "",
    is_confirmed: null,
  };
}

function normaliseDashboardUser(u) {
  return {
    id:           u.id            ?? "",
    sid:          u.sid           ?? "",
    email:        u.email         ?? "",
    username:     u.username      ?? "",
    status:       u.status,         // boolean: is_active
    is_confirmed: u.is_confirmed,
    role:         u.role          ?? "",
    phone:        u.phone         ?? "",
    lastActive:   "—",
    credits:      0,
    maxCredits:   0,
    downloads:    0,
    jid:          u.sid           ?? "",
  };
}

// ─── Context config ───────────────────────────────────────────────────────────
// Each context defines: fetchUrl, normalise, smartGroups, searchFields,
// displayField (main label in picker), subField (secondary label in picker),
// and individualFilters (which dropdowns appear in individual mode).

export const CONTEXT_CONFIG = {
  botusers: {
    fetchUrl:     `${VITE_BASE}/api/botusers`,
    normalise:    normaliseBotUser,
    paginates:    true,   // uses /table?page=N endpoint with pagination envelope
    smartGroups: [
      { id:"all",          label:"All Students",      icon:"👥", desc:"Every registered student",                   filter: ()  => true },
      { id:"active",       label:"Active",             icon:"✅", desc:"Status = Active",                            filter: u   => u.status === "Active" },
      { id:"inactive",     label:"Inactive",           icon:"💤", desc:"Status = Inactive",                          filter: u   => u.status === "Inactive" },
      { id:"banned",       label:"Banned",             icon:"🚫", desc:"Status = Banned",                            filter: u   => u.status === "Banned" },
      { id:"suspended",    label:"Suspended",          icon:"⏸️", desc:"Status = Suspended",                         filter: u   => u.status === "Suspended" },
      { id:"pending",      label:"Pending",            icon:"⏳", desc:"Awaiting confirmation",                      filter: u   => u.status === "Pending" },
      { id:"no_credits",   label:"Out of Credits",     icon:"🪙", desc:"0 AI credits remaining",                     filter: u   => u.credits === 0 },
      { id:"low_credits",  label:"Low Credits",        icon:"⚠️", desc:"Below 30% of max credits",                   filter: u   => u.credits > 0 && u.credits <= u.maxCredits * 0.3 },
      { id:"high_credits", label:"High Credits",       icon:"💎", desc:"Above 70% of max credits",                   filter: u   => u.credits > u.maxCredits * 0.7 },
      { id:"no_downloads", label:"No Downloads",       icon:"📭", desc:"Never downloaded a resource",                filter: u   => u.downloads === 0 },
      { id:"power_users",  label:"Power Users",        icon:"⚡", desc:"Active + high credits + downloads > 10",     filter: u   => u.status === "Active" && u.credits > u.maxCredits * 0.5 && u.downloads > 10 },
    ],
    searchFields:   ["username", "email", "sid"],
    displayField:   u => `@${u.username}`,
    subField:       u => u.sid,
    individualFilters: ["status", "credits"],
  },

  dashboard: {
    fetchUrl:     `${VITE_BASE}/api/users`,
    normalise:    normaliseDashboardUser,
    paginates:    false,  // returns flat { users: [...] } with no pagination
    smartGroups: [
      { id:"all",          label:"All Staff",          icon:"👥", desc:"Every dashboard user",                       filter: ()  => true },
      { id:"active",       label:"Active",             icon:"✅", desc:"Account is active",                          filter: u   => u.status === true },
      { id:"inactive",     label:"Inactive",           icon:"💤", desc:"Account is inactive",                        filter: u   => u.status === false },
      { id:"confirmed",    label:"Confirmed",          icon:"✔️", desc:"Email confirmed",                            filter: u   => u.is_confirmed === true },
      { id:"unconfirmed",  label:"Unconfirmed",        icon:"📧", desc:"Email not yet confirmed",                    filter: u   => u.is_confirmed === false },
      { id:"admin",        label:"Admins",             icon:"🛡️", desc:"Role = Admin",                               filter: u   => u.role === "Admin" },
      { id:"teacher",      label:"Teachers",           icon:"📚", desc:"Role = Teacher",                             filter: u   => u.role === "Teacher" },
    ],
    searchFields:   ["username", "email", "phone"],
    displayField:   u => u.username,
    subField:       u => u.phone || u.email,
    individualFilters: ["status", "role", "confirmed"],
  },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Accepts fetchUrl + normalise from CONTEXT_CONFIG so it stays generic.
// For paginated endpoints (botusers) it auto-fetches all pages in parallel.
// For flat endpoints (dashboard /users) it reads data.users directly.

export function useUsers(fetchUrl, normalise, paginates = true) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchAll() {
      try {
        if (!paginates) {
          // Flat endpoint — single fetch, reads data.users
          const res  = await fetch(fetchUrl);
          if (!res.ok) throw new Error(`Server error ${res.status}`);
          const data = await res.json();
          if (!cancelled) setUsers((data.users ?? []).map(normalise));
          return;
        }

        // Paginated endpoint — fetch page 1, then remaining pages in parallel
        const firstRes  = await fetch(`${fetchUrl}?page=1&per_page=100&sort_dir=asc`);
        if (!firstRes.ok) throw new Error(`Server error ${firstRes.status}`);
        const firstData = await firstRes.json();

        const { total_pages } = firstData.pagination;
        let allUsers = firstData.users.map(normalise);

        if (total_pages > 1) {
          const rest = await Promise.all(
            Array.from({ length: total_pages - 1 }, (_, i) => i + 2).map(p =>
              fetch(`${fetchUrl}?page=${p}&per_page=100&sort_dir=asc`)
                .then(r => r.json())
                .then(d => d.users.map(normalise))
            )
          );
          allUsers = allUsers.concat(rest.flat());
        }

        if (!cancelled) setUsers(allUsers);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [fetchUrl]);

  return { users, loading, error };
}