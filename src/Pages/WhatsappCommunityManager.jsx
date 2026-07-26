import { useState, useMemo, useRef, useEffect, useCallback } from "react";

// ─── Brand Tokens ─────────────────────────────────────────────────────────────
const BLUE   = "#4B6EF5";
const ORANGE = "#E85D04";
const GREEN  = "#17A34A";
const PURPLE = "#8B5CF6";
const FONT   = "'Sora', 'Segoe UI', sans-serif";
const BG     = "#F0F2F8";
const BASE   = import.meta.env.VITE_BASEURL ?? "";

// ─── API Endpoints ────────────────────────────────────────────────────────────
const API = {
  communities: `${BASE}/api/whatsapp-communities`,
  levels:      `${BASE}/api/curriculum/levels`,
  subjects:    `${BASE}/api/curriculum/subjects`,
};

// ─── Status Palette ───────────────────────────────────────────────────────────
const STATUS_STYLES = {
  active:   { bg: "#D1FAE5", color: "#065F46", border: "#6EE7B7" },
  inactive: { bg: "#FEF3C7", color: "#78350F", border: "#FCD34D" },
  archived: { bg: "#E5E7EB", color: "#374151", border: "#D1D5DB" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Users:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Link:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Book:     () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Award:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Archive:  () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
  Search:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Plus:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  LockSm:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Unlock:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  Export:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  ChevDown: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  X:        () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Refresh:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  External: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
};

// ─── Helper UI Components ─────────────────────────────────────────────────────
function StatCard({ icon: IconComp, label, value, accent, isMobile, loading }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      padding: isMobile ? "13px 11px" : "14px 16px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
      flex: 1, minWidth: isMobile ? "calc(50% - 6px)" : 0,
      borderBottom: `3px solid ${accent}`,
      display: "flex", flexDirection: "column", gap: 5,
      transition: "box-shadow 0.18s",
    }}>
      <div style={{ color: accent }}><IconComp /></div>
      <p style={{ margin: 0, fontSize: 10, color: "#6B7280", fontFamily: FONT, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</p>
      <p style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 700, color: loading ? "#E5E7EB" : "#111827", fontFamily: FONT, lineHeight: 1 }}>
        {loading ? "—" : typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.inactive;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 9px", borderRadius: 99,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 10.5, fontWeight: 600, fontFamily: FONT, textTransform: "capitalize",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block", flexShrink: 0 }} />
      {status}
    </span>
  );
}

function FilterSelect({ value, onChange, children, minW = 130 }) {
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        height: 33, padding: "0 28px 0 10px", borderRadius: 8,
        border: "1.5px solid #E2E6F0", background: "#fff",
        fontFamily: FONT, fontSize: 12, color: "#374151",
        outline: "none", appearance: "none", cursor: "pointer", minWidth: minW,
      }}>
        {children}
      </select>
      <span style={{ position: "absolute", right: 8, pointerEvents: "none", color: "#9CA3AF", display: "flex" }}>
        <Icon.ChevDown />
      </span>
    </div>
  );
}

function ActionBtn({ icon: IconComp, label, onClick, extraStyle = {}, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "5px 10px", borderRadius: 8, border: "1.5px solid #E2E6F0",
      background: "#fff", color: "#374151", cursor: disabled ? "not-allowed" : "pointer",
      fontSize: 11, fontFamily: FONT, fontWeight: 500,
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)", whiteSpace: "nowrap",
      opacity: disabled ? 0.5 : 1, transition: "all 0.13s",
      ...extraStyle,
    }}>
      {IconComp && <IconComp />}{label}
    </button>
  );
}

