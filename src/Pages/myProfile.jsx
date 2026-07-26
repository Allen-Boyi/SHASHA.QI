import { useState, useRef } from "react";
const  baseURL=import.meta.env.VITE_BASEURL ||"http:127.0.0.1:5000"

const C = {
  bg: "#F0F2F8",
  card: "#FFFFFF",
  sidebar: "#111827",
  border: "#E2E6F0",
  borderFocus: "#4B6EF5",
  blue: "#4B6EF5",
  blueDark: "#3A56D4",
  blueLight: "#EEF1FF",
  orange: "#E85D04",
  textPrimary: "#1E2A3B",
  textSecondary: "#6B7A99",
  textMuted: "#9AA3B8",
  inputBg: "#F8F9FC",
  readonlyBg: "#F0F2F8",
  green: "#22C55E",
  red: "#EF4444",
  amber: "#F59E0B",
  danger: "#FEE2E2",
  dangerText: "#DC2626",
};

const s = {
  root: {
    fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
    background: C.bg,
    minHeight: "100%",
    padding: "20px 24px",
    boxSizing: "border-box",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px 20px",
  },
  gridMobile: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 14,
  },
  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "18px 20px",
    marginBottom: 16,
  },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: `1px solid ${C.border}`,
  },
  sectionBar: {
    width: 3,
    height: 16,
    background: C.orange,
    borderRadius: 2,
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: C.textPrimary,
    margin: 0,
    letterSpacing: "0.01em",
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: C.textSecondary,
    marginBottom: 5,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  inputWrap: { position: "relative" },
  input: (focused, readonly) => ({
    width: "100%",
    boxSizing: "border-box",
    height: 36,
    padding: "0 10px",
    border: `1px solid ${focused ? C.borderFocus : C.border}`,
    borderRadius: 7,
    fontSize: 13,
    color: C.textPrimary,
    background: readonly ? C.readonlyBg : C.inputBg,
    outline: "none",
    cursor: readonly ? "not-allowed" : "text",
    boxShadow: focused ? `0 0 0 3px ${C.blueLight}` : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  }),
  inputWithIcon: (focused, readonly) => ({
    ...s.input(focused, readonly),
    paddingLeft: 30,
  }),
  inputWithEye: (focused) => ({
    ...s.input(focused, false),
    paddingRight: 36,
  }),
  iconLeft: {
    position: "absolute",
    left: 9,
    top: "50%",
    transform: "translateY(-50%)",
    color: C.textMuted,
    display: "flex",
    pointerEvents: "none",
  },
  iconRight: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: C.textMuted,
    display: "flex",
    padding: 2,
  },
  phoneRow: { display: "flex", gap: 0 },
  phonePrefix: {
    height: 36,
    padding: "0 10px",
    border: `1px solid ${C.border}`,
    borderRight: "none",
    borderRadius: "7px 0 0 7px",
    fontSize: 12,
    background: C.readonlyBg,
    color: C.textSecondary,
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    fontFamily: "monospace",
    flexShrink: 0,
  },
  avatarArea: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottom: `1px solid ${C.border}`,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: C.blueLight,
    border: `2px solid ${C.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 700,
    color: C.blue,
    cursor: "pointer",
    overflow: "hidden",
    flexShrink: 0,
    position: "relative",
  },
  avatarMeta: { flex: 1 },
  avatarName: { fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: "0 0 2px" },
  avatarRole: { fontSize: 12, color: C.textSecondary, margin: 0 },
  liveBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    color: C.green,
    background: "#F0FDF4",
    border: "1px solid #BBF7D0",
    borderRadius: 20,
    padding: "1px 8px",
    marginLeft: 6,
  },
  liveDot: { width: 5, height: 5, borderRadius: "50%", background: C.green },
  btnRow: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingTop: 14,
    borderTop: `1px solid ${C.border}`,
  },
  btnPrimary: (hovered) => ({
    height: 34,
    padding: "0 16px",
    background: hovered ? C.blueDark : C.blue,
    color: "#fff",
    border: "none",
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "background 0.15s, transform 0.1s",
    transform: hovered ? "scale(0.98)" : "scale(1)",
  }),
  btnGhost: (hovered) => ({
    height: 34,
    padding: "0 14px",
    background: hovered ? C.readonlyBg : "transparent",
    color: C.textSecondary,
    border: `1px solid ${C.border}`,
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.15s",
  }),
  strengthBar: { display: "flex", gap: 3, marginTop: 6 },
  seg: (active, color) => ({
    flex: 1,
    height: 3,
    borderRadius: 2,
    background: active ? color : C.border,
    transition: "background 0.3s",
  }),
  strengthLabel: (color) => ({
    fontSize: 11,
    fontWeight: 600,
    color,
    marginTop: 4,
  }),
  matchMsg: (ok) => ({
    fontSize: 11,
    fontWeight: 500,
    color: ok ? C.green : C.red,
    marginTop: 4,
  }),
  verifiedIcon: { position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)" },
};

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const SaveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
);

const KeyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function scorePassword(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function PwField({ label, id, value, onChange }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div style={s.label}>{label}</div>
      <div style={s.inputWrap}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={s.inputWithEye(focused)}
        />
        <button style={s.iconRight} onClick={() => setShow(v => !v)} type="button">
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );
}

export default function MyProfile({ user, isMobile }) {
  const username = user?.username || user?.name || "";
  const email = user?.email || "";
  const role = user?.role_name || "Admin";
  const user_id = user?.user_id;
  const initials = username.slice(0, 2).toUpperCase();



  const [uname, setUname] = useState(username);
  const [phone, setPhone] = useState(user?.phone || "");
  const [emailVal, setEmailVal] = useState(email);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [savedInfo, setSavedInfo] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);

  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savedPw, setSavedPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [btnHover, setBtnHover] = useState({});
  const fileRef = useRef();

  const pwScore = scorePassword(newPw);
  const strengthColor = pwScore <= 2 ? C.red : pwScore <= 3 ? C.amber : C.green;
  const strengthLabels = ["", "Weak", "Weak", "Fair", "Strong", "Very strong"];
  const pwMatch = newPw && confirmPw && newPw === confirmPw;
  const pwMismatch = confirmPw && newPw !== confirmPw;

  const grid = isMobile ? s.gridMobile : s.grid;
const updateUserInfo=async()=>{
    try{
        const response = await fetch(`${baseURL}/api/users/me`, {
            method: "PUT",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "user_id": user_id, "username": uname, "phone": phone, "email": emailVal })
        });
            if(!response.ok){
                console.warn(`HTTP error! status: ${response.status}`);
                const errorData = await response.json();
                if(errorData.missing){
                    console.error("Missing fields:", errorData.missing);
                }else{
                    console.error("Error response:", errorData.message || "Unknown error");
                }
                return;
            }
            const data = await response.json();
            const currentLocalUser=JSON.parse(localStorage.getItem("user")||"{}");
            const updateFields=data.user&&data.user[0]?data.user[0]:{};
            currentLocalUser.username=updateFields.username||currentLocalUser.username;
            currentLocalUser.phone=updateFields.phone||currentLocalUser.phone;
            currentLocalUser.email=updateFields.email||currentLocalUser.email;
            currentLocalUser.user_id=updateFields.user_id||currentLocalUser.user_id;
            currentLocalUser.role_name=updateFields.role||currentLocalUser.role;
            localStorage.setItem("user",JSON.stringify(currentLocalUser));
            window.dispatchEvent(new Event("userUpdated"));
            console.log(data.user);
    }catch (error) {
        console.error("Error updating user info:", error);  
    }
}
const changePassword = async () => {
    try{
        if(newPw !== confirmPw){
            console.error("New password and confirm password do not match.");
            return;
        }
        const response = await fetch(`${baseURL}/api/user/me/password`, {
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "user_id": user_id, "current_password": curPw, "confirm_password": confirmPw, "new_password": newPw })
        });
        if(!response.ok){
            console.error(`HTTP error! status: ${response.status}`);
            const errorData = await response.json();
            if(errorData.missing){
                console.error("Missing fields:", errorData.missing);
            }else{
                console.error("Error response:", errorData.message || "Unknown error");
            }
            return;
        }
        const data = await response.json();
        console.log(data.message);
    }catch (error) {
        console.error("Error changing password:", error);
    }
}

  async function handleSaveInfo() {
    setSavingInfo(true);
    await  updateUserInfo();
    setTimeout(() => { setSavingInfo(false); setSavedInfo(true); setTimeout(() => setSavedInfo(false), 2000); }, 800);
  }

  async function handleSavePw() {
    if (!curPw || !newPw || !pwMatch) return;
    setSavingPw(true);
    await changePassword();
    setTimeout(() => {
      setSavingPw(false); setSavedPw(true);
      setCurPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setSavedPw(false), 2000);
    }, 800);
  }

  function handleAvatar(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setAvatarSrc(ev.target.result);
    r.readAsDataURL(f);
  }

  const hov = (k) => ({
    onMouseEnter: () => setBtnHover(p => ({ ...p, [k]: true })),
    onMouseLeave: () => setBtnHover(p => ({ ...p, [k]: false })),
  });

  return (
    <div style={s.root}>
     
      {/* Personal Information */}
      <div style={s.card}>
        <div style={s.sectionHead}>
          <div style={s.sectionBar} />
          <p style={s.sectionTitle}>Personal Information</p>
        </div>

        <div style={s.avatarArea}>
          <div style={s.avatar} onClick={() => fileRef.current.click()}>
            {avatarSrc
              ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : initials}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatar} />
          </div>
          <div style={s.avatarMeta}>
            <p style={s.avatarName}>{uname}</p>
            <p style={s.avatarRole}>{role}</p>
          </div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Click avatar to change</div>
        </div>

        <div style={grid}>
          <div>
            <div style={s.label}>Username</div>
            <InputField value={uname} onChange={setUname} />
          </div>
          <div>
            <div style={s.label}>Phone</div>
            <div style={s.phoneRow}>
              <div style={s.phonePrefix}>+263</div>
              <PhoneInput value={phone} onChange={setPhone} />
            </div>
          </div>
          <div>
            <div style={s.label}>Role</div>
            <div style={s.inputWrap}>
              <span style={s.iconLeft}><LockIcon /></span>
              <input
                readOnly
                value={role}
                style={{ ...s.inputWithIcon(false, true), width: "100%", boxSizing: "border-box" }}
              />
            </div>
          </div>
          <div>
            <div style={s.label}>Email</div>
            <div style={s.inputWrap}>
              <input
                value={emailVal}
                onChange={e => setEmailVal(e.target.value)}
                style={{ ...s.input(false, false), width: "100%", boxSizing: "border-box", paddingRight: 30 }}
              />
              {emailVal.includes("@") && (
                <span style={s.verifiedIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill={C.green} />
                    <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={s.btnRow}>
          <button
            style={s.btnPrimary(btnHover.save)}
            {...hov("save")}
            onClick={handleSaveInfo}
          >
            {savedInfo ? <><CheckIcon /> Saved!</> : savingInfo ? "Saving..." : <><SaveIcon /> Save</>}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div style={s.card}>
        <div style={s.sectionHead}>
          <div style={s.sectionBar} />
          <p style={s.sectionTitle}>Change Password</p>
        </div>

        <div style={isMobile ? s.gridMobile : { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 20px" }}>
          <PwField label="Current Password" value={curPw} onChange={setCurPw} />
          <div>
            <PwField label="New Password" value={newPw} onChange={setNewPw} />
            {newPw && (
              <>
                <div style={s.strengthBar}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={s.seg(i < pwScore, strengthColor)} />
                  ))}
                </div>
                <p style={s.strengthLabel(strengthColor)}>{strengthLabels[pwScore]}</p>
              </>
            )}
          </div>
          <div>
            <PwField label="Confirm Password" value={confirmPw} onChange={setConfirmPw} />
            {pwMatch && <p style={s.matchMsg(true)}>Passwords match</p>}
            {pwMismatch && <p style={s.matchMsg(false)}>Passwords do not match</p>}
          </div>
        </div>

        <div style={s.btnRow}>
          <button style={s.btnGhost(btnHover.cancel)} {...hov("cancel")} onClick={() => { setCurPw(""); setNewPw(""); setConfirmPw(""); }}>
            Cancel
          </button>
          <button
            style={{ ...s.btnPrimary(btnHover.savepw), opacity: (!curPw || !newPw || !pwMatch) ? 0.5 : 1 }}
            {...hov("savepw")}
            onClick={handleSavePw}
          >
            {savedPw ? <><CheckIcon /> Updated!</> : savingPw ? "Saving..." : <><KeyIcon /> Save Password</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({ value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...s.input(focused, false), width: "100%", boxSizing: "border-box" }}
    />
  );
}

function PhoneInput({ value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...s.input(focused, false),
        width: "100%",
        boxSizing: "border-box",
        borderRadius: "0 7px 7px 0",
        borderLeft: "none",
      }}
    />
  );
}
