import { useState, useRef, useEffect, useCallback } from "react";
import {
  CloudUpload, FileText, ChevronDown, Pencil, X,
  BookOpen, Layers, Tag, Calendar, CheckCircle2, Loader2,
  AlertCircle, CheckCircle
} from "lucide-react";

const BLUE = "#1a2e5a";
const FONT = "'Segoe UI', sans-serif";
const YEARS = Array.from({ length: 27 }, (_, i) => String(2025 - i));
const baseURL = import.meta.env.VITE_BASEURL;

const inputBase = {
  width: "100%", boxSizing: "border-box",
  border: "1px solid #dbeafe", borderRadius: 10,
  background: "#fff", fontSize: 13, color: "#334155",
  fontFamily: FONT, outline: "none",
  paddingTop: 9, paddingBottom: 9,
};

// ── Toast Component
function Toast({ toast, onDismiss }) {
  const isSuccess = toast.type === "success";
  return (
    <div style={{
      position: "fixed", top: 20, left: "50%",
      transform: "translateX(-50%)",
      zIndex: 99999,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 18px",
      borderRadius: 12,
      background: isSuccess ? "#f0fdf4" : "#fef2f2",
      border: `1px solid ${isSuccess ? "#86efac" : "#fca5a5"}`,
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      maxWidth: 380,
      animation: "slideDown 0.25s ease",
      fontFamily: FONT,
    }}>
      {isSuccess
        ? <CheckCircle size={18} color="#16a34a" style={{ flexShrink: 0 }} />
        : <AlertCircle  size={18} color="#dc2626" style={{ flexShrink: 0 }} />
      }
      <span style={{
        fontSize: 13,
        color: isSuccess ? "#166534" : "#991b1b",
        fontWeight: 500,
        lineHeight: 1.4,
        flex: 1,
      }}>
        {toast.message}
      </span>
      <button
        onClick={onDismiss}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: isSuccess ? "#16a34a" : "#dc2626",
          padding: 2, display: "flex", alignItems: "center",
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

function SelectInput({ icon: Icon, placeholder, options, value, onChange, disabled }) {
  return (
    <div style={{ position: "relative", minWidth: 0 }}>
      <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color: disabled ? "#cbd5e1" : "#60a5fa", pointerEvents:"none", display:"flex" }}>
        <Icon size={14} />
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          ...inputBase, paddingLeft:32, paddingRight:28,
          appearance:"none", cursor: disabled ? "not-allowed" : "pointer",
          color: value ? "#334155" : "#94a3b8",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <option value="" disabled style={{ color:"#94a3b8" }}>{placeholder}</option>
        {options.map((o) => {
          const val   = typeof o === "object" ? o.value : o;
          const label = typeof o === "object" ? o.label : o;
          return <option key={val} value={val}>{label}</option>;
        })}
      </select>
      <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:"#60a5fa", pointerEvents:"none", display:"flex" }}>
        {disabled ? <Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }}/> : <ChevronDown size={14} />}
      </span>
    </div>
  );
}