function Toast({ msg, color }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: "#1E293B", color: "#fff", padding: "11px 18px",
      borderRadius: 12, fontFamily: FONT, fontSize: 13, fontWeight: 600,
      boxShadow: "0 8px 30px rgba(0,0,0,0.18)", borderLeft: `4px solid ${color}`,
      pointerEvents: "none",
    }}>{msg}</div>
  );
}

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", marginBottom: 5, fontFamily: FONT, fontSize: 11.5, fontWeight: 600, color: "#374151" }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Add/Edit Community Modal ────────────────────────────────────────────────
function CommunityModal({ onClose, onSaved, levels, subjects, editItem = null }) {
  const [form, setForm] = useState({
    group_name: editItem?.group_name || "",
    group_type: editItem?.group_type || "study_group",
    invite_link: editItem?.invite_link || "",
    admin_name: editItem?.admin_name || "",
    level_id: editItem?.level_id ?? "",
    sub_id: editItem?.sub_id ?? "",
    status: editItem?.status || "active",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.group_name.trim()) e.group_name = "Group Name is required";
    if (!form.group_type) e.group_type = "Group Type is required";
    if (!form.invite_link.trim()) {
      e.invite_link = "Invite link is required";
    } else if (!form.invite_link.startsWith("https://chat.whatsapp.com/")) {
      e.invite_link = "Must be a valid WhatsApp invite link";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        level_id: form.level_id ? +form.level_id : null,
        sub_id: form.sub_id ? +form.sub_id : null,
      };

      const url = editItem ? `${API.communities}/${editItem.group_id}` : API.communities;
      const method = editItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) { setErrors(data.errors); return; }
        throw new Error(data.message || `Server error ${res.status}`);
      }
      onSaved(data.message || `Community ${editItem ? "updated" : "created"} successfully.`);
    } catch (err) {
      setErrors({ _global: err.message });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = (key) => ({
    width: "100%", height: 36, padding: "0 10px", borderRadius: 8,
    border: `1.5px solid ${errors[key] ? "#EF4444" : BLUE}`,
    fontFamily: FONT, fontSize: 13, color: "#111827", outline: "none",
    boxSizing: "border-box",
  });

  const selectStyle = {
    width: "100%", height: 36, padding: "0 28px 0 10px", borderRadius: 8,
    border: "1.5px solid #E2E6F0", fontFamily: FONT, fontSize: 13,
    color: "#111827", outline: "none", appearance: "none", cursor: "pointer", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 480, maxWidth: "92vw", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ margin: 0, fontFamily: FONT, fontWeight: 700, fontSize: 16, color: "#111827" }}>
              {editItem ? "Edit WhatsApp Community" : "Add New WhatsApp Group"}
            </p>
            <p style={{ margin: "2px 0 0", fontFamily: FONT, fontSize: 11, color: "#6B7280" }}>
              Link study groups, scholarships, and academic communities
            </p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "#F3F4F6", borderRadius: 7, padding: "5px 6px", cursor: "pointer", color: "#6B7280" }}>
            <Icon.X />
          </button>
        </div>

        {errors._global && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "9px 12px", fontFamily: FONT, fontSize: 12, color: "#7F1D1D", marginBottom: 14 }}>
            {errors._global}
          </div>
        )}

        <Field label="Group Name" required>
          <input value={form.group_name} onChange={e => set("group_name", e.target.value)} placeholder="e.g. O-Level Mathematics Prep Group" style={inputStyle("group_name")} />
          {errors.group_name && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#EF4444", fontFamily: FONT }}>{errors.group_name}</p>}
        </Field>

        <Field label="Invite Link" required>
          <input value={form.invite_link} onChange={e => set("invite_link", e.target.value)} placeholder="https://chat.whatsapp.com/..." style={inputStyle("invite_link")} />
          {errors.invite_link && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#EF4444", fontFamily: FONT }}>{errors.invite_link}</p>}
        </Field>

        <div style={{ display: "flex", gap: 10 }}>
          <Field label="Group Type" required>
            <div style={{ position: "relative" }}>
              <select value={form.group_type} onChange={e => set("group_type", e.target.value)} style={selectStyle}>
                <option value="study_group">Study Group</option>
                <option value="scholarship">Scholarship</option>
                <option value="community">General Community</option>
              </select>
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9CA3AF" }}><Icon.ChevDown /></span>
            </div>
          </Field>

          <Field label="Status">
            <div style={{ position: "relative" }}>
              <select value={form.status} onChange={e => set("status", e.target.value)} style={selectStyle}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9CA3AF" }}><Icon.ChevDown /></span>
            </div>
          </Field>
        </div>

        <Field label="Admin Name">
          <input value={form.admin_name} onChange={e => set("admin_name", e.target.value)} placeholder="e.g. Mr. Chisamba / IQHub Team" style={inputStyle("admin_name")} />
        </Field>

        <div style={{ display: "flex", gap: 10 }}>
          <Field label="Academic Level (Optional)">
            <div style={{ position: "relative" }}>
              <select value={form.level_id} onChange={e => set("level_id", e.target.value)} style={selectStyle}>
                <option value="">All Levels (General)</option>
                {levels.map(l => <option key={l.level_id} value={l.level_id}>{l.level_name}</option>)}
              </select>
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9CA3AF" }}><Icon.ChevDown /></span>
            </div>
          </Field>

          <Field label="Subject Context (Optional)">
            <div style={{ position: "relative" }}>
              <select value={form.sub_id} onChange={e => set("sub_id", e.target.value)} style={selectStyle}>
                <option value="">No Specific Subject</option>
                {subjects.map(s => <option key={s.sub_id} value={s.sub_id}>{s.subject_name}</option>)}
              </select>
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9CA3AF" }}><Icon.ChevDown /></span>
            </div>
          </Field>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, height: 38, borderRadius: 9, border: "1.5px solid #E2E6F0", background: "#fff", fontFamily: FONT, fontSize: 13, fontWeight: 500, color: "#6B7280", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, height: 38, borderRadius: 9, border: "none", background: saving ? "#7aadff" : BLUE, fontFamily: FONT, fontSize: 13, fontWeight: 700, color: "#fff", cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving…" : editItem ? "Update Group" : "Save Community"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function WhatsappCommunityManager({ isMobile = false }) {
  const [groups, setGroups]         = useState([]);
  const [summary, setSummary]       = useState({});
  const [pagination, setPagination] = useState({ total_records: 0, total_pages: 1, current_page: 1, per_page: 20 });
  const [loading, setLoading]       = useState(true);
  const [apiError, setApiError]     = useState(null);

  const [levels, setLevels]         = useState([]);
  const [subjects, setSubjects]     = useState([]);

  const [search, setSearch]         = useState("");
  const [typeF, setTypeF]           = useState("");
  const [levelF, setLevelF]         = useState("");
  const [statusF, setStatusF]       = useState("");
  const [page, setPage]             = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [selected, setSelected]     = useState([]);
  const [modalItem, setModalItem]   = useState(null); // null = add, object = edit
  const [showModal, setShowModal]   = useState(false);
  const [toast, setToast]           = useState(null);
  const toastTimer                  = useRef(null);

  const showToast = (msg, color = BLUE) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, color });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    const params = new URLSearchParams({ page, per_page: rowsPerPage });
    if (search)  params.set("search", search);
    if (typeF)   params.set("group_type", typeF);
    if (levelF)  params.set("level_id", levelF);
    if (statusF) params.set("status", statusF);

    try {
      const res = await fetch(`${API.communities}?${params}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setGroups(data.groups || []);
      setPagination(data.pagination || { total_records: 0, total_pages: 1, current_page: 1 });
      setSummary(data.summary || {});
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, typeF, levelF, statusF]);

  useEffect(() => { fetchCommunities(); }, [fetchCommunities]);

  useEffect(() => {
    Promise.all([
      fetch(API.levels).then(r => r.json()),
      fetch(API.subjects).then(r => r.json()),
    ]).then(([lData, sData]) => {
      setLevels(lData.levels || []);
      setSubjects(sData.subjects || []);
    }).catch(() => {});
  }, []);

  const handleStatusToggle = async (group_id, currentStatus) => {
    const targetStatus = currentStatus === "active" ? "inactive" : "active";
    setGroups(gs => gs.map(g => g.group_id === group_id ? { ...g, status: targetStatus } : g));

    try {
      const res = await fetch(`${API.communities}/${group_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (!res.ok) throw new Error();
      showToast(`Group set to ${targetStatus}`, targetStatus === "active" ? GREEN : ORANGE);
    } catch {
      setGroups(gs => gs.map(g => g.group_id === group_id ? { ...g, status: currentStatus } : g));
      showToast("Failed to update status", "#EF4444");
    }
  };

  const pad = isMobile ? "12px" : "20px";

  const thStyle = {
    padding: "10px 12px", textAlign: "left",
    fontFamily: FONT, fontSize: 10.5, fontWeight: 700,
    color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em",
    background: "#F7F8FC", borderBottom: "1px solid #E8EBF3",
    whiteSpace: "nowrap", position: "sticky", top: 0, zIndex: 2,
  };

  const tdStyle = {
    padding: "9px 12px", fontFamily: FONT, fontSize: 12,
    color: "#374151", whiteSpace: "nowrap",
    overflow: "hidden", textOverflow: "ellipsis",
    borderBottom: "1px solid #F0F2F8",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .wmc-root * { box-sizing: border-box; }
        .wmc-row:hover td { background: #F5F8FF !important; }
      `}</style>

      <div className="wmc-root" style={{ width: "100%", background: BG, fontFamily: FONT }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", padding: pad, gap: 14 }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? 17 : 20, fontWeight: 700, color: "#0F1729" }}>
                WhatsApp Communities Management
              </h2>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#7B8AAB" }}>
                Organize study groups, scholarship hubs, and main WhatsApp communities for students.
              </p>
            </div>
            <button onClick={fetchCommunities} style={{ display: "flex", alignItems: "center", gap: 5, height: 32, padding: "0 12px", borderRadius: 8, border: "1.5px solid #E2E6F0", background: "#fff", fontFamily: FONT, fontSize: 12, color: "#6B7280", cursor: "pointer" }}>
              <Icon.Refresh /> Refresh
            </button>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            <StatCard icon={Icon.Users}   label="Total Active Groups" value={summary.active_count || 0} accent={GREEN} isMobile={isMobile} loading={loading} />
            <StatCard icon={Icon.Book}    label="Study Groups"        value={summary.study_groups || 0} accent={BLUE} isMobile={isMobile} loading={loading} />
            <StatCard icon={Icon.Award}   label="Scholarship Hubs"    value={summary.scholarships || 0} accent={PURPLE} isMobile={isMobile} loading={loading} />
            <StatCard icon={Icon.Archive} label="Inactive / Archived"  value={summary.inactive_count || 0} accent={ORANGE} isMobile={isMobile} loading={loading} />
          </div>

          {/* Toolbar */}
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "9px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 180px", minWidth: 140 }}>
              <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", display: "flex", pointerEvents: "none" }}>
                <Icon.Search />
              </span>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search groups or admins…" style={{ width: "100%", height: 33, padding: "0 10px 0 29px", borderRadius: 8, border: "1.5px solid #E2E6F0", fontFamily: FONT, fontSize: 12, outline: "none" }} />
            </div>

            <FilterSelect value={typeF} onChange={v => { setTypeF(v); setPage(1); }}>
              <option value="">Type: All</option>
              <option value="study_group">Study Groups</option>
              <option value="scholarship">Scholarships</option>
              <option value="community">Communities</option>
            </FilterSelect>

            <FilterSelect value={levelF} onChange={v => { setLevelF(v); setPage(1); }}>
              <option value="">Level: All</option>
              {levels.map(l => <option key={l.level_id} value={l.level_id}>{l.level_name}</option>)}
            </FilterSelect>

            <FilterSelect value={statusF} onChange={v => { setStatusF(v); setPage(1); }}>
              <option value="">Status: All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </FilterSelect>

            <ActionBtn icon={Icon.Plus} label="Add WhatsApp Group" onClick={() => { setModalItem(null); setShowModal(true); }} extraStyle={{ marginLeft: "auto", background: BLUE, color: "#fff", borderColor: BLUE, fontWeight: 700 }} />
          </div>

          {/* Table */}
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 800 }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 46 }}>No.</th>
                    <th style={{ ...thStyle, width: "25%" }}>Group Name</th>
                    <th style={{ ...thStyle, width: 120 }}>Group Type</th>
                    <th style={{ ...thStyle, width: 110 }}>Academic Level</th>
                    <th style={{ ...thStyle, width: 130 }}>Subject Context</th>
                    <th style={{ ...thStyle, width: 120 }}>Admin</th>
                    <th style={{ ...thStyle, width: 100 }}>Status</th>
                    <th style={{ ...thStyle, width: 110 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && groups.map((g, idx) => (
                    <tr key={g.group_id} className="wmc-row">
                      <td style={{ ...tdStyle, color: "#9CA3AF" }}>{(page - 1) * rowsPerPage + idx + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: "#0F1729" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ fontSize: 14 }}>💬</span>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.group_name}</span>
                          <a href={g.invite_link} target="_blank" rel="noreferrer" title="Open WhatsApp Link" style={{ color: BLUE, display: "inline-flex" }}>
                            <Icon.External />
                          </a>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ textTransform: "capitalize", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: g.group_type === "scholarship" ? "#F3E8FF" : "#EEF1FD", color: g.group_type === "scholarship" ? PURPLE : BLUE }}>
                          {g.group_type.replace("_", " ")}
                        </span>
                      </td>
                      <td style={tdStyle}>{g.level_name || "All Levels"}</td>
                      <td style={tdStyle}>{g.subject_name || "General"}</td>
                      <td style={tdStyle}>{g.admin_name || "—"}</td>
                      <td style={tdStyle}><StatusBadge status={g.status} /></td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button title="Edit" onClick={() => { setModalItem(g); setShowModal(true); }} style={{ background: "#EFF6FF", border: "none", borderRadius: 7, padding: "5px 6px", cursor: "pointer", color: BLUE }}>
                            <Icon.Edit />
                          </button>
                          <button title={g.status === "active" ? "Deactivate" : "Activate"} onClick={() => handleStatusToggle(g.group_id, g.status)} style={{ background: g.status === "active" ? "#FEF3C7" : "#D1FAE5", border: "none", borderRadius: 7, padding: "5px 6px", cursor: "pointer", color: g.status === "active" ? ORANGE : GREEN }}>
                            {g.status === "active" ? <Icon.LockSm /> : <Icon.Unlock />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && groups.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: "40px 0", textAlign: "center", color: "#9CA3AF" }}>
                        No WhatsApp communities found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {showModal && (
        <CommunityModal
          editItem={modalItem}
          onClose={() => setShowModal(false)}
          onSaved={(msg) => { setShowModal(false); showToast(msg, GREEN); fetchCommunities(); }}
          levels={levels}
          subjects={subjects}
        />
      )}

      {toast && <Toast msg={toast.msg} color={toast.color} />}
    </>
  );
}