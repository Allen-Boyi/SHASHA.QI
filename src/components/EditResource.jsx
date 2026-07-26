import { useState, useRef, useEffect } from "react";
import {
  FileText, ChevronDown, Pencil, X,
  BookOpen, Layers, Tag, Calendar, CheckCircle2, Loader2,
  AlertCircle, CheckCircle, Save
} from "lucide-react";

const BLUE = "#1a2e5a";
const FONT = "'Segoe UI', sans-serif";
const YEARS = Array.from({ length: 15 }, (_, i) => String(2024 - i));
const baseURL = import.meta.env.VITE_BASEURL;

const inputBase = {
  width: "100%", boxSizing: "border-box",
  border: "1px solid #dbeafe", borderRadius: 10,
  background: "#fff", fontSize: 13, color: "#334155",
  fontFamily: FONT, outline: "none",
  paddingTop: 9, paddingBottom: 9,
};

// ── Toast
function Toast({ toast, onDismiss }) {
  const isSuccess = toast.type === "success";
  return (
    <div style={{
      position: "fixed", top: 20, left: "50%",
      transform: "translateX(-50%)", zIndex: 99999,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 18px", borderRadius: 12,
      background: isSuccess ? "#f0fdf4" : "#fef2f2",
      border: `1px solid ${isSuccess ? "#86efac" : "#fca5a5"}`,
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      maxWidth: 380, animation: "slideDown 0.25s ease", fontFamily: FONT,
    }}>
      {isSuccess
        ? <CheckCircle size={18} color="#16a34a" style={{ flexShrink: 0 }} />
        : <AlertCircle  size={18} color="#dc2626" style={{ flexShrink: 0 }} />}
      <span style={{ fontSize: 13, color: isSuccess ? "#166534" : "#991b1b", fontWeight: 500, lineHeight: 1.4, flex: 1 }}>
        {toast.message}
      </span>
      <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: isSuccess ? "#16a34a" : "#dc2626", padding: 2, display: "flex", alignItems: "center", flexShrink: 0 }}>
        <X size={14} />
      </button>
    </div>
  );
}

// ── SelectInput
function SelectInput({ icon: Icon, placeholder, options, value, onChange, disabled }) {
  return (
    <div style={{ position: "relative", minWidth: 0 }}>
      <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: disabled ? "#cbd5e1" : "#60a5fa", pointerEvents: "none", display: "flex" }}>
        <Icon size={14} />
      </span>
      <select
        value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        style={{ ...inputBase, paddingLeft: 32, paddingRight: 28, appearance: "none", cursor: disabled ? "not-allowed" : "pointer", color: value ? "#334155" : "#94a3b8", opacity: disabled ? 0.5 : 1 }}
      >
        <option value="" disabled style={{ color: "#94a3b8" }}>{placeholder}</option>
        {options.map((o) => {
          const val   = typeof o === "object" ? o.value : o;
          const label = typeof o === "object" ? o.label : o;
          return <option key={val} value={val}>{label}</option>;
        })}
      </select>
      <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#60a5fa", pointerEvents: "none", display: "flex" }}>
        {disabled ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <ChevronDown size={14} />}
      </span>
    </div>
  );
}

// ── TextInput
function TextInput({ icon: Icon, placeholder, value, onChange }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#60a5fa", pointerEvents: "none", display: "flex" }}>
        <Icon size={14} />
      </span>
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ ...inputBase, paddingLeft: 32, paddingRight: 12 }}
      />
    </div>
  );
}

