import { useState, useRef, useEffect, useCallback } from "react";
import {
  CloudUpload, FileText, ChevronDown, Pencil, X,
  BookOpen, Layers, Tag, Calendar, CheckCircle2, Loader2
} from "lucide-react";

const BLUE = "#1a2e5a";
const FONT = "'Segoe UI', sans-serif";

const SUBJECTS   = ["Mathematics","English Language","Science","History","Geography","Biology","Chemistry","Physics","Commerce","Accounting"];
const LEVELS     = ["Grade 7","O Level","A Level"];
const CATEGORIES = ["Past Paper","Study Notes","Textbook","Revision Guide","Mock Exam","Worksheet"];
const YEARS      = Array.from({ length: 15 }, (_, i) => String(2024 - i));

const inputBase = {
  width: "100%", boxSizing: "border-box",
  border: "1px solid #dbeafe", borderRadius: 10,
  background: "#fff", fontSize: 13, color: "#334155",
  fontFamily: FONT, outline: "none",
  paddingTop: 9, paddingBottom: 9,
};

function SelectInput({ icon: Icon, placeholder, options, value, onChange }) {
  return (
    <div style={{ position: "relative", minWidth: 0 }}>
      <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#60a5fa", pointerEvents:"none", display:"flex" }}>
        <Icon size={14} />
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputBase, paddingLeft:32, paddingRight:28, appearance:"none", cursor:"pointer", color: value ? "#334155" : "#94a3b8" }}
      >
        <option value="" disabled style={{ color:"#94a3b8" }}>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:"#60a5fa", pointerEvents:"none", display:"flex" }}>
        <ChevronDown size={14} />
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
        {options.map((opt) => (
          <label key={opt} style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"7px 14px", borderRadius:10, cursor:"pointer",
            fontSize:13, fontFamily:FONT, userSelect:"none",
            border:`1px solid ${value === opt ? BLUE : "#dbeafe"}`,
            background: value === opt ? BLUE : "#fff",
            color: value === opt ? "#fff" : "#64748b",
            fontWeight: value === opt ? 600 : 400,
          }}>
            <input type="radio" name={label} value={opt} checked={value === opt} onChange={() => onChange(opt)} style={{ display:"none" }} />
            {value === opt && <CheckCircle2 size={13} />}
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function UploadResource({ onClose }) {
  const fileInputRef            = useRef(null);
  // Store only lightweight metadata — NOT the File object in state
  const fileRef                 = useRef(null);
  const [fileName, setFileName] = useState("");
  const [fileReady, setFileReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [visible, setVisible]   = useState(false);
  // const [SUBJECTS,setSUBJECTS]=useState([]);
  // const [LEVELS,setLEVELS]=useState([]);
  // const [CATEGORIES,setCATEGORIES]=useState([]);
  // const [RESOURCETYPE,setRESOURCETYPE]=useState([]);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 600
  );

  const [form, setForm] = useState({
    fileName: "", subject: "", level: "", category: "",
    year: "", author: "", examinationBody: "ZIMSEC", season: "June",
  });

  const formInit=async()=>{
    try{
        const res= await fetch(`${baseURL}/api/form_init`,{
            methods:"GET",
            headers:{"Content-Type":"application/json"}
        });
        data=await res.json();
        if(!res.ok){
            console.error("Error occurred while fetching form init: ",data.message);
            return;
        }
        console.log(data);
        setLEVELS(data.levels);
        setCATEGORIES(data.resource_types);
        set
        console.table(data);
    }catch(error){
        console.error("Error while connecting to the database:",error);
    }
}

  useEffect(()=>{
    formInit();
  },[])



  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Extract only the name — store the File in a ref, not state
  // This prevents React from re-rendering with a heavy object in memory
  const handleFile = useCallback((file) => {
    if (!file) return;
    fileRef.current = file; // keep reference outside React state
    const cleanName = file.name.replace(/\.[^.]+$/, "");
    setFileReady(true);
    setFileName(file.name);
    setForm((f) => ({ ...f, fileName: f.fileName || cleanName }));
  }, []);

  const handleInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleFile(file);
    // Reset so the same file can be picked again
    try { e.target.value = ""; } catch (_) {}
  };

  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragging(false); };
  const handleDrop      = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer && e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const openFilePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // Use fileRef.current for the actual File object when uploading
      // e.g: const formData = new FormData();
      //      formData.append("file", fileRef.current);
      //      formData.append("meta", JSON.stringify(form));
      //      await fetch("/api/resources", { method:"POST", body: formData });
      await new Promise((r) => setTimeout(r, 1200)); // remove this line in production
      console.log("Saved:", { file: fileRef.current, ...form });
      onClose?.();
    } catch (err) {
      console.error("Save failed:", err);
      setIsSaving(false);
    }
  };

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const dropBorder = dragging ? "#3b82f6" : fileReady ? "#34d399" : "#bfdbfe";
  const dropBg     = dragging ? "#eff6ff"  : fileReady ? "#f0fdf4"  : "#fff";

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(15,23,42,0.6)",
      padding: isMobile ? "8px" : "16px",
      fontFamily:FONT,
    }}>

      {/* File input — lives outside the modal entirely */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.pdf"
        style={{ position:"absolute", width:1, height:1, opacity:0, pointerEvents:"none" }}
        onChange={handleInputChange}
      />

      {/* Modal */}
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
        maxHeight:"96vh",
        display:"flex", flexDirection:"column",
      }}>

        {/* Accent bar */}
        <div style={{ height:3, flexShrink:0, background:`linear-gradient(90deg,${BLUE},#2563eb,${BLUE})` }} />

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding: isMobile ? "14px 16px 12px" : "18px 24px 14px", borderBottom:"1px solid rgba(219,234,254,0.8)", flexShrink:0 }}>
          <div>
            <div style={{ fontSize: isMobile ? 14 : 16, fontWeight:800, color:"#1e3a5f" }}>Upload Resource</div>
            <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>Add a new learning resource to the system</div>
          </div>
          <button type="button" onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", color:"#94a3b8", cursor:"pointer", flexShrink:0 }}>
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          display:"flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 12 : 16,
          padding: isMobile ? "12px" : "16px 20px",
          overflowY:"auto", flex:1,
        }}>

          {/* Upload zone */}
          <div style={{ width: isMobile ? "100%" : 200, flexShrink:0, background:"#fff", borderRadius:16, border:"1px solid #dbeafe", padding:14, display:"flex", flexDirection:"column", alignItems:"center", boxSizing:"border-box" }}>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFilePicker}
              style={{
                width:"100%", display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:10,
                border:`2px dashed ${dropBorder}`, borderRadius:12,
                padding: isMobile ? "20px 12px" : "24px 12px",
                cursor:"pointer", background:dropBg,
                minHeight: isMobile ? 110 : 155,
                transition:"border-color 0.2s, background 0.2s",
                boxSizing:"border-box",
              }}
            >
              {fileReady ? (
                <>
                  <CheckCircle2 size={isMobile ? 26 : 30} color="#10b981" />
                  <p style={{ margin:0, fontSize:11, color:"#059669", fontWeight:600, textAlign:"center", wordBreak:"break-all", fontFamily:FONT }}>
                    {fileName}
                  </p>
                </>
              ) : (
                <>
                  <div style={{ width:44, height:44, borderRadius:12, background:BLUE, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                    <CloudUpload size={20} />
                  </div>
                  <p style={{ margin:0, fontSize:12, color:"#94a3b8", textAlign:"center", lineHeight:1.5, fontFamily:FONT }}>
                    Drop file here<br />or tap to browse
                  </p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={openFilePicker}
              style={{ marginTop:12, width:"100%", background:BLUE, color:"#fff", border:"none", borderRadius:10, padding:"9px 0", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:FONT }}
            >
              {fileReady ? "Change File" : "Upload File"}
            </button>

            <p style={{ margin:"8px 0 0", fontSize:11, color:"#94a3b8", textAlign:"center", lineHeight:1.5, fontFamily:FONT }}>
              Supported formats<br />
              <span style={{ fontWeight:600, color:"#64748b" }}>PNG · JPG · PDF</span>
            </p>
          </div>

          {/* Form */}
          <div style={{ flex:1, minWidth:0, background:"#fff", borderRadius:16, border:"1px solid #dbeafe", padding: isMobile ? 14 : 16, boxSizing:"border-box" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12, fontSize:13, fontWeight:700, color:"#1e3a5f", fontFamily:FONT }}>
              <BookOpen size={14} color="#3b82f6" /> Resource Information
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <TextInput icon={FileText}  placeholder="File name"    value={form.fileName} onChange={set("fileName")} />

              <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:10 }}>
                <SelectInput icon={Layers}    placeholder="Level"        options={LEVELS}     value={form.level}     onChange={set("level")} />
                <SelectInput icon={BookOpen}  placeholder="Subject"      options={SUBJECTS}   value={form.subject}   onChange={set("subject")} />
                <SelectInput icon={Tag}       placeholder="Category"     options={CATEGORIES} value={form.category}  onChange={set("category")} />
                <SelectInput icon={Calendar}  placeholder="Year Written" options={YEARS}      value={form.year}      onChange={set("year")} />
              </div>

              <TextInput icon={Pencil} placeholder="Author" value={form.author} onChange={set("author")} />

              <RadioGroup label="Examination Body" options={["ZIMSEC","Cambridge (GCSE)"]} value={form.examinationBody} onChange={set("examinationBody")} />
              <RadioGroup label="Season"           options={["June","November"]}            value={form.season}         onChange={set("season")} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: isMobile ? "12px 14px" : "12px 20px 18px", borderTop:"1px solid rgba(219,234,254,0.8)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding:"8px 18px", borderRadius:10, border:"1px solid #e2e8f0", background:"#fff", color:"#64748b", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:FONT }}
            >
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
                opacity: isSaving ? 0.75 : 1,
                fontFamily:FONT,
              }}
            >
              {isSaving
                ? <><Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }} /> Saving...</>
                : "Save Resource"
              }
            </button>
          </div>
          <p style={{ textAlign:"center", fontSize:11, color:"#94a3b8", margin:"8px 0 0", fontFamily:FONT }}>
            All fields are required before saving.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}