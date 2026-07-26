import { useState, useMemo, useRef, useEffect, useCallback } from "react";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BLUE   = "#4B6EF5";
const ORANGE = "#E85D04";
const GREEN  = "#17A34A";
const FONT   = "'Sora', 'Segoe UI', sans-serif";
const BG     = "#F0F2F8";
const BASE   = import.meta.env.VITE_BASEURL ?? "";

// ─── API endpoints ────────────────────────────────────────────────────────────
const API = {
  subjects:   `${BASE}/api/curriculum/subjects`,
  levels:     `${BASE}/api/curriculum/levels`,
  categories: `${BASE}/api/curriculum/categories`,
};

// ─── Status palette  (matches Subject.status enum: Active | Locked | Maintenance)
const STATUS_STYLES = {
  Active:      { bg: "#D1FAE5", color: "#065F46", border: "#6EE7B7" },
  Locked:      { bg: "#FEF3C7", color: "#78350F", border: "#FCD34D" },
  Maintenance: { bg: "#DBEAFE", color: "#1E3A8A", border: "#93C5FD" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Book:     () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Lock:     () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Chart:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  Alert:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Search:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Plus:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  LockSm:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Unlock:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  Trash:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Export:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  ChevDown: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  X:        () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Files:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Refresh:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
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
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)"}
    >
      <div style={{ color: accent }}><IconComp /></div>
      <p style={{ margin: 0, fontSize: 10, color: "#6B7280", fontFamily: FONT, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</p>
      <p style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 700, color: loading ? "#E5E7EB" : "#111827", fontFamily: FONT, lineHeight: 1 }}>
        {loading ? "—" : typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Locked;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 9px", borderRadius: 99,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 10.5, fontWeight: 600, fontFamily: FONT, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block", flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ─── FilterSelect ─────────────────────────────────────────────────────────────
function FilterSelect({ value, onChange, children, minW = 130 }) {
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        height: 33, padding: "0 28px 0 10px", borderRadius: 8,
        border: "1.5px solid #E2E6F0", background: "#fff",
        fontFamily: FONT, fontSize: 12, color: "#374151",
        outline: "none", appearance: "none", cursor: "pointer", minWidth: minW,
      }}
        onFocus={e => e.target.style.borderColor = BLUE}
        onBlur={e  => e.target.style.borderColor = "#E2E6F0"}
      >
        {children}
      </select>
      <span style={{ position: "absolute", right: 8, pointerEvents: "none", color: "#9CA3AF", display: "flex" }}>
        <Icon.ChevDown />
      </span>
    </div>
  );
}

// ─── ActionBtn ────────────────────────────────────────────────────────────────
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
    }}
      onMouseEnter={e => { if (disabled) return; if (extraStyle.background === BLUE) { e.currentTarget.style.background = "#3A5DE0"; return; } e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.color = BLUE; }}
      onMouseLeave={e => { if (disabled) return; if (extraStyle.background === BLUE) { e.currentTarget.style.background = BLUE; return; } e.currentTarget.style.borderColor = extraStyle.borderColor || "#E2E6F0"; e.currentTarget.style.color = extraStyle.color || "#374151"; }}
    >
      {IconComp && <IconComp />}{label}
    </button>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
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

// ─── Field component (for modal) ──────────────────────────────────────────────
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