// ── RadioGroup
function RadioGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT }}>
        {label}
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map((opt) => {
          const val = typeof opt === "object" ? opt.value : opt;
          const lbl = typeof opt === "object" ? opt.label : opt;
          return (
            <label key={val} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 10, cursor: "pointer",
              fontSize: 13, fontFamily: FONT, userSelect: "none",
              border: `1px solid ${value === val ? BLUE : "#dbeafe"}`,
              background: value === val ? BLUE : "#fff",
              color: value === val ? "#fff" : "#64748b",
              fontWeight: value === val ? 600 : 400,
            }}>
              <input type="radio" name={label} value={val} checked={value === val} onChange={() => onChange(val)} style={{ display: "none" }} />
              {value === val && <CheckCircle2 size={13} />}
              {lbl}
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ── Main EditResource component
export default function EditResource({ resourceId, onClose, onEditSuccess }) {
  const toastTimerRef = useRef(null);
  const [visible, setVisible]     = useState(false);
  const [isSaving, setIsSaving]   = useState(false);
  const [toast, setToast]         = useState(null);
  const [isMobile, setIsMobile]   = useState(
    typeof window !== "undefined" && window.innerWidth < 600
  );
  const [conflict, setConflict] = useState(null);

  // ── Options (from form_init)
  const [levels, setLevels]                 = useState([]);
  const [subjects, setSubjects]             = useState([]);
  const [resourceTypes, setResourceTypes]   = useState([]);
  const [sessionOptions, setSessionOptions] = useState([]);
  const [paperOptions, setPaperOptions]     = useState([]);

  // ── Loading states
  const [loadingInit, setLoadingInit]           = useState(true);
  const [loadingSubjects, setLoadingSubjects]   = useState(false);

  // ── Form state — pre-filled from API
  const [form, setForm] = useState({
    title: "", sub_id: "", level_id: "", resource_type_id: "",
    year: "", author: "", examinationBody: "ZIMSEC",
    session: "", paper_number: "",
  });

  // ── Toast helpers
  const showToast = (type, message) => {
    setToast({ type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  };
  const dismissToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Step 1: Load all dropdown options + current resource data in parallel
  useEffect(() => {
    const init = async () => {
      try {
        const [initRes, resourceRes] = await Promise.all([
          fetch(`${baseURL}/api/resources/form_init`,                         { credentials: "include" }),
          fetch(`${baseURL}/api/resources/edit_form_init/${resourceId}`,    { credentials: "include" }),
        ]);

        const initData     = await initRes.json();
        const resourceData = await resourceRes.json();

        if (!initRes.ok)     { showToast("error", "Failed to load form options.");    return; }
        if (!resourceRes.ok) { 
          if(resourceData.Conflict) {
            setConflict(resourceData.Conflict);
          }else{
            showToast("error",resourceRes.message || "Failed to load resource data.");
          }
          return; 
        }
        setConflict(null);
        // Populate dropdown options
        const lvls  = initData.levels.map(l       => ({ value: String(l.level_id),            label: l.level_name    }));
        const types = initData.resource_types.map(r => ({ value: String(r.resource_type_id),  label: r.resource_name }));
        setLevels(lvls);
        setResourceTypes(types);
        setSessionOptions(initData.session_options || []);
        setPaperOptions(initData.paper_options     || []);

        // Pre-fill form with current resource values
        setForm({
          title:            resourceData.title            || "",
          sub_id:           String(resourceData.subject?.sub_id || ""),
          level_id:         String(resourceData.levels?.[0]?.level_id || ""),
          resource_type_id: String(resourceData.resources_types?.[0]?.resource_type_id || ""),
          year:             resourceData.year           || "",
          author:           resourceData.author           || "",
          examinationBody:  "ZIMSEC",
          session:          resourceData.session          || "",
          paper_number:     resourceData.paper_number     || "",
        });

      } catch (err) {
        console.error("Edit init error:", err);
        showToast("error", "Could not load resource. Please try again.");
      } finally {
        setLoadingInit(false);
      }
    };
    init();
  }, [resourceId]);

  // ── Step 2: Load subjects when level changes
  useEffect(() => {
    if (!form.level_id) { setSubjects([]); return; }
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const res  = await fetch(`${baseURL}/api/subjects?level_id=${form.level_id}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) { console.error("subjects error:", data.message); return; }
        setSubjects(data.subjects.map(s => ({ value: String(s.sub_id), label: s.subject_name })));
      } catch (err) {
        console.error("Error loading subjects:", err);
        showToast("error", "Failed to load subjects.");
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [form.level_id]);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  // ── Detect if resource type is question paper / marking scheme
  const selectedTypeName = resourceTypes.find(r => r.value === form.resource_type_id)?.label?.toLowerCase() || "";
  const isPaper = ["question paper", "question papers", "marking scheme", "marking schemes"].includes(selectedTypeName);

  // ─────────────────────────────────────────────────────────────────────────────
// DROP-IN REPLACEMENT for handleSave and handleDeleteConflict in EditResource.jsx
// Replace lines 247–310 in your current file with everything below.
// ─────────────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (isSaving) return;
    dismissToast();
    setConflict(null); // clear any previous conflict before re-attempting

    // ── Validation
    if (!form.title)            { showToast("error", "Please enter a title.");            return; }
    if (!form.level_id)         { showToast("error", "Please select a level.");           return; }
    if (!form.sub_id)           { showToast("error", "Please select a subject.");         return; }
    if (!form.resource_type_id) { showToast("error", "Please select a resource type.");  return; }
    if (isPaper) {
      if (!form.year)         { showToast("error", "Please select the year.");          return; }
      if (!form.paper_number) { showToast("error", "Please select the paper number.");  return; }
      if (!form.session)      { showToast("error", "Please select the session.");       return; }
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${baseURL}/api/resources/${resourceId}`, {
        method:      "PUT",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:            form.title,
          sub_id:           form.sub_id,
          level_id:         form.level_id,
          resource_type_id: form.resource_type_id,
          author:           form.author       || "Unknown Author",
          year:             form.year         || null,
          session:          form.session      || null,
          paper_number:     form.paper_number || null,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        // ── Success path
        setIsSaving(false);
        showToast("success", `"${data.title || form.title}" updated successfully!`);
        try { if (onEditSuccess) await onEditSuccess(); } catch (_) {}
        setTimeout(() => onClose?.(), 1500);
        return;
      }

      // ── Failure path — always stop the spinner first
      setIsSaving(false);

      if (data.conflict) {
        // Backend found a duplicate — show the resolution panel instead of
        // a generic toast. The modal stays open so the admin can decide.
        setConflict(data.conflict);
      } else {
        // Any other backend error (validation, server error, etc.)
        showToast("error", data.message || "Save failed. Please try again.");
      }

    } catch (err) {
      // Network / connectivity error
      console.error("Edit save error:", err);
      setIsSaving(false);
      showToast("error", "Could not connect to server. Check your connection.");
    }
  };

  const handleDeleteConflict = async (conflictId) => {
    try {
        const res = await fetch(`${baseURL}/api/resources`, {
            method:      "DELETE",
            credentials: "include",
            headers:     { "Content-Type": "application/json" },
            body: JSON.stringify({ resource_ids: [conflictId] }), // single ID in array
        });

        if (!res.ok) {
            showToast("error", "Failed to delete the conflicting resource.");
            return;
        }

        setConflict(null);
        handleSave();

    } catch (err) {
        console.error("Delete conflict error:", err);
        showToast("error", "Could not connect to server.");
    }
};
  return (
    <>
      {toast && <Toast toast={toast} onDismiss={dismissToast} />}

      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(15,23,42,0.6)",
        padding: isMobile ? "8px" : "16px", fontFamily: FONT,
      }}>
        <div style={{
          width: "95%", maxWidth: isMobile ? "100%" : 820,
          background: "linear-gradient(135deg,#f0f6ff 0%,#f5f9ff 50%,#eff2ff 100%)",
          borderRadius: isMobile ? 16 : 22,
          boxShadow: isMobile
            ? "0 8px 32px rgba(30,58,95,0.18)"
            : "0 24px 60px rgba(30,58,95,0.22), 0 0 0 1px rgba(148,186,255,0.18)",
          overflow: "hidden",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.97)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          maxHeight: "96vh", display: "flex", flexDirection: "column",
        }}>
          {/* Top accent bar */}
          <div style={{ height: 3, flexShrink: 0, background: `linear-gradient(90deg,${BLUE},#2563eb,${BLUE})` }} />

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "14px 16px 12px" : "18px 24px 14px", borderBottom: "1px solid rgba(219,234,254,0.8)", flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 800, color: "#1e3a5f" }}>Edit Resource</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Update resource metadata — file content stays unchanged</div>
            </div>
            <button type="button" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", cursor: "pointer", flexShrink: 0 }}>
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 16, padding: isMobile ? "12px" : "16px 20px", overflowY: "auto", flex: 1 }}>

            {/* Info panel — replaces the upload zone */}
            <div style={{ width: isMobile ? "100%" : 200, flexShrink: 0, background: "#fff", borderRadius: 16, border: "1px solid #dbeafe", padding: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxSizing: "border-box", gap: 10 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#1a2e5a,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={24} color="#fff" />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "#1e3a5f", fontFamily: FONT }}>Metadata Edit</p>
                <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", lineHeight: 1.5, fontFamily: FONT }}>Only resource info is updated.<br />The file in Drive stays unchanged.</p>
              </div>
              <div style={{ width: "100%", borderTop: "1px solid #dbeafe", paddingTop: 10, marginTop: 4 }}>
                <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: FONT }}>Resource ID</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: BLUE, fontFamily: FONT }}>#{resourceId}</p>
              </div>
            </div>

            {/* Form */}
            <div style={{ flex: 1, minWidth: 0, background: "#fff", borderRadius: 16, border: "1px solid #dbeafe", padding: isMobile ? 14 : 16, boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, fontSize: 13, fontWeight: 700, color: "#1e3a5f", fontFamily: FONT }}>
                <BookOpen size={14} color="#3b82f6" /> Resource Information
              </div>

              {loadingInit ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0", color: "#94a3b8", gap: 8, fontFamily: FONT, fontSize: 13 }}>
                  <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Loading resource...
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <TextInput icon={FileText} placeholder="Title" value={form.title} onChange={set("title")} />

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                    <SelectInput icon={Layers}   placeholder="Level"    options={levels}        value={form.level_id}         onChange={(v) => { set("level_id")(v); set("sub_id")(""); }} />
                    <SelectInput icon={BookOpen} placeholder="Subject"  options={subjects}      value={form.sub_id}           onChange={set("sub_id")} disabled={!form.level_id || loadingSubjects} />
                    <SelectInput icon={Tag}      placeholder="Category" options={resourceTypes} value={form.resource_type_id} onChange={set("resource_type_id")} />
                    <TextInput   icon={Pencil}   placeholder="Author"   value={form.author}     onChange={set("author")} />
                  </div>

                  {isPaper && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                        <SelectInput icon={Calendar} placeholder="Year Written" options={YEARS}        value={form.year}         onChange={set("year")} />
                        <SelectInput icon={FileText} placeholder="Paper Number" options={paperOptions} value={form.paper_number} onChange={set("paper_number")} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                        <RadioGroup label="Examination Body" options={["ZIMSEC", "Cambridge (GCSE)"]} value={form.examinationBody} onChange={set("examinationBody")} />
                        <RadioGroup label="Season"           options={sessionOptions.length ? sessionOptions : ["June", "November"]} value={form.session} onChange={set("session")} />
                      </div>
                    </div>
                  )}

                  {!isPaper && (
                    <RadioGroup label="Examination Body" options={["ZIMSEC", "Cambridge (GCSE)"]} value={form.examinationBody} onChange={set("examinationBody")} />
                  )}
                </div>
              )}
            </div>
          </div>

         {/* Footer */}
