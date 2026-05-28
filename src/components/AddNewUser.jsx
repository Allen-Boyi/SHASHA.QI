import { useState, useEffect } from "react";
import {
  X, User, Mail, Phone, Lock, ShieldCheck,
  Eye, EyeOff, UserPlus, ChevronDown, CheckCircle2, AlertCircle
} from "lucide-react";
const baseurl=import.meta.env.VITE_BASEURL;


const BLUE       = "#1a2e5a";
const BLUE_LIGHT = "#2563eb";
const FONT       = "'Segoe UI', sans-serif";

const ROLE_COLORS = {
  "Super Admin": { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  "Admin":       { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
  "Manager":     { bg: "#fce7f3", text: "#9d174d", border: "#f9a8d4" },
  "Developer":   { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  "Auditor":     { bg: "#ede9fe", text: "#5b21b6", border: "#c4b5fd" },
  "Support Agent":{bg:"#cfd7ee",text:"rgb(24, 7, 212)",border:"rgba(41, 47, 169, 0.33)"}
};

const inputStyle = {
  width: "100%", border: "none", outline: "none", background: "transparent",
  paddingLeft: 32, paddingRight: 10, paddingTop: 9, paddingBottom: 9,
  fontSize: 13, color: "#334155", fontFamily: FONT, boxSizing: "border-box",
};

function Field({ label, icon: Icon, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT }}>
        {label}
      </label>
      <div style={{
        position: "relative", borderRadius: 10,
        border: `1px solid ${error ? "#fca5a5" : "#e2e8f0"}`,
        background: error ? "#fff5f5" : "#fff",
        display: "flex", alignItems: "center",
      }}>
        <span style={{ position: "absolute", left: 10, color: "#94a3b8", display: "flex", alignItems: "center", pointerEvents: "none" }}>
          <Icon size={14} />
        </span>
        {children}
      </div>
      {error && (
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#ef4444", fontFamily: FONT }}>
          <AlertCircle size={11} /> {error}
        </span>
      )}
    </div>
  );
}

export default function AddNewUser({ onClose, onSuccess }) {
  const [form, setForm] = useState({ username: "", email: "", phone: "", selectedRoleId: "", password: "", confirm: "" });
  const [errors, setErrors]     = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showCfm, setShowCfm]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [message, setMessage]   = useState("");
  const [visible, setVisible]   = useState(false);
  const [roles,setRoles]=useState([]);


  const fetchRoles=async()=>{
      try{
        const res = await fetch(`${baseurl}/Signup_form-init`,
                                {method:"GET",
                                  headers:{"Content-Type":"application/json"}
                                });
        if(res.ok){
          const data=await res.json();
          setRoles(data.roles);
        }
      }catch(error){
        console.error("Error connecting to the server",error)
      }
  }

  useEffect(()=>{
    fetchRoles();
  },[]);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim())         e.username = "Username is required";
    else if (form.username.length < 3) e.username = "At least 3 characters";
    if (!form.email.trim())            e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address";
    if (!form.phone.trim())            e.phone = "Phone is required";
    if (!form.selectedRoleId)          e.selectedRoleId = "Please select a role";
    if (!form.password)                e.password = "Password is required";
    else if (form.password.length < 6) e.password = "At least 6 characters";
    if (!form.confirm)                 e.confirm = "Please confirm password";
    else if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    return e;
  };
  const handleSignup=async (formData)=>{
      if(formData.password !== formData.confirm){
        setMessage("Passwords do not match");
        setTimeout(()=>setMessage(""),3000);
        return;
      }
      if (!formData.password){
        setMessage("Password is missing");
        setTimeout(()=>setMessage(""),3000);
        return;
      }
        const res=await fetch(`${baseurl}/Signup`,{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({username:formData.username,
                              email:formData.email,
                              phone:formData.phone,
                              password:formData.password,
                              role_id:formData.selectedRoleId
        })
        });
      return {
        ok:res.ok,
        data: await res.json()
      };
  };
  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const {ok,data} =await handleSignup(form);
        if (!ok){
          setMessage(data.missing?"Missing fields ":"Error "+data.message);
          setTimeout(()=>setMessage(""),3000);
          return;
        }
      console.log("User added successfully",data.message);
      setSuccess(true);
      setMessage(`User @${form.username} created successfully.`);
      setTimeout(() => { onSuccess?.({ ...form }); onClose?.(); }, 2000);
    } catch (err) {
      setMessage(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find((r) => String(r.role_id) === String(form.selectedRoleId));
  const roleColor    = selectedRole ? ROLE_COLORS[selectedRole.role_name] : null;
  const passMatch    = form.confirm && form.password && form.confirm === form.password;
  const passMismatch = form.confirm && form.password && form.confirm !== form.password;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(15,23,42,0.55)", backdropFilter: "blur(3px)",
      padding: 16, fontFamily: FONT,
    }}>
      <div style={{
        width: "100%", maxWidth: 520,
        background: "linear-gradient(160deg,#f8faff 0%,#eef4ff 100%)",
        borderRadius: 20,
        boxShadow: "0 24px 60px rgba(30,58,95,0.25), 0 0 0 1px rgba(148,186,255,0.2)",
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.97)",
        transition: "opacity 0.22s ease, transform 0.22s ease",
      }}>

        {/* Accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg,${BLUE},${BLUE_LIGHT},${BLUE})` }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 12px rgba(30,58,95,0.3)" }}>
              <UserPlus size={17} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.3px" }}>Add New User</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Bot Dashboard Users · IQhub.AI</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", cursor: "pointer" }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ margin: "0 22px", height: 1, background: "rgba(219,234,254,0.8)" }} />

        {/* Form body */}
        <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 12 }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Username" icon={User} error={errors.username}>
              <input type="text" value={form.username} onChange={set("username")} placeholder="@username" style={inputStyle} />
            </Field>
            <Field label="Email" icon={Mail} error={errors.email}>
              <input type="email" value={form.email} onChange={set("email")} placeholder="user@domain.com" style={inputStyle} />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Phone" icon={Phone} error={errors.phone}>
              <input type="text" value={form.phone} onChange={set("phone")} placeholder="+1 234 567 8900" style={inputStyle} />
            </Field>
            <Field label="Role" icon={ShieldCheck} error={errors.selectedRoleId}>
              <select
                value={form.selectedRoleId}
                onChange={set("selectedRoleId")}
                style={{ ...inputStyle, paddingRight: 28, appearance: "none", cursor: "pointer", color: roleColor ? roleColor.text : "#94a3b8", fontWeight: roleColor ? 600 : 400 }}
              >
                <option value="" disabled style={{ color: "#94a3b8", fontWeight: 400 }}>Select Role</option>
                {roles.map((r) => (
                  <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                ))}
              </select>
              <span style={{ position: "absolute", right: 8, color: "#94a3b8", display: "flex", pointerEvents: "none" }}>
                <ChevronDown size={13} />
              </span>
            </Field>
          </div>

          {selectedRole && roleColor && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>Role preview:</span>
              <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: roleColor.bg, color: roleColor.text, border: `1px solid ${roleColor.border}` }}>
                {selectedRole.role_name}
              </span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Password" icon={Lock} error={errors.password}>
              <input type={showPass ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Min 6 characters" style={{ ...inputStyle, paddingRight: 32 }} />
              <button type="button" onClick={() => setShowPass((v) => !v)} style={{ position: "absolute", right: 8, background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", padding: 0 }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </Field>
            <Field label="Confirm Password" icon={Lock} error={errors.confirm}>
              <input type={showCfm ? "text" : "password"} value={form.confirm} onChange={set("confirm")} placeholder="Repeat password" style={{ ...inputStyle, paddingRight: 32 }} />
              <button type="button" onClick={() => setShowCfm((v) => !v)} style={{ position: "absolute", right: 8, background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", padding: 0 }}>
                {showCfm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </Field>
          </div>

          {(passMatch || passMismatch) && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: passMatch ? "#059669" : "#ef4444" }}>
              {passMatch ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              {passMatch ? "Passwords match" : "Passwords do not match"}
            </div>
          )}

          {message && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, background: success ? "#f0fdf4" : "#fff5f5", color: success ? "#065f46" : "#dc2626", border: `1px solid ${success ? "#bbf7d0" : "#fecaca"}` }}>
              {success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 22px 18px", borderTop: "1px solid rgba(219,234,254,0.8)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 20px", borderRadius: 10, border: "none", background: success ? "#059669" : BLUE, color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading || success ? "default" : "pointer", opacity: loading || success ? 0.8 : 1, boxShadow: "0 2px 10px rgba(30,58,95,0.28)", fontFamily: FONT }}
          >
            {loading ? "Creating..." : success ? "✓ Created!" : <><UserPlus size={14} style={{ marginRight: 4 }} /> Create User</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
