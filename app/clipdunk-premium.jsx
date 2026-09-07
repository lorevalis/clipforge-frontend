"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function api(path, opts = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("cf_token") : null;
  const res = await fetch(`${API}${path}`, { ...opts, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers } });
  if (res.status === 401) { localStorage.removeItem("cf_token"); localStorage.removeItem("cf_refresh"); window.location.reload(); }
  return res;
}

const FORMATS = [
  { id: "reddit-story", name: "Reddit Story", tag: "Most Popular", desc: "Viral Reddit stories with gameplay background, voiceover narration, and animated captions.", icon: "💬", accent: "#FF4500", gradient: "linear-gradient(135deg,#FF4500,#FF6B35,#FFB088)", example: "Subway Surfers + AITA narration", settings: { voices: ["Deep Male","Casual Female","British Narrator","Dramatic Male"], durations: ["30s","60s","90s","3min"], backgrounds: ["Minecraft Parkour","Subway Surfers","GTA Gameplay","Satisfying Clips"] } },
  { id: "vox-explainer", name: "VOX Explainer", tag: "Trending", desc: "Data-driven explainer videos with maps, charts, motion graphics, and authoritative narration.", icon: "📊", accent: "#E5AC00", gradient: "linear-gradient(135deg,#F0B800,#FFD23F,#FFF0B3)", example: "Why cities are removing highways", settings: { voices: ["Authoritative Male","Calm Female","Documentary Style","Conversational"], durations: ["2min","3min","5min","8min"], backgrounds: ["Auto-generated"] } },
  { id: "stickman", name: "Stickman Animation", tag: "Fun", desc: "Whiteboard-style stick figure animations that explain topics, tell jokes, or narrate stories.", icon: "🏃", accent: "#10B981", gradient: "linear-gradient(135deg,#10B981,#34D399,#A7F3D0)", example: "What if Earth stopped spinning", settings: { voices: ["Energetic Male","Friendly Female","Comedic","Kid-Friendly"], durations: ["30s","60s","90s","2min"], backgrounds: ["White Canvas","Chalkboard","Notebook Paper"] } },
  { id: "cinematic-doc", name: "Cinematic Documentary", tag: "Premium", desc: "Dramatic AI-generated visuals with cinematic narration, music, and Ken Burns-style camera work.", icon: "🎬", accent: "#7B61FF", gradient: "linear-gradient(135deg,#5B3FD9,#7B61FF,#C4B5FD)", example: "The lost city of Atlantis", settings: { voices: ["Deep Cinematic","Soft Documentary","Dramatic Female","Morgan-style"], durations: ["2min","3min","5min","10min"], backgrounds: ["AI Cinematic Scenes"] } },
  { id: "news-anchor", name: "AI News Broadcast", tag: "New", desc: "Synthetic news anchor presents your topic with B-roll footage, lower thirds, and breaking-news graphics.", icon: "📺", accent: "#EF4444", gradient: "linear-gradient(135deg,#DC2626,#EF4444,#FCA5A5)", example: "Tech company launches new AI chip", settings: { voices: ["News Anchor Male","News Anchor Female","Field Reporter"], durations: ["30s","60s","90s","2min"], backgrounds: ["News Studio A","News Studio B"] } },
  { id: "podcast-clip", name: "Podcast Highlights", tag: "Creator", desc: "Split-screen talking heads with animated captions, perfect for short-form clips.", icon: "🎙️", accent: "#F97316", gradient: "linear-gradient(135deg,#EA580C,#F97316,#FDBA74)", example: "Joe Rogan-style debate clip", settings: { voices: ["Host Voice","Guest Voice 1","Dual Conversation"], durations: ["30s","60s","90s","2min"], backgrounds: ["Dark Studio","Neon Studio","Minimal"] } },
];