<div style={{ padding: isMobile ? "12px 14px" : "12px 20px 18px", borderTop: "1px solid rgba(219,234,254,0.8)", flexShrink: 0 }}>
  
  {conflict ? (
    /* ── Conflict resolution panel — replaces normal footer content ── */
    <div style={{
      background: "#fff8ed", border: "1px solid #f59e0b",
      borderRadius: 10, padding: "12px 16px",
      display: "flex", flexDirection: "column", gap: 8
    }}>
      <p style={{ margin: 0, fontWeight: 700, color: "#92400e", fontSize: 13, fontFamily: FONT }}>
        ⚠️ <strong>{conflict.title}</strong> already exists
      </p>
      <p style={{ margin: 0, color: "#78350f", fontSize: 12, fontFamily: FONT }}>
        Status: {conflict.status}&nbsp;&nbsp;|&nbsp;&nbsp;
        Size: {conflict.file_size}&nbsp;&nbsp;|&nbsp;&nbsp;
        Uploaded: {conflict.uploaded_at ? new Date(conflict.uploaded_at).toLocaleDateString() : "Unknown"}
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => handleDeleteConflict(conflict.resource_id)}
          style={{
            background: "#dc2626", color: "#fff", border: "none",
            borderRadius: 8, padding: "8px 16px", fontSize: 12,
            fontWeight: 700, cursor: "pointer", fontFamily: FONT,
            display: "flex", alignItems: "center", gap: 6
          }}
        >
          🗑️ Delete conflicting resource
        </button>
        <button
          type="button"
          onClick={() => setConflict(null)}
          style={{
            background: "#f3f4f6", color: "#374151",
            border: "1px solid #d1d5db", borderRadius: 8,
            padding: "8px 16px", fontSize: 12,
            fontWeight: 700, cursor: "pointer", fontFamily: FONT
          }}
        >
          Keep both and cancel
        </button>
      </div>
    </div>

  ) : (
    /* ── Normal footer — cancel + save ── */
    <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button
                  type="button" onClick={onClose}
                  style={{
                    padding: "8px 18px", borderRadius: 10,
                    border: "1px solid #e2e8f0", background: "#fff",
                    color: "#64748b", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", fontFamily: FONT
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button" onClick={handleSave} disabled={isSaving}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "8px 20px", borderRadius: 10, border: "none",
                    background: isSaving ? "#374151" : BLUE,
                    color: "#fff", fontSize: 13, fontWeight: 700,
                    cursor: isSaving ? "not-allowed" : "pointer",
                    opacity: isSaving ? 0.75 : 1, fontFamily: FONT,
                  }}
                >
                  {isSaving
                    ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Saving...</>
                    : <><Save size={14} /> Save Changes</>}
                </button>
              </div>
             <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", margin: "8px 0 0", fontFamily: FONT }}>
              Structural changes will also move and rename the file in Google Drive.
            </p>
            </>
          )}
        </div>
        </div>
      </div>

      <style>{`
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}