function TextInput({ icon: Icon, placeholder, value, onChange }) {
  return (
    <div style={{ position:"relative" }}>
      <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#60a5fa", pointerEvents:"none", display:"flex" }}>
        <Icon size={14} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputBase, paddingLeft:32, paddingRight:12 }}
      />
    </div>
  );
}

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p style={{ margin:"0 0 8px", fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:FONT }}>
        {label}
      </p>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {options.map((opt) => {
          const val  = typeof opt === "object" ? opt.value : opt;
          const lbl  = typeof opt === "object" ? opt.label : opt;
          return (
            <label key={val} style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"7px 14px", borderRadius:10, cursor:"pointer",
              fontSize:13, fontFamily:FONT, userSelect:"none",
              border:`1px solid ${value === val ? BLUE : "#dbeafe"}`,
              background: value === val ? BLUE : "#fff",
              color: value === val ? "#fff" : "#64748b",
              fontWeight: value === val ? 600 : 400,
            }}>
              <input type="radio" name={label} value={val} checked={value === val} onChange={() => onChange(val)} style={{ display:"none" }} />
              {value === val && <CheckCircle2 size={13} />}
              {lbl}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function UploadResource({ onClose, onUploadSuccess }) {
  const fileInputRef              = useRef(null);
  const fileRef                   = useRef(null);
  const toastTimerRef             = useRef(null);
  const [fileName, setFileName]   = useState("");
  const [fileReady, setFileReady] = useState(false);
  const [dragging, setDragging]   = useState(false);
  const [isSaving, setIsSaving]   = useState(false);
  const [visible, setVisible]     = useState(false);
  const [toast, setToast]         = useState(null);   // { type: "success"|"error", message: "" }
  const [isMobile, setIsMobile]   = useState(
    typeof window !== "undefined" && window.innerWidth < 600
  );

  const [levels, setLevels]                 = useState([]);
  const [subjects, setSubjects]             = useState([]);
  const [resourceTypes, setResourceTypes]   = useState([]);
  const [sessionOptions, setSessionOptions] = useState([]);
  const [paperOptions, setPaperOptions]     = useState([]);
  const [loadingInit, setLoadingInit]       = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [form, setForm] = useState({
    fileName: "", sub_id: "", level_id: "", resource_type_id: "",
    year: "", author: "", examinationBody: "ZIMSEC",
    session: "June", paper_number: "",
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

  // Cleanup timer on unmount
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Load form options on mount
  useEffect(() => {
    const formInit = async () => {
      try {
        const res  = await fetch(`${baseURL}/api/resources/form_init`, { method: "GET", headers: { "Content-Type": "application/json" } });
        const data = await res.json();
        if (!res.ok) { console.error("form_init error:", data.message); return; }
        setLevels(data.levels.map(l => ({ value: String(l.level_id), label: l.level_name })));
        setResourceTypes(data.resource_types.map(r => ({ value: String(r.resource_type_id), label: r.resource_name })));
        setSessionOptions(data.session_options);
        setPaperOptions(data.paper_options);
        if (data.session_options?.length) setForm(f => ({ ...f, session: data.session_options[0] }));
      } catch (err) {
        console.error("Error loading form options:", err);
        showToast("error", "Failed to load form options. Please refresh and try again.");
      } finally {
        setLoadingInit(false);
      }
    };
    formInit();
  }, []);

  // ── Load subjects when level changes
  useEffect(() => {
    if (!form.level_id) { setSubjects([]); setForm(f => ({ ...f, sub_id: "" })); return; }
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const res  = await fetch(`${baseURL}/api/subjects?level_id=${form.level_id}`, { method: "GET", headers: { "Content-Type": "application/json" } });
        const data = await res.json();
        if (!res.ok) { console.error("subjects error:", data.message); return; }
        setSubjects(data.subjects.map(s => ({ value: String(s.sub_id), label: s.subject_name })));
        setForm(f => ({ ...f, sub_id: "" }));
      } catch (err) {
        console.error("Error loading subjects:", err);
        showToast("error", "Failed to load subjects. Please try again.");
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

  const handleFile = useCallback((file) => {
    if (!file) return;
    fileRef.current = file;
    const cleanName = file.name.replace(/\.[^.]+$/, "");
    setFileReady(true);
    setFileName(file.name);
    setForm((f) => ({ ...f, fileName: f.fileName || cleanName }));
  }, []);

  const handleInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleFile(file);
    try { e.target.value = ""; } catch (_) {}
  };

  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragging(false); };
  const handleDrop      = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer && e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const openFilePicker = () => fileInputRef.current?.click();

  // Check if resource type requires paper fields
  const selectedTypeName = resourceTypes.find(r => r.value === form.resource_type_id)?.label?.toLowerCase() || "";
  const isPaper = ["question paper","question papers","marking scheme","marking schemes"].includes(selectedTypeName);

  const handleSave = async () => {
    if (isSaving) return;
    dismissToast();

    // ── Frontend validation
    if (!fileRef.current) {
      showToast("error", "Please select a file before saving.");
      return;
    }
    if (!form.fileName) {
      showToast("error", "Please enter a file name.");
      return;
    }
    if (!form.level_id) {
      showToast("error", "Please select a level.");
      return;
    }
    if (!form.sub_id) {
      showToast("error", "Please select a subject.");
      return;
    }
    if (!form.resource_type_id) {
      showToast("error", "Please select a resource category.");
      return;
    }
    if (isPaper) {
      if (!form.year)         { showToast("error", "Please select the year.");         return; }
      if (!form.paper_number) { showToast("error", "Please select the paper number."); return; }
      if (!form.session)      { showToast("error", "Please select the session.");      return; }
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("file",             fileRef.current);
      formData.append("title",            form.fileName);
      formData.append("sub_id",           form.sub_id);
      formData.append("level_id",         form.level_id);
      formData.append("resource_type_id", form.resource_type_id);
      formData.append("year",             form.year        || "");
      formData.append("author",           form.author      || "");
      formData.append("session",          form.session     || "");
      formData.append("paper_number",     form.paper_number|| "");
      formData.append("file_size",        fileRef.current?.size  ?? "");
      formData.append("file_type",        fileRef.current?.type  || "application/pdf");

      const res  = await fetch(`${baseURL}/api/resources`, {
        method: "POST", credentials: "include", body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        showToast("success", `"${form.fileName}" uploaded successfully!`);
        setIsSaving(false);
        if (onUploadSuccess) await onUploadSuccess();
        // Delay close slightly so user sees the success toast
        setTimeout(() => onClose?.(), 1500);
      } else {
        // Show specific backend error message
        const msg = data.message || data.missing || "Upload failed. Please try again.";
        showToast("error", msg);
        setIsSaving(false);
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast("error", "Could not connect to the server. Please check your connection.");
      setIsSaving(false);
    }
  };

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const dropBorder = dragging ? "#3b82f6" : fileReady ? "#34d399" : "#bfdbfe";
  const dropBg     = dragging ? "#eff6ff"  : fileReady ? "#f0fdf4"  : "#fff";

  return (
    <>
      {/* ── Toast notification */}
      {toast && <Toast toast={toast} onDismiss={dismissToast} />}

      <div style={{
        position:"fixed", inset:0, zIndex:9999,
        display:"flex", alignItems:"center", justifyContent:"center",
        background:"rgba(15,23,42,0.6)",
        padding: isMobile ? "8px" : "16px", fontFamily:FONT,
      }}>
        <input
          ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.pdf"
          style={{ position:"absolute", width:1, height:1, opacity:0, pointerEvents:"none" }}
          onChange={handleInputChange}
        />

        <div style={{
          width:"95%", maxWidth: isMobile ? "100%" : 820,
          background:"linear-gradient(135deg,#f0f6ff 0%,#f5f9ff 50%,#eff2ff 100%)",
          borderRadius: isMobile ? 16 : 22,
          boxShadow: isMobile
            ? "0 8px 32px rgba(30,58,95,0.18)"
            : "0 24px 60px rgba(30,58,95,0.22), 0 0 0 1px rgba(148,186,255,0.18)",
          overflow:"hidden",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.97)",
          transition:"opacity 0.2s ease, transform 0.2s ease",
          maxHeight:"96vh", display:"flex", flexDirection:"column",
        }}>
          <div style={{ height:3, flexShrink:0, background:`linear-gradient(90deg,${BLUE},#2563eb,${BLUE})` }} />

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding: isMobile ? "14px 16px 12px" : "18px 24px 14px", borderBottom:"1px solid rgba(219,234,254,0.8)", flexShrink:0 }}>
            <div>
              <div style={{ fontSize: isMobile ? 14 : 16, fontWeight:800, color:"#1e3a5f" }}>Upload Resource</div>
              <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>Add a new learning resource to the system</div>
            </div>
            <button type="button" onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", color:"#94a3b8", cursor:"pointer", flexShrink:0 }}>
              <X size={15} />
            </button>
          </div>

          <div style={{
            display:"flex", flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 12 : 16, padding: isMobile ? "12px" : "16px 20px",
            overflowY:"auto", flex:1,
          }}>
            {/* Upload zone */}
            <div style={{ width: isMobile ? "100%" : 200, flexShrink:0, background:"#fff", borderRadius:16, border:"1px solid #dbeafe", padding:14, display:"flex", flexDirection:"column", alignItems:"center", boxSizing:"border-box" }}>
              <div
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={openFilePicker}
                style={{ width:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, border:`2px dashed ${dropBorder}`, borderRadius:12, padding: isMobile ? "20px 12px" : "24px 12px", cursor:"pointer", background:dropBg, minHeight: isMobile ? 110 : 155, transition:"border-color 0.2s, background 0.2s", boxSizing:"border-box" }}
              >
                {fileReady ? (
                  <><CheckCircle2 size={isMobile ? 26 : 30} color="#10b981" /><p style={{ margin:0, fontSize:11, color:"#059669", fontWeight:600, textAlign:"center", wordBreak:"break-all", fontFamily:FONT }}>{fileName}</p></>
                ) : (
                  <><div style={{ width:44, height:44, borderRadius:12, background:BLUE, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}><CloudUpload size={20} /></div><p style={{ margin:0, fontSize:12, color:"#94a3b8", textAlign:"center", lineHeight:1.5, fontFamily:FONT }}>Drop file here<br />or tap to browse</p></>
                )}
              </div>
              <button type="button" onClick={openFilePicker} style={{ marginTop:12, width:"100%", background:BLUE, color:"#fff", border:"none", borderRadius:10, padding:"9px 0", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:FONT }}>
                {fileReady ? "Change File" : "Upload File"}
              </button>
              <p style={{ margin:"8px 0 0", fontSize:11, color:"#94a3b8", textAlign:"center", lineHeight:1.5, fontFamily:FONT }}>Supported formats<br /><span style={{ fontWeight:600, color:"#64748b" }}>PNG · JPG · PDF</span></p>
            </div>

            {/* Form */}
            <div style={{ flex:1, minWidth:0, background:"#fff", borderRadius:16, border:"1px solid #dbeafe", padding: isMobile ? 14 : 16, boxSizing:"border-box" }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12, fontSize:13, fontWeight:700, color:"#1e3a5f", fontFamily:FONT }}>
                <BookOpen size={14} color="#3b82f6" /> Resource Information
              </div>

              {loadingInit ? (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 0", color:"#94a3b8", gap:8, fontFamily:FONT, fontSize:13 }}>
                  <Loader2 size={16} style={{ animation:"spin 0.8s linear infinite" }} /> Loading options...
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <TextInput icon={FileText} placeholder="File name" value={form.fileName} onChange={set("fileName")} />

                  <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:10 }}>
                    <SelectInput icon={Layers}   placeholder="Level"    options={levels}        value={form.level_id}         onChange={set("level_id")} />
                    <SelectInput icon={BookOpen} placeholder="Subject"  options={subjects}      value={form.sub_id}           onChange={set("sub_id")} disabled={!form.level_id || loadingSubjects} />
                    <SelectInput icon={Tag}      placeholder="Category" options={resourceTypes} value={form.resource_type_id} onChange={set("resource_type_id")} />
                    <TextInput   icon={Pencil}   placeholder="Author"   value={form.author}     onChange={set("author")} />
                  </div>

                  {isPaper && (
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:10 }}>
                        <SelectInput icon={Calendar} placeholder="Year Written" options={YEARS}        value={form.year}         onChange={set("year")} />
                        <SelectInput icon={FileText} placeholder="Paper Number" options={paperOptions} value={form.paper_number} onChange={set("paper_number")} />
                      </div>
                      <RadioGroup label="Season" options={sessionOptions.length ? sessionOptions : ["June","November"]} value={form.session} onChange={set("session")} />
                    </div>
                  )}

                  <RadioGroup label="Examination Body" options={["ZIMSEC","Cambridge (GCSE)"]} value={form.examinationBody} onChange={set("examinationBody")} />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: isMobile ? "12px 14px" : "12px 20px 18px", borderTop:"1px solid rgba(219,234,254,0.8)", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <button type="button" onClick={onClose} style={{ padding:"8px 18px", borderRadius:10, border:"1px solid #e2e8f0", background:"#fff", color:"#64748b", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:FONT }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  display:"flex", alignItems:"center", gap:7,
                  padding:"8px 20px", borderRadius:10, border:"none",
                  background: isSaving ? "#374151" : BLUE,
                  color:"#fff", fontSize:13, fontWeight:700,
                  cursor: isSaving ? "not-allowed" : "pointer",
                  opacity: isSaving ? 0.75 : 1, fontFamily:FONT,
                }}
              >
                {isSaving
                  ? <><Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }} /> Uploading...</>
                  : "Save Resource"
                }
              </button>
            </div>
            <p style={{ textAlign:"center", fontSize:11, color:"#94a3b8", margin:"8px 0 0", fontFamily:FONT }}>
              All fields are required before saving.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}