const STAGE_MAP = { queued: 0, script: 0, voice: 1, visuals: 2, assembly: 3, rendering: 4, completed: 5 };
const STAGE_LABELS = ["Analyzing & Scripting","Generating Voice","Creating Visuals","Assembling Video","Final Render"];
const RATIOS = [{ id: "9:16", label: "9:16", sub: "Reels / TikTok", icon: "📱" },{ id: "16:9", label: "16:9", sub: "YouTube", icon: "🖥" },{ id: "1:1", label: "1:1", sub: "Instagram", icon: "⬜" }];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#08090D;--bg2:#0E1017;--card:#13151F;--elev:#1F2233;--b1:rgba(255,255,255,.04);--b2:rgba(255,255,255,.08);--b3:rgba(255,255,255,.12);--t1:#F4F4F7;--t2:#9598A8;--t3:#5C5F72;--acc:#FF6B35;--acc-g:linear-gradient(135deg,#FF6B35,#FF9F6B);--violet:#7B61FF;--green:#34D399;--red:#EF4444;--r:10px;--r2:14px;--r3:20px;--glass:rgba(19,21,31,.72);--glass-b:saturate(180%) blur(20px);--shadow:0 4px 24px rgba(0,0,0,.4);--glow:0 0 40px rgba(255,107,53,.15)}
.app{background:var(--bg);min-height:100vh;color:var(--t1);font-family:'Plus Jakarta Sans',system-ui,sans-serif}
.app::before{content:'';position:fixed;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle at 30% 20%,rgba(123,97,255,.04),transparent 50%),radial-gradient(circle at 70% 80%,rgba(255,107,53,.03),transparent 50%);pointer-events:none;z-index:0}
.hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-bottom:1px solid var(--b1);background:var(--glass);backdrop-filter:var(--glass-b);-webkit-backdrop-filter:var(--glass-b);position:sticky;top:0;z-index:100}
.logo{display:flex;align-items:center;gap:10px;cursor:pointer}
.logo-m{width:34px;height:34px;background:var(--acc-g);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;font-family:'Space Mono',monospace;box-shadow:0 0 20px rgba(255,107,53,.3)}
.logo-t{font-size:19px;font-weight:800;letter-spacing:-.5px}.logo-t em{font-style:normal;background:var(--acc-g);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hdr-r{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.cr-badge{display:flex;align-items:center;gap:6px;background:var(--card);padding:7px 14px;border-radius:100px;border:1px solid var(--b2);font-size:13px;color:var(--t2)}
.cr-n{color:var(--acc);font-weight:700;font-family:'Space Mono',monospace}
.plan-badge{font-size:11px;font-weight:600;color:var(--violet);background:rgba(123,97,255,.12);padding:4px 10px;border-radius:100px;text-transform:uppercase}
.lo-btn{background:none;border:1px solid var(--b2);color:var(--t2);padding:6px 12px;border-radius:var(--r);font-size:12px;cursor:pointer;font-family:inherit;transition:all .2s}
.lo-btn:hover{border-color:var(--red);color:var(--red)}
.auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;position:relative;z-index:1}
.auth-card{background:var(--card);border:1px solid var(--b1);border-radius:var(--r3);padding:36px;width:100%;max-width:420px;box-shadow:var(--shadow)}
.auth-title{font-size:22px;font-weight:800;text-align:center;margin-bottom:6px}
.auth-sub{font-size:13px;color:var(--t2);text-align:center;margin-bottom:24px}
.auth-field{margin-bottom:16px}.auth-field label{font-size:12px;font-weight:600;color:var(--t2);margin-bottom:6px;display:block;text-transform:uppercase;letter-spacing:.3px}
.auth-field input{width:100%;background:var(--elev);border:1px solid var(--b2);border-radius:var(--r);padding:11px 14px;color:var(--t1);font-size:14px;font-family:inherit;outline:none;transition:border-color .2s}
.auth-field input:focus{border-color:var(--acc)}.auth-field input::placeholder{color:var(--t3)}
.auth-btn{width:100%;padding:12px;border-radius:var(--r);background:var(--acc-g);color:#fff;font-size:14px;font-weight:700;border:none;cursor:pointer;font-family:inherit;box-shadow:0 2px 12px rgba(255,107,53,.3);margin-top:8px;transition:all .2s}
.auth-btn:hover{transform:translateY(-1px)}.auth-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.auth-switch{text-align:center;margin-top:20px;font-size:13px;color:var(--t2)}.auth-switch a{color:var(--acc);cursor:pointer;font-weight:600}
.auth-err{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:var(--r);padding:10px 14px;font-size:13px;color:var(--red);margin-bottom:16px}
.stepper{display:flex;align-items:center;justify-content:center;padding:18px 24px 0}
.s-item{display:flex;align-items:center}
.s-dot{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:'Space Mono',monospace;border:2px solid var(--b2);color:var(--t3);background:var(--bg2);transition:all .35s;position:relative}
.s-dot.on{border-color:var(--acc);color:var(--acc);background:rgba(255,107,53,.1);box-shadow:0 0 20px rgba(255,107,53,.2)}
.s-dot.done{border-color:var(--green);color:#fff;background:var(--green)}.s-dot.done::after{content:"✓";font-size:13px}
.s-lbl{position:absolute;bottom:-20px;font-size:10px;white-space:nowrap;left:50%;transform:translateX(-50%);color:var(--t3);font-weight:500;letter-spacing:.3px;text-transform:uppercase}
.s-lbl.on{color:var(--acc)}.s-lbl.done{color:var(--green)}
.s-line{width:48px;height:2px;background:var(--b2);margin:0 4px}.s-line.done{background:var(--green)}.s-line.on{background:linear-gradient(90deg,var(--green),var(--acc))}
.content{max-width:1080px;margin:0 auto;padding:44px 20px 60px;position:relative;z-index:1}
.sec-t{font-size:26px;font-weight:800;letter-spacing:-.5px}.sec-t em{font-style:normal;background:var(--acc-g);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sec-s{color:var(--t2);font-size:14px;margin-top:6px;margin-bottom:28px;line-height:1.6}
.fmt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:14px}
.fmt-c{background:var(--card);border:1px solid var(--b1);border-radius:var(--r2);padding:22px;cursor:pointer;transition:all .3s;position:relative;overflow:hidden}
.fmt-c:hover{border-color:var(--b3);transform:translateY(-2px);box-shadow:var(--shadow)}
.fmt-c.sel{border-color:rgba(255,107,53,.5);box-shadow:0 0 0 1px rgba(255,107,53,.3),var(--glow)}
.fmt-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px}
.fmt-icon{width:44px;height:44px;border-radius:var(--r);display:flex;align-items:center;justify-content:center;font-size:22px}
.fmt-tag{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;padding:4px 8px;border-radius:6px}
.fmt-name{font-size:17px;font-weight:700;margin-bottom:5px}.fmt-desc{color:var(--t2);font-size:12.5px;line-height:1.5;margin-bottom:10px}
.fmt-ex{font-size:11px;color:var(--t3);display:flex;align-items:center;gap:5px}.fmt-ex span{color:var(--t2);font-style:italic}
.cfg-layout{display:grid;grid-template-columns:1fr 320px;gap:20px}@media(max-width:800px){.cfg-layout{grid-template-columns:1fr}}
.cfg-col{display:flex;flex-direction:column;gap:16px}
.cfg-card{background:var(--card);border:1px solid var(--b1);border-radius:var(--r2);padding:22px}
.cfg-title{font-size:14px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.inp-lbl{font-size:12px;font-weight:600;color:var(--t2);margin-bottom:6px;display:block;text-transform:uppercase;letter-spacing:.2px}
.inp{width:100%;background:var(--elev);border:1px solid var(--b2);border-radius:var(--r);padding:11px 14px;color:var(--t1);font-size:14px;font-family:inherit;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--acc)}.inp::placeholder{color:var(--t3)}textarea.inp{min-height:120px;line-height:1.6;resize:vertical}
.chips{display:flex;flex-wrap:wrap;gap:7px}
.chip{padding:7px 13px;border-radius:var(--r);border:1px solid var(--b2);background:var(--elev);font-size:12.5px;color:var(--t2);cursor:pointer;transition:all .2s;font-weight:500}
.chip:hover{border-color:var(--t3);color:var(--t1)}.chip.on{border-color:var(--acc);color:var(--acc);background:rgba(255,107,53,.08)}
.ratios{display:flex;gap:7px}
.ratio{flex:1;padding:10px 6px;border-radius:var(--r);border:1px solid var(--b2);background:var(--elev);cursor:pointer;text-align:center;transition:all .2s}
.ratio:hover{border-color:var(--t3)}.ratio.on{border-color:var(--acc);background:rgba(255,107,53,.08)}
.ratio .ri{font-size:18px;margin-bottom:3px}.ratio .rl{font-size:13px;font-weight:700;font-family:'Space Mono',monospace;color:var(--t1)}.ratio.on .rl{color:var(--acc)}.ratio .rs{font-size:10px;color:var(--t3);margin-top:2px}
.tog-row{display:flex;align-items:center;justify-content:space-between;padding:6px 0}.tog-row label{font-size:13px;color:var(--t2)}
.tog{width:38px;height:20px;border-radius:10px;background:var(--elev);border:1px solid var(--b2);position:relative;cursor:pointer;transition:all .2s}
.tog.on{background:var(--acc);border-color:var(--acc)}.tog::after{content:'';width:14px;height:14px;border-radius:50%;background:#fff;position:absolute;top:2px;left:2px;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.3)}.tog.on::after{transform:translateX(18px)}
.sum-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px}.sum-l{color:var(--t2)}.sum-v{font-weight:600;font-family:'Space Mono',monospace;font-size:12px}
.sum-div{border:none;border-top:1px solid var(--b1);margin:4px 0}.sum-total .sum-l{color:var(--t1);font-weight:700}.sum-total .sum-v{color:var(--acc);font-size:15px}
.side-preview{background:var(--elev);border-radius:var(--r);padding:18px;text-align:center;border:1px solid var(--b1)}
.sp-icon{font-size:36px;margin-bottom:6px}.sp-name{font-weight:700;font-size:15px;margin-bottom:3px}.sp-tag{font-size:11px;color:var(--t3)}
.btn-row{display:flex;gap:10px;justify-content:flex-end;margin-top:20px}
.btn{padding:11px 24px;border-radius:var(--r);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;border:none;transition:all .25s;display:flex;align-items:center;gap:7px}
.btn-p{background:var(--acc-g);color:#fff;box-shadow:0 2px 12px rgba(255,107,53,.3)}.btn-p:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(255,107,53,.4)}.btn-p:disabled{opacity:.35;cursor:not-allowed;transform:none;box-shadow:none}
.btn-s{background:var(--card);color:var(--t2);border:1px solid var(--b2)}.btn-s:hover{color:var(--t1);border-color:var(--b3)}
.gen-wrap{max-width:580px;margin:0 auto;text-align:center}
.gen-badge{display:inline-flex;align-items:center;gap:7px;padding:6px 14px;background:var(--card);border:1px solid var(--b1);border-radius:100px;font-size:13px;font-weight:600;margin-bottom:28px}
.gen-t{font-size:22px;font-weight:800;margin-bottom:6px}.gen-s{color:var(--t2);font-size:13px;margin-bottom:36px}
.ring-wrap{position:relative;width:180px;height:180px;margin:0 auto 28px}
.ring{transform:rotate(-90deg)}.ring-bg{fill:none;stroke:var(--elev);stroke-width:7}.ring-fill{fill:none;stroke:url(#ringGrad);stroke-width:7;stroke-linecap:round;transition:stroke-dashoffset .6s ease;filter:drop-shadow(0 0 8px rgba(255,107,53,.4))}
.ring-pct{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Space Mono',monospace;font-size:38px;font-weight:700}.ring-pct sup{font-size:16px;color:var(--t2)}
.stage-msg{font-size:15px;font-weight:500;margin-bottom:28px;min-height:22px}.stage-msg .mt{animation:fadeUp .3s ease;display:inline-block}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.tl{text-align:left;background:var(--card);border-radius:var(--r2);padding:18px 22px;border:1px solid var(--b1)}
.tl-row{display:flex;align-items:center;gap:10px;padding:9px 0;position:relative}
.tl-row:not(:last-child)::after{content:'';position:absolute;left:10px;top:32px;width:2px;height:calc(100% - 12px);background:var(--b1)}
.tl-row.done:not(:last-child)::after{background:var(--green)}.tl-row.on:not(:last-child)::after{background:linear-gradient(180deg,var(--acc),var(--b1))}
.tl-dot{width:22px;height:22px;border-radius:50%;border:2px solid var(--b2);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;z-index:1;background:var(--card)}
.tl-dot.done{border-color:var(--green);background:var(--green);color:#fff}.tl-dot.on{border-color:var(--acc);background:rgba(255,107,53,.1)}
.tl-dot.on::after{content:'';width:7px;height:7px;border-radius:50%;background:var(--acc);animation:pulse 1.2s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.6)}}
.tl-info{flex:1}.tl-name{font-size:13px;font-weight:600;color:var(--t3)}.tl-name.done{color:var(--green)}.tl-name.on{color:var(--t1)}
.tl-det{font-size:11px;color:var(--t3);margin-top:1px}.tl-det.on{color:var(--t2)}
.prev-wrap{max-width:740px;margin:0 auto}
.done-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.2);border-radius:100px;color:var(--green);font-size:12px;font-weight:600;margin-bottom:16px}
.player{background:var(--card);border:1px solid var(--b1);border-radius:var(--r3);overflow:hidden;margin-bottom:20px;box-shadow:var(--shadow)}
.vid-area{width:100%;aspect-ratio:16/9;background:#000;display:flex;align-items:center;justify-content:center}
.vid-area.vert{aspect-ratio:9/16;max-width:320px;margin:0 auto}.vid-area.sq{aspect-ratio:1/1;max-width:420px;margin:0 auto}
.play-btn{width:64px;height:64px;border-radius:50%;background:rgba(255,107,53,.85);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(255,107,53,.3)}
.play-lbl{color:rgba(255,255,255,.5);font-size:12px;margin-top:8px}
.actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}
.act{background:var(--card);border:1px solid var(--b1);border-radius:var(--r);padding:14px 16px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:10px}
.act:hover{border-color:var(--b3);transform:translateY(-1px);box-shadow:var(--shadow)}
.act-i{width:36px;height:36px;border-radius:var(--r);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.act-t{font-size:13px;font-weight:700;margin-bottom:1px}.act-s{font-size:11px;color:var(--t3)}
.fade{animation:fadeIn .4s ease}@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.cc{font-size:11px;color:var(--t3);text-align:right;margin-top:3px}
`;

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [name, setName] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const body = mode === "register" ? { email, password, full_name: name || undefined } : { email, password };
      const res = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(typeof data.detail === "string" ? data.detail : Array.isArray(data.detail) ? data.detail.map(e => e.msg).join(", ") : "Something went wrong"); setLoading(false); return; }
      localStorage.setItem("cf_token", data.access_token); localStorage.setItem("cf_refresh", data.refresh_token);
      onLogin();
    } catch { setError("Cannot connect to server. Is the backend running?"); }
    setLoading(false);
  };
  return (
    <div className="app"><style>{CSS}</style><div className="auth-wrap"><div className="auth-card fade">
      <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginBottom:28}}><div className="logo-m">C</div><div className="logo-t">Clip<em>Dunk</em></div></div>
      <div className="auth-title">{mode === "login" ? "Welcome back" : "Create your account"}</div>
      <div className="auth-sub">{mode === "login" ? "Log in to generate AI videos" : "Start creating AI videos for free"}</div>
      {error && <div className="auth-err">{error}</div>}
      {mode === "register" && <div className="auth-field"><label>Full Name</label><input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} /></div>}
      <div className="auth-field"><label>Email</label><input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div className="auth-field"><label>Password</label><input type="password" placeholder={mode === "register" ? "Min 8 characters" : "Your password"} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} /></div>
      <button className="auth-btn" disabled={loading || !email || !password} onClick={submit}>{loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}</button>
      <div className="auth-switch">{mode === "login" ? <>No account? <a onClick={() => { setMode("register"); setError(""); }}>Sign up free</a></> : <>Have an account? <a onClick={() => { setMode("login"); setError(""); }}>Log in</a></>}</div>
    </div></div></div>
  );
}

export default function ClipDunk() {
  const [authed, setAuthed] = useState(false); const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); const [fmt, setFmt] = useState(null);
  const [topic, setTopic] = useState(""); const [script, setScript] = useState(""); const [useScript, setUseScript] = useState(false);
  const [voice, setVoice] = useState(""); const [dur, setDur] = useState(""); const [bg, setBg] = useState(""); const [ratio, setRatio] = useState("9:16");
  const [caps, setCaps] = useState(true); const [music, setMusic] = useState(true);
  const [gStage, setGStage] = useState(0); const [gPct, setGPct] = useState(0); const [gMsg, setGMsg] = useState(""); const [gDone, setGDone] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null); const [genError, setGenError] = useState("");
  const pollRef = useRef(null);
  const stp = ["Format","Configure","Generate","Preview"];

  useEffect(() => { const t = localStorage.getItem("cf_token"); if (t) { loadUser().finally(() => setLoading(false)); } else { setLoading(false); } }, []);
  async function loadUser() { try { const r = await api("/api/auth/me"); if (r.ok) { const d = await r.json(); setUser(d); setAuthed(true); } } catch {} }
  function logout() { localStorage.removeItem("cf_token"); localStorage.removeItem("cf_refresh"); setAuthed(false); setUser(null); setStep(0); }
  const pick = (f) => { setFmt(f); setVoice(f.settings.voices[0]); setDur(f.settings.durations[1]); setBg(f.settings.backgrounds[0]); };
  const ok = topic.trim().length > 5 || script.trim().length > 20;

  const startGen = async () => {
    setStep(2); setGStage(0); setGPct(5); setGDone(false); setGenError(""); setVideoUrl(null); setGMsg("Submitting your request...");
    try {
      const res = await api("/api/videos/generate", { method: "POST", body: JSON.stringify({ topic, custom_script: useScript ? script : null, format: fmt.id, voice_name: voice, duration_target: dur, aspect_ratio: ratio, background_option: bg, add_captions: caps, add_music: music }) });
      const data = await res.json();
      if (!res.ok) { setGenError(typeof data.detail === "object" ? data.detail.message : data.detail || "Failed"); setGMsg("Error occurred"); return; }
      const vid = data.id; setGMsg("Processing started..."); setGPct(10);
      pollRef.current = setInterval(async () => {
        try {
          const sr = await api(`/api/videos/${vid}/status`); if (!sr.ok) return; const s = await sr.json();
          setGPct(s.progress_percent); setGMsg(s.progress_message || "Processing...");
          if (s.status in STAGE_MAP) setGStage(STAGE_MAP[s.status]);
          if (s.status === "completed") { clearInterval(pollRef.current); setGDone(true); setGPct(100); setVideoUrl(s.video_url); await loadUser(); setTimeout(() => setStep(3), 700); }
          else if (s.status === "failed") { clearInterval(pollRef.current); setGenError(s.error_message || "Failed"); setGMsg("Generation failed"); }
        } catch {}
      }, 3000);
    } catch { setGenError("Cannot connect to server"); setGMsg("Connection error"); }
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);
  const reset = () => { setStep(0); setFmt(null); setTopic(""); setScript(""); setUseScript(false); setGStage(0); setGPct(0); setGDone(false); setVideoUrl(null); setGenError(""); if (pollRef.current) clearInterval(pollRef.current); loadUser(); };
  const R = 80, Ci = 2 * Math.PI * R, O = Ci - (gPct / 100) * Ci;

  if (loading) return <div className="app"><style>{CSS}</style><div className="auth-wrap"><div style={{color:"var(--t2)"}}>Loading...</div></div></div>;
  if (!authed) return <AuthScreen onLogin={() => { loadUser(); setAuthed(true); }} />;

  return (
    <div className="app"><style>{CSS}</style>
      <header className="hdr">
        <div className="logo" onClick={reset}><div className="logo-m">C</div><div className="logo-t">Clip<em>Dunk</em></div></div>
        <div className="hdr-r">
          {user && <span className="plan-badge">{user.plan}</span>}
          <div className="cr-badge">Credits: <span className="cr-n">{user?.credits_balance ?? 0}</span></div>
          <button className="lo-btn" onClick={logout}>Log out</button>
        </div>
      </header>
      <div className="stepper">{stp.map((s,i) => (<div className="s-item" key={s}><div style={{position:"relative"}}><div className={`s-dot ${i<step?"done":i===step?"on":""}`}>{i<step?"":i+1}</div><div className={`s-lbl ${i<step?"done":i===step?"on":""}`}>{s}</div></div>{i<stp.length-1&&<div className={`s-line ${i<step?"done":i===step?"on":""}`}/>}</div>))}</div>
      <div className="content fade" key={step}>
        {step===0&&(<div><h1 className="sec-t">Choose your <em>video format</em></h1><p className="sec-s">Each template uses a unique combination of visuals, narration style, and editing.</p>
          <div className="fmt-grid">{FORMATS.map(f=>(<div key={f.id} className={`fmt-c ${fmt?.id===f.id?"sel":""}`} onClick={()=>pick(f)}><div style={{position:"absolute",top:0,left:0,right:0,height:3,background:f.gradient,borderRadius:"14px 14px 0 0"}}/><div className="fmt-top"><div className="fmt-icon" style={{background:`${f.accent}15`}}>{f.icon}</div><div className="fmt-tag" style={{background:`${f.accent}12`,color:f.accent}}>{f.tag}</div></div><div className="fmt-name">{f.name}</div><div className="fmt-desc">{f.desc}</div><div className="fmt-ex">💡 <span>{f.example}</span></div></div>))}</div>
          <div className="btn-row"><button className="btn btn-p" disabled={!fmt} onClick={()=>setStep(1)}>Continue →</button></div></div>)}
        {step===1&&fmt&&(<div><h1 className="sec-t">Configure your <em>video</em></h1><p className="sec-s">Describe your topic and adjust settings.</p>
          <div className="cfg-layout"><div className="cfg-col">
            <div className="cfg-card"><div className="cfg-title">📝 Content</div><label className="inp-lbl">Topic or idea</label><input className="inp" placeholder='e.g., "Why do planes leave white trails?"' value={topic} onChange={e=>setTopic(e.target.value)}/><div style={{marginTop:14}}><div className="tog-row"><label>Write my own script</label><div className={`tog ${useScript?"on":""}`} onClick={()=>setUseScript(!useScript)}/></div></div>{useScript&&<div style={{marginTop:10}}><label className="inp-lbl">Your script</label><textarea className="inp" placeholder="Paste your script here." value={script} onChange={e=>setScript(e.target.value)}/><div className="cc">{script.length} chars</div></div>}</div>
            <div className="cfg-card"><div className="cfg-title">🎙️ Voice</div><div className="chips">{fmt.settings.voices.map(v=>(<div key={v} className={`chip ${voice===v?"on":""}`} onClick={()=>setVoice(v)}>{v}</div>))}</div></div>
            <div className="cfg-card"><div className="cfg-title">⏱️ Duration & format</div><label className="inp-lbl">Length</label><div className="chips" style={{marginBottom:16}}>{fmt.settings.durations.map(d=>(<div key={d} className={`chip ${dur===d?"on":""}`} onClick={()=>setDur(d)}>{d}</div>))}</div><label className="inp-lbl">Aspect ratio</label><div className="ratios">{RATIOS.map(r=>(<div key={r.id} className={`ratio ${ratio===r.id?"on":""}`} onClick={()=>setRatio(r.id)}><div className="ri">{r.icon}</div><div className="rl">{r.label}</div><div className="rs">{r.sub}</div></div>))}</div></div>
            {fmt.settings.backgrounds.length>1&&<div className="cfg-card"><div className="cfg-title">🎨 Background</div><div className="chips">{fmt.settings.backgrounds.map(b=>(<div key={b} className={`chip ${bg===b?"on":""}`} onClick={()=>setBg(b)}>{b}</div>))}</div></div>}
            <div className="cfg-card"><div className="cfg-title">✨ Extras</div><div className="tog-row"><label>Auto-generate captions</label><div className={`tog ${caps?"on":""}`} onClick={()=>setCaps(!caps)}/></div><div className="tog-row"><label>Background music</label><div className={`tog ${music?"on":""}`} onClick={()=>setMusic(!music)}/></div></div>
          </div><div className="cfg-col">
            <div className="cfg-card"><div className="side-preview"><div className="sp-icon">{fmt.icon}</div><div className="sp-name">{fmt.name}</div><div className="sp-tag">{fmt.tag} format</div></div></div>
            <div className="cfg-card"><div className="cfg-title">📋 Summary</div><div className="sum-row"><span className="sum-l">Format</span><span className="sum-v">{fmt.name}</span></div><div className="sum-row"><span className="sum-l">Duration</span><span className="sum-v">{dur}</span></div><div className="sum-row"><span className="sum-l">Ratio</span><span className="sum-v">{ratio}</span></div><div className="sum-row"><span className="sum-l">Voice</span><span className="sum-v" style={{fontSize:11,textAlign:"right",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{voice}</span></div><hr className="sum-div"/><div className="sum-row sum-total"><span className="sum-l">Credits</span><span className="sum-v">2</span></div><div style={{fontSize:11,color:"var(--t2)",marginTop:4}}>Balance: {user?.credits_balance??0} credits</div></div>
            <button className="btn btn-p" style={{width:"100%",justifyContent:"center"}} disabled={!ok||(user?.credits_balance??0)<1} onClick={startGen}>{(user?.credits_balance??0)<1?"No credits":"🚀 Generate Video"}</button>
            <button className="btn btn-s" style={{width:"100%",justifyContent:"center"}} onClick={()=>setStep(0)}>← Back</button>
          </div></div></div>)}
        {step===2&&fmt&&(<div className="gen-wrap">
          <div className="gen-badge"><span>{fmt.icon}</span>{fmt.name}</div>
          <h1 className="gen-t">{gDone?"Video ready!":genError?"Generation Issue":"Creating your video"}</h1>
          <p className="gen-s">{gDone?"Your video has been generated.":genError||"Sit back — this usually takes 1–3 minutes."}</p>
          <div className="ring-wrap"><svg className="ring" width="180" height="180"><defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FF6B35"/><stop offset="100%" stopColor="#FF9F6B"/></linearGradient></defs><circle className="ring-bg" cx="90" cy="90" r={R}/><circle className="ring-fill" cx="90" cy="90" r={R} strokeDasharray={Ci} strokeDashoffset={O}/></svg><div className="ring-pct">{gPct}<sup>%</sup></div></div>
          <div className="stage-msg"><span className="mt" key={gMsg}>{gMsg}</span></div>
          {genError&&<div style={{marginTop:16}}><button className="btn btn-s" style={{margin:"0 auto"}} onClick={reset}>← Try Again</button></div>}
          <div className="tl">{STAGE_LABELS.map((st,i)=>{const d=i<gStage,a=i===gStage&&!gDone&&!genError;return(<div key={i} className={`tl-row ${d?"done":""} ${a?"on":""}`}><div className={`tl-dot ${d?"done":""} ${a?"on":""}`}>{d&&"✓"}</div><div className="tl-info"><div className={`tl-name ${d?"done":""} ${a?"on":""}`}>{st}</div>{a&&<div className="tl-det on">{gMsg}</div>}{d&&<div className="tl-det">Completed</div>}</div></div>)})}</div>
        </div>)}
        {step===3&&fmt&&(<div className="prev-wrap"><div style={{textAlign:"center"}}><div className="done-badge">✓ Generated successfully</div><h1 className="sec-t">Your <em>video</em> is ready</h1><p className="sec-s">Preview, download, or share your {fmt.name} video.</p></div>
          <div className="player"><div className={`vid-area ${ratio==="9:16"?"vert":ratio==="1:1"?"sq":""}`}>{videoUrl?<video controls style={{width:"100%",height:"100%",objectFit:"contain"}} src={videoUrl}/>:<div style={{textAlign:"center"}}><button className="play-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><polygon points="6,3 20,12 6,21"/></svg></button><div className="play-lbl">Video preview</div></div>}</div></div>
          <div className="actions">{videoUrl&&<a className="act" href={videoUrl} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",color:"inherit"}}><div className="act-i" style={{background:"rgba(255,107,53,.1)"}}>⬇️</div><div><div className="act-t">Download MP4</div><div className="act-s">Full quality</div></div></a>}
            <div className="act"><div className="act-i" style={{background:"rgba(123,97,255,.1)"}}>🔗</div><div><div className="act-t">Share Link</div><div className="act-s">Shareable URL</div></div></div>
            <div className="act" onClick={reset}><div className="act-i" style={{background:"rgba(249,115,22,.1)"}}>✏️</div><div><div className="act-t">Create Another</div><div className="act-s">New video</div></div></div></div>
          <div className="btn-row" style={{marginTop:28}}><button className="btn btn-s" onClick={reset}>← Create another video</button></div></div>)}
      </div>
    </div>
  );
}