// ─── AddSubjectModal ──────────────────────────────────────────────────────────
function AddSubjectModal({ onClose, onSaved, levels, categories }) {
  const [form, setForm]   = useState({
    subject_name:   "",
    subject_code:   "",
    subject_type:   "Core",
    syllabus_board: "ZIMSEC",
    level_id:       levels[0]?.level_id ?? "",
    category_id:    categories[0]?.category_id ?? "",
    status:         "Active",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.subject_name.trim())  e.subject_name  = "Required";
    if (!form.subject_code.trim())  e.subject_code  = "Required";
    if (!form.level_id)             e.level_id      = "Required";
    if (!form.category_id)          e.category_id   = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch(API.subjects, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, level_id: +form.level_id, category_id: +form.category_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) { setErrors(data.errors); return; }
        throw new Error(data.message || `Server error ${res.status}`);
      }
      onSaved(data.message || "Subject created successfully.");
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
    boxSizing: "border-box", boxShadow: errors[key] ? "0 0 0 3px rgba(239,68,68,0.10)" : `0 0 0 3px rgba(75,110,245,0.10)`,
  });

  const selectStyle = {
    width: "100%", height: 36, padding: "0 28px 0 10px", borderRadius: 8,
    border: "1.5px solid #E2E6F0", fontFamily: FONT, fontSize: 13,
    color: "#111827", outline: "none", appearance: "none", cursor: "pointer", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 460, maxWidth: "92vw", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ margin: 0, fontFamily: FONT, fontWeight: 700, fontSize: 16, color: "#111827" }}>Add New Subject</p>
            <p style={{ margin: "2px 0 0", fontFamily: FONT, fontSize: 11, color: "#6B7280" }}>Create a curriculum subject for the bot</p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "#F3F4F6", borderRadius: 7, padding: "5px 6px", cursor: "pointer", display: "flex", color: "#6B7280" }}>
            <Icon.X />
          </button>
        </div>

        {/* Global error */}
        {errors._global && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "9px 12px", fontFamily: FONT, fontSize: 12, color: "#7F1D1D", marginBottom: 14 }}>
            {errors._global}
          </div>
        )}

        {/* Subject Name */}
        <Field label="Subject Name" required>
          <input value={form.subject_name} onChange={e => set("subject_name", e.target.value)}
            placeholder="e.g. Mathematics" style={inputStyle("subject_name")} />
          {errors.subject_name && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#EF4444", fontFamily: FONT }}>{errors.subject_name}</p>}
        </Field>

        {/* Subject Code */}
        <Field label="Subject Code" required>
          <input value={form.subject_code} onChange={e => set("subject_code", e.target.value.toUpperCase())}
            placeholder="e.g. MATH01" style={inputStyle("subject_code")} />
          {errors.subject_code && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#EF4444", fontFamily: FONT }}>{errors.subject_code}</p>}
        </Field>

        {/* Academic Level */}
        <Field label="Academic Level" required>
          <div style={{ position: "relative" }}>
            <select value={form.level_id} onChange={e => set("level_id", e.target.value)} style={selectStyle}>
              {levels.map(l => <option key={l.level_id} value={l.level_id}>{l.level_name}</option>)}
            </select>
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9CA3AF", display: "flex" }}><Icon.ChevDown /></span>
          </div>
          {errors.level_id && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#EF4444", fontFamily: FONT }}>{errors.level_id}</p>}
        </Field>

        {/* Category */}
        <Field label="Category" required>
          <div style={{ position: "relative" }}>
            <select value={form.category_id} onChange={e => set("category_id", e.target.value)} style={selectStyle}>
              {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
            </select>
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9CA3AF", display: "flex" }}><Icon.ChevDown /></span>
          </div>
          {errors.category_id && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#EF4444", fontFamily: FONT }}>{errors.category_id}</p>}
        </Field>

        {/* Subject Type + Syllabus Board — side by side */}
        <div style={{ display: "flex", gap: 10 }}>
          <Field label="Subject Type">
            <div style={{ position: "relative" }}>
              <select value={form.subject_type} onChange={e => set("subject_type", e.target.value)} style={selectStyle}>
                {["Core", "Elective", "Optional", "Practical"].map(t => <option key={t}>{t}</option>)}
              </select>
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9CA3AF", display: "flex" }}><Icon.ChevDown /></span>
            </div>
          </Field>
          <Field label="Syllabus Board">
            <div style={{ position: "relative" }}>
              <select value={form.syllabus_board} onChange={e => set("syllabus_board", e.target.value)} style={selectStyle}>
                {["ZIMSEC", "Cambridge", "Cambridge(GCSE)", "HEXCO"].map(b => <option key={b}>{b}</option>)}
              </select>
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9CA3AF", display: "flex" }}><Icon.ChevDown /></span>
            </div>
          </Field>
        </div>

        {/* Status */}
        <Field label="Status">
          <div style={{ position: "relative" }}>
            <select value={form.status} onChange={e => set("status", e.target.value)} style={selectStyle}>
              <option>Active</option>
              <option>Locked</option>
              <option>Maintenance</option>
            </select>
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9CA3AF", display: "flex" }}><Icon.ChevDown /></span>
          </div>
        </Field>

        {/* Footer */}
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, height: 38, borderRadius: 9, border: "1.5px solid #E2E6F0", background: "#fff", fontFamily: FONT, fontSize: 13, fontWeight: 500, color: "#6B7280", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, height: 38, borderRadius: 9, border: "none", background: saving ? "#7aadff" : BLUE, fontFamily: FONT, fontSize: 13, fontWeight: 700, color: "#fff", cursor: saving ? "not-allowed" : "pointer", transition: "background 0.15s" }}>
            {saving ? "Saving…" : "Save Subject"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pagination helper ────────────────────────────────────────────────────────
function buildPageNums(page, total) {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (page > 3) pages.push("…");
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
  if (page < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

// ─── Extract stat from summary dict ──────────────────────────────────────────
// summary shape from API: { "Grade 7": { "Active": 3, "Locked": 1 }, ... }
function getStat(summary, levelName, status) {
  return summary?.[levelName]?.[status] ?? 0;
}

// ══════════════════════════════════════════════════════════════════════════════
export default function CurriculumContentManager({ isMobile = false }) {

  // ── Server state ───────────────────────────────────────────────────────────
  const [subjects, setSubjects]     = useState([]);
  const [summary, setSummary]       = useState({});
  const [pagination, setPagination] = useState({ total_records: 0, total_pages: 1, current_page: 1, per_page: 20 });
  const [loading, setLoading]       = useState(true);
  const [apiError, setApiError]     = useState(null);

  // ── Modal data (loaded once) ───────────────────────────────────────────────
  const [levels, setLevels]         = useState([]);
  const [categories, setCategories] = useState([]);

  // ── Filter / sort / UI state ───────────────────────────────────────────────
  const [search, setSearch]         = useState("");
  const [levelF, setLevelF]         = useState("");       // empty = all
  const [statusF, setStatusF]       = useState("");       // empty = all
  const [page, setPage]             = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selected, setSelected]     = useState([]);
  const [showAdd, setShowAdd]       = useState(false);
  const [toast, setToast]           = useState(null);
  const toastTimer                  = useRef(null);

  const showToast = (msg, color = BLUE) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, color });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  // ── Fetch subjects (re-runs when filters or page change) ───────────────────
  const fetchSubjects = useCallback(async () => {
    let cancelled = false;
    setLoading(true);
    setApiError(null);

    const params = new URLSearchParams({ page, per_page: rowsPerPage });
    if (search)  params.set("search",  search);
    if (levelF)  params.set("level_id", levelF);
    if (statusF) params.set("status",  statusF);

    try {
      const res  = await fetch(`${API.subjects}?${params}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (!cancelled) {
        setSubjects(data.subjects);
        setPagination(data.pagination);
        setSummary(data.summary);
      }
    } catch (err) {
      if (!cancelled) setApiError(err.message);
    } finally {
      if (!cancelled) setLoading(false);
    }

    return () => { cancelled = true; };
  }, [page, rowsPerPage, search, levelF, statusF]);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  // ── Fetch levels + categories once (for modal dropdowns) ──────────────────
  useEffect(() => {
    Promise.all([
      fetch(API.levels).then(r => r.json()),
      fetch(API.categories).then(r => r.json()),
    ]).then(([lData, cData]) => {
      setLevels(lData.levels     ?? []);
      setCategories(cData.categories ?? []);
    }).catch(() => {
      // Non-critical — modal will render with empty dropdowns
    });
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalPages     = pagination.total_pages;
  const safeP          = pagination.current_page;
  const pageNums       = buildPageNums(safeP, totalPages);
  const allPageSelected = subjects.length > 0 && subjects.every(s => selected.includes(s.sub_id));

  // ── Selection ─────────────────────────────────────────────────────────────
  const toggleRow = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => {
    const ids = subjects.map(s => s.sub_id);
    setSelected(p => allPageSelected ? p.filter(id => !ids.includes(id)) : [...new Set([...p, ...ids])]);
  };

  // ── Optimistic lock toggle ─────────────────────────────────────────────────
  const handleLockToggle = async (sub_id) => {
    const subject = subjects.find(s => s.sub_id === sub_id);
    if (!subject || subject.status === "Maintenance") {
      showToast("Subjects under maintenance cannot be toggled", ORANGE);
      return;
    }

    // Optimistic update
    const newStatus = subject.status === "Locked" ? "Active" : "Locked";
    setSubjects(ss => ss.map(s => s.sub_id === sub_id ? { ...s, status: newStatus } : s));

    try {
      const res = await fetch(`${API.subjects}/${sub_id}/toggle-lock`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        // Revert on failure
        setSubjects(ss => ss.map(s => s.sub_id === sub_id ? { ...s, status: subject.status } : s));
        showToast(data.message || "Failed to update status", "#EF4444");
        return;
      }
      showToast(data.message, newStatus === "Locked" ? ORANGE : GREEN);
    } catch {
      setSubjects(ss => ss.map(s => s.sub_id === sub_id ? { ...s, status: subject.status } : s));
      showToast("Network error — status not saved", "#EF4444");
    }
  };

  // // ── Delete ────────────────────────────────────────────────────────────────
  // const handleDelete = async (sub_id) => {
  //   const subject = subjects.find(s => s.sub_id === sub_id);
  //   if (!subject) return;

  //   // Optimistic remove
  //   setSubjects(ss => ss.filter(s => s.sub_id !== sub_id));
  //   setSelected(p => p.filter(x => x !== sub_id));

  //   try {
  //     const res  = await fetch(`${API.subjects}/${sub_id}`, { method: "DELETE" });
  //     const data = await res.json();
  //     if (!res.ok) {
  //       // Revert — put it back
  //       setSubjects(ss => [subject, ...ss]);
  //       showToast(data.message || "Delete failed", "#EF4444");
  //       return;
  //     }
  //     showToast(data.message, "#EF4444");
  //     // Refresh to get accurate pagination totals
  //     fetchSubjects();
  //   } catch {
  //     setSubjects(ss => [subject, ...ss]);
  //     showToast("Network error — subject not deleted", "#EF4444");
  //   }
  // };

  // ── Bulk lock / unlock ────────────────────────────────────────────────────
  const handleBulkStatus = async (targetStatus) => {
    const ids = selected.filter(id => {
      const s = subjects.find(x => x.sub_id === id);
      return s && s.status !== "Maintenance";
    });
    if (ids.length === 0) { showToast("No eligible subjects selected", ORANGE); return; }

    // Optimistic
    setSubjects(ss => ss.map(s => ids.includes(s.sub_id) ? { ...s, status: targetStatus } : s));

    // Fire PATCH for each — parallel, fire-and-forget is fine for bulk
    await Promise.allSettled(
      ids.map(id => fetch(`${API.subjects}/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: targetStatus }),
      }))
    );

    showToast(
      `${ids.length} subject(s) ${targetStatus === "Locked" ? "locked" : "unlocked"}`,
      targetStatus === "Locked" ? ORANGE : GREEN
    );
    setSelected([]);
  };

  // ── After add — refetch to get fresh counts ────────────────────────────────
  const handleSaved = (message) => {
    setShowAdd(false);
    showToast(message, GREEN);
    fetchSubjects();
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
        .ccm-root * { box-sizing: border-box; }
        .ccm-root input[type="checkbox"] { width: 14px; height: 14px; accent-color: ${BLUE}; cursor: pointer; }
        .ccm-table-wrap::-webkit-scrollbar { height: 5px; }
        .ccm-table-wrap::-webkit-scrollbar-thumb { background: #CBD2E8; border-radius: 3px; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .ccm-bulk { animation: fadeInUp 0.22s ease; }
        .ccm-row:hover td { background: #F5F8FF !important; }
        .ccm-skeleton { background: linear-gradient(90deg,#F0F2F8 25%,#E5E7EB 50%,#F0F2F8 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div className="ccm-root" style={{ width: "100%", background: BG, fontFamily: FONT }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", padding: pad, gap: 14 }}>

          {/* ── Header ────────────────────────────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? 17 : 20, fontWeight: 700, color: "#0F1729", letterSpacing: "-0.3px" }}>
                Curriculum & Content Manager
              </h2>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#7B8AAB" }}>
                Manage subjects, academic levels, and resource availability across ZIMSEC & Cambridge syllabi.
              </p>
            </div>
            <button onClick={fetchSubjects} title="Refresh" style={{ display: "flex", alignItems: "center", gap: 5, height: 32, padding: "0 12px", borderRadius: 8, border: "1.5px solid #E2E6F0", background: "#fff", fontFamily: FONT, fontSize: 12, color: "#6B7280", cursor: "pointer" }}>
              <Icon.Refresh /> Refresh
            </button>
          </div>

          {/* ── Stat Cards ────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            <StatCard icon={Icon.Book}  label="Grade 7 Active"      value={getStat(summary, "Grade 7", "Active")}      accent={GREEN}  isMobile={isMobile} loading={loading} />
            <StatCard icon={Icon.Book}  label="O-Level Active"       value={getStat(summary, "O-Level",  "Active")}      accent={GREEN}  isMobile={isMobile} loading={loading} />
            <StatCard icon={Icon.Book}  label="A-Level Active"       value={getStat(summary, "A-Level",  "Active")}      accent={GREEN}  isMobile={isMobile} loading={loading} />
            <StatCard icon={Icon.Lock}  label="Grade 7 Locked"       value={getStat(summary, "Grade 7", "Locked")}       accent={ORANGE} isMobile={isMobile} loading={loading} />
            <StatCard icon={Icon.Lock}  label="O-Level Locked"       value={getStat(summary, "O-Level",  "Locked")}      accent={ORANGE} isMobile={isMobile} loading={loading} />
            <StatCard icon={Icon.Lock}  label="A-Level Locked"       value={getStat(summary, "A-Level",  "Locked")}      accent={ORANGE} isMobile={isMobile} loading={loading} />
          </div>

          {/* ── Toolbar ───────────────────────────────────────────────────── */}
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(15,23,41,0.06), 0 0 0 1px rgba(15,23,41,0.04)", padding: "9px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>

            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 180px", minWidth: 140 }}>
              <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", display: "flex", pointerEvents: "none" }}>
                <Icon.Search />
              </span>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search subjects or codes…"
                style={{ width: "100%", height: 33, padding: "0 10px 0 29px", borderRadius: 8, border: "1.5px solid #E2E6F0", background: "#fff", fontFamily: FONT, fontSize: 12, outline: "none", color: "#111827" }}
                onFocus={e => e.target.style.borderColor = BLUE}
                onBlur={e  => e.target.style.borderColor = "#E2E6F0"}
              />
            </div>

            {/* Level filter — populated from API */}
            <FilterSelect value={levelF} onChange={v => { setLevelF(v); setPage(1); }} minW={140}>
              <option value="">Level: All</option>
              {levels.map(l => <option key={l.level_id} value={l.level_id}>{l.level_name}</option>)}
            </FilterSelect>

            {/* Status filter */}
            <FilterSelect value={statusF} onChange={v => { setStatusF(v); setPage(1); }} minW={140}>
              <option value="">Status: All</option>
              <option value="Active">Active</option>
              <option value="Locked">Locked</option>
              <option value="Maintenance">Maintenance</option>
            </FilterSelect>

            {/* Rows per page */}
            <FilterSelect value={rowsPerPage} onChange={v => { setRowsPerPage(+v); setPage(1); }} minW={100}>
              {[10, 20, 50].map(n => <option key={n} value={n}>{n} rows</option>)}
            </FilterSelect>

            <div style={{ width: 1, height: 22, background: "#E2E6F0", flexShrink: 0 }} />

            <ActionBtn icon={Icon.Export} label="Export" onClick={() => showToast("Exporting CSV…", BLUE)} />

            <ActionBtn
              icon={Icon.Plus}
              label="Add New Subject"
              onClick={() => setShowAdd(true)}
              extraStyle={{ marginLeft: "auto", background: BLUE, color: "#fff", borderColor: BLUE, fontWeight: 700 }}
            />
          </div>

          {/* ── Bulk action bar ────────────────────────────────────────────── */}
          {selected.length > 0 && (
            <div className="ccm-bulk" style={{ background: "#EEF1FD", border: "1px solid #C7D1FC", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: BLUE }}>
                {selected.length} subject{selected.length > 1 ? "s" : ""} selected
              </span>
              <div style={{ display: "flex", gap: 7 }}>
                <button onClick={() => handleBulkStatus("Locked")} style={{ height: 30, padding: "0 13px", borderRadius: 8, border: `1px solid ${ORANGE}`, background: "#FEF3C7", color: ORANGE, fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon.LockSm /> Lock All
                </button>
                <button onClick={() => handleBulkStatus("Active")} style={{ height: 30, padding: "0 13px", borderRadius: 8, border: `1px solid ${GREEN}`, background: "#D1FAE5", color: GREEN, fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon.Unlock /> Unlock All
                </button>
              </div>
              <button onClick={() => setSelected([])} style={{ marginLeft: "auto", border: "none", background: "transparent", cursor: "pointer", color: "#7B8AAB", display: "flex", padding: 2 }}>
                <Icon.X />
              </button>
            </div>
          )}

          {/* ── Error banner ──────────────────────────────────────────────── */}
          {apiError && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "10px 14px", fontFamily: FONT, fontSize: 12.5, color: "#7F1D1D", display: "flex", alignItems: "center", gap: 8 }}>
              <Icon.Alert /> Failed to load subjects: {apiError}.
              <button onClick={fetchSubjects} style={{ marginLeft: "auto", fontSize: 12, color: "#7F1D1D", fontFamily: FONT, fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                Retry
              </button>
            </div>
          )}

          {/* ── Table ─────────────────────────────────────────────────────── */}
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(15,23,41,0.06), 0 0 0 1px rgba(15,23,41,0.04)", overflow: "hidden" }}>
            <div className="ccm-table-wrap" style={{ overflowX: "auto", overflowY: "visible" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 700 }}>
                <colgroup>
                  <col style={{ width: 38  }} />
                  <col style={{ width: 46  }} />
                  <col style={{ width: "28%" }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 110 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, cursor: "default" }}>
                      <input type="checkbox" checked={allPageSelected} onChange={toggleAll} />
                    </th>
                    <th style={thStyle}>No.</th>
                    <th style={thStyle}>Subject Name</th>
                    <th style={thStyle}>Level</th>
                    <th style={thStyle}>Code</th>
                    <th style={thStyle}>Syllabus</th>
                    <th style={thStyle}>Resources</th>
                    <th style={thStyle}>Status</th>
                    <th style={{ ...thStyle, cursor: "default" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Loading skeleton rows */}
                  {loading && Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`sk${i}`}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} style={{ ...tdStyle, padding: "13px 12px" }}>
                          <div className="ccm-skeleton" style={{ height: 12, width: j === 2 ? "80%" : j === 0 ? 14 : "60%" }} />
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Data rows */}
                  {!loading && subjects.map((s, idx) => {
                    const isSel = selected.includes(s.sub_id);
                    const rowBg = isSel ? "#EFF6FF" : idx % 2 === 0 ? "#fff" : "#FAFBFC";
                    return (
                      <tr key={s.sub_id} className="ccm-row" style={{ background: rowBg }}>
                        <td style={{ ...tdStyle, padding: "9px 0 9px 12px" }}>
                          <input type="checkbox" checked={isSel} onChange={() => toggleRow(s.sub_id)} />
                        </td>
                        <td style={{ ...tdStyle, color: "#9CA3AF", fontWeight: 500, fontSize: 11 }}>
                          {(safeP - 1) * rowsPerPage + idx + 1}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: "#0F1729", maxWidth: 0 }} title={s.subject_name}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <span style={{ width: 26, height: 26, borderRadius: 7, background: "#EEF1FD", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12 }}>📘</span>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.subject_name}</span>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 6, fontSize: 10.5, fontWeight: 700, fontFamily: FONT, background: "#EEF1FD", color: BLUE, whiteSpace: "nowrap" }}>
                            {s.level_name}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 11, color: "#6B7280" }}>
                          {s.subject_code}
                        </td>
                        <td style={{ ...tdStyle, fontSize: 11, color: "#6B7280" }}>
                          {s.syllabus_board}
                        </td>
                        <td style={tdStyle}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: FONT, fontSize: 12, fontWeight: 600, color: s.total_resources > 0 ? "#0F1729" : "#D1D5DB" }}>
                            <Icon.Files />
                            {s.total_resources} {s.total_resources === 1 ? "File" : "Files"}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <StatusBadge status={s.status} />
                        </td>
                        <td style={{ ...tdStyle, overflow: "visible" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button title="Edit" onClick={() => showToast(`Editing "${s.subject_name}"`, BLUE)}
                              style={{ background: "#EFF6FF", border: "none", borderRadius: 7, padding: "5px 6px", cursor: "pointer", color: BLUE, display: "flex" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#DBEAFE"}
                              onMouseLeave={e => e.currentTarget.style.background = "#EFF6FF"}
                            ><Icon.Edit /></button>
                            <button title={s.status === "Locked" ? "Unlock" : "Lock"} onClick={() => handleLockToggle(s.sub_id)}
                              style={{ background: s.status === "Locked" ? "#D1FAE5" : "#FEF3C7", border: "none", borderRadius: 7, padding: "5px 6px", cursor: "pointer", color: s.status === "Locked" ? GREEN : ORANGE, display: "flex" }}
                              onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                            >
                              {s.status === "Locked" ? <Icon.Unlock /> : <Icon.LockSm />}
                            </button>
                            {/* <button title="Delete" onClick={() => handleDelete(s.sub_id)}
                              style={{ background: "#FEF2F2", border: "none", borderRadius: 7, padding: "5px 6px", cursor: "pointer", color: "#DC2626", display: "flex" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#FEE2E2"}
                              onMouseLeave={e => e.currentTarget.style.background = "#FEF2F2"}
                            ><Icon.Trash /></button> */}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Empty state */}
                  {!loading && subjects.length === 0 && !apiError && (
                    <tr>
                      <td colSpan={9} style={{ padding: "52px 0", textAlign: "center", color: "#9CA3AF", fontFamily: FONT, fontSize: 13 }}>
                        {search || levelF || statusF
                          ? "No subjects match the current filters — try adjusting your search or filters"
                          : "No subjects yet — click Add New Subject to get started"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ─────────────────────────────────────────────── */}
            <div style={{ padding: "9px 14px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 7 }}>
              <p style={{ margin: 0, fontSize: 11, color: "#6B7280", fontFamily: FONT }}>
                Showing <strong>{pagination.total_records === 0 ? 0 : (safeP - 1) * rowsPerPage + 1}–{Math.min(safeP * rowsPerPage, pagination.total_records)}</strong> of <strong>{pagination.total_records}</strong> subjects
              </p>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <button onClick={() => setPage(1)} disabled={safeP === 1} style={{ ...pgBtn, opacity: safeP === 1 ? 0.35 : 1 }}>«</button>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safeP === 1} style={{ ...pgBtn, opacity: safeP === 1 ? 0.35 : 1 }}>‹</button>
                {pageNums.map((pn, i) =>
                  pn === "…"
                    ? <span key={`e${i}`} style={{ width: 28, textAlign: "center", fontSize: 12, color: "#9CA3AF" }}>…</span>
                    : <button key={pn} onClick={() => setPage(pn)} style={{ ...pgBtn, background: safeP === pn ? BLUE : "#fff", color: safeP === pn ? "#fff" : "#374151", border: safeP === pn ? "none" : "1px solid #E2E6F0", fontWeight: safeP === pn ? 700 : 500 }}>{pn}</button>
                )}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safeP === totalPages} style={{ ...pgBtn, opacity: safeP === totalPages ? 0.35 : 1 }}>›</button>
                <button onClick={() => setPage(totalPages)} disabled={safeP === totalPages} style={{ ...pgBtn, opacity: safeP === totalPages ? 0.35 : 1 }}>»</button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Add Subject Modal ──────────────────────────────────────────────── */}
      {showAdd && (
        <AddSubjectModal
          onClose={() => setShowAdd(false)}
          onSaved={handleSaved}
          levels={levels}
          categories={categories}
        />
      )}

      {toast && <Toast msg={toast.msg} color={toast.color} />}
    </>
  );
}

// ─── pgBtn style constant ─────────────────────────────────────────────────────
const pgBtn = {
  width: 28, height: 28, borderRadius: 7,
  border: "1px solid #E2E6F0", background: "#fff",
  fontFamily: FONT, fontSize: 13, cursor: "pointer",
  color: "#374151", display: "flex", alignItems: "center", justifyContent: "center",
  transition: "all 0.13s",
};