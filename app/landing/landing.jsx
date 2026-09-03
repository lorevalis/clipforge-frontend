"use client";
import { useState, useEffect, useRef } from "react";

// ─── Styles ────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#08090D;--bg2:#0E1017;--card:#13151F;--elev:#1F2233;--b1:rgba(255,255,255,.04);--b2:rgba(255,255,255,.08);--b3:rgba(255,255,255,.12);--t1:#F4F4F7;--t2:#9598A8;--t3:#5C5F72;--acc:#FF6B35;--acc-g:linear-gradient(135deg,#FF6B35,#FF9F6B);--violet:#7B61FF;--green:#34D399;--red:#EF4444;--r:10px;--r2:14px;--r3:20px;--glass:rgba(19,21,31,.72);--glass-b:saturate(180%) blur(20px);--shadow:0 4px 24px rgba(0,0,0,.4);--glow:0 0 40px rgba(255,107,53,.15)}
html{scroll-behavior:smooth}
.lp{background:var(--bg);min-height:100vh;color:var(--t1);font-family:'Plus Jakarta Sans',system-ui,sans-serif;overflow-x:hidden}

/* ── Ambient glow ── */
.lp::before{content:'';position:fixed;top:-40%;left:-30%;width:160%;height:160%;background:radial-gradient(circle at 25% 15%,rgba(123,97,255,.05),transparent 45%),radial-gradient(circle at 75% 75%,rgba(255,107,53,.04),transparent 45%);pointer-events:none;z-index:0}

/* ── Nav ── */
.ln{display:flex;align-items:center;justify-content:space-between;padding:16px 32px;border-bottom:1px solid var(--b1);background:var(--glass);backdrop-filter:var(--glass-b);-webkit-backdrop-filter:var(--glass-b);position:sticky;top:0;z-index:100}
.ln-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit}
.ln-mark{width:36px;height:36px;background:var(--acc-g);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;color:#fff;font-family:'Space Mono',monospace;box-shadow:0 0 24px rgba(255,107,53,.3)}
.ln-name{font-size:20px;font-weight:800;letter-spacing:-.5px}
.ln-name em{font-style:normal;background:var(--acc-g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ln-links{display:flex;align-items:center;gap:8px}
.ln-link{color:var(--t2);text-decoration:none;font-size:14px;font-weight:500;padding:8px 14px;border-radius:var(--r);transition:color .2s}
.ln-link:hover{color:var(--t1)}
.ln-cta{background:var(--acc-g);color:#fff;font-size:13px;font-weight:700;padding:9px 20px;border-radius:var(--r);border:none;cursor:pointer;font-family:inherit;text-decoration:none;box-shadow:0 2px 12px rgba(255,107,53,.3);transition:all .2s;display:inline-flex;align-items:center;gap:6px}
.ln-cta:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(255,107,53,.4)}
@media(max-width:680px){.ln{padding:14px 18px}.ln-links .ln-link{display:none}}

/* ── Hero ── */
.lh{position:relative;z-index:1;text-align:center;padding:80px 24px 60px;max-width:820px;margin:0 auto}
@media(max-width:680px){.lh{padding:48px 18px 40px}}
.lh-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:var(--card);border:1px solid var(--b2);border-radius:100px;font-size:13px;color:var(--t2);margin-bottom:28px}
.lh-badge-dot{width:7px;height:7px;border-radius:50%;background:var(--green);animation:dotPulse 2s infinite}
@keyframes dotPulse{0%,100%{opacity:1}50%{opacity:.3}}
.lh h1{font-size:clamp(32px,5.5vw,54px);font-weight:800;letter-spacing:-1.5px;line-height:1.12;margin-bottom:18px}
.lh h1 em{font-style:normal;background:var(--acc-g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.lh-sub{font-size:clamp(15px,2vw,18px);color:var(--t2);line-height:1.7;max-width:580px;margin:0 auto 36px}
.lh-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:48px}
.lh-btn-p{background:var(--acc-g);color:#fff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:var(--r);border:none;cursor:pointer;font-family:inherit;text-decoration:none;box-shadow:0 4px 20px rgba(255,107,53,.35);transition:all .25s;display:inline-flex;align-items:center;gap:8px}
.lh-btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(255,107,53,.45)}
.lh-btn-s{background:var(--card);color:var(--t2);font-size:15px;font-weight:600;padding:14px 32px;border-radius:var(--r);border:1px solid var(--b2);cursor:pointer;font-family:inherit;text-decoration:none;transition:all .25s;display:inline-flex;align-items:center;gap:8px}
.lh-btn-s:hover{color:var(--t1);border-color:var(--b3);transform:translateY(-1px)}

/* ── Demo visual ── */
.lh-demo{max-width:720px;margin:0 auto;background:var(--card);border:1px solid var(--b1);border-radius:var(--r3);overflow:hidden;box-shadow:0 8px 48px rgba(0,0,0,.5);position:relative}
.lh-demo-bar{display:flex;align-items:center;gap:6px;padding:12px 16px;border-bottom:1px solid var(--b1)}
.lh-demo-dot{width:10px;height:10px;border-radius:50%}
.lh-demo-content{padding:28px 32px;display:flex;gap:20px;align-items:flex-start}
@media(max-width:680px){.lh-demo-content{flex-direction:column;padding:20px 18px}}
.lh-demo-left{flex:1}
.lh-demo-prompt{background:var(--elev);border:1px solid var(--b2);border-radius:var(--r);padding:14px 16px;font-size:13px;color:var(--t2);line-height:1.6;margin-bottom:16px}
.lh-demo-prompt strong{color:var(--t1);font-weight:600}
.lh-demo-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}
.lh-demo-tag{padding:5px 12px;border-radius:6px;font-size:11px;font-weight:600;border:1px solid}
.lh-demo-gen{font-size:13px;color:var(--green);font-weight:600;display:flex;align-items:center;gap:6px}
.lh-demo-right{width:200px;flex-shrink:0;background:#000;border-radius:var(--r);aspect-ratio:9/16;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
@media(max-width:680px){.lh-demo-right{width:100%;max-width:200px;margin:0 auto}}
.lh-demo-play{width:48px;height:48px;border-radius:50%;background:rgba(255,107,53,.85);border:none;display:flex;align-items:center;justify-content:center;box-shadow:0 0 24px rgba(255,107,53,.3)}
.lh-demo-bars{position:absolute;bottom:0;left:0;right:0;padding:10px;display:flex;gap:3px;align-items:flex-end}
.lh-demo-bar-item{flex:1;border-radius:2px;background:var(--acc);opacity:.6}

/* ── Stats bar ── */
.ls{display:flex;justify-content:center;gap:48px;padding:40px 24px;border-top:1px solid var(--b1);border-bottom:1px solid var(--b1);position:relative;z-index:1;flex-wrap:wrap}
@media(max-width:680px){.ls{gap:24px;padding:28px 18px}}
.ls-item{text-align:center}
.ls-num{font-size:28px;font-weight:800;font-family:'Space Mono',monospace;letter-spacing:-1px;margin-bottom:2px}
.ls-num.acc{color:var(--acc)}
.ls-num.vio{color:var(--violet)}
.ls-num.grn{color:var(--green)}
.ls-label{font-size:12px;color:var(--t3);text-transform:uppercase;letter-spacing:.4px;font-weight:500}

/* ── Section ── */
.lsec{position:relative;z-index:1;padding:72px 24px;max-width:1100px;margin:0 auto}
@media(max-width:680px){.lsec{padding:48px 18px}}
.lsec-hdr{text-align:center;margin-bottom:44px}
.lsec-tag{display:inline-block;font-size:12px;font-weight:700;color:var(--acc);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}
.lsec-title{font-size:clamp(24px,3.5vw,32px);font-weight:800;letter-spacing:-.5px;margin-bottom:10px}
.lsec-title em{font-style:normal;background:var(--acc-g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.lsec-sub{color:var(--t2);font-size:15px;max-width:520px;margin:0 auto;line-height:1.6}

/* ── How it works ── */
.lw-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
@media(max-width:760px){.lw-grid{grid-template-columns:1fr;max-width:420px;margin:0 auto}}
.lw-card{background:var(--card);border:1px solid var(--b1);border-radius:var(--r2);padding:28px 24px;text-align:center;transition:all .3s;position:relative}
.lw-card:hover{border-color:var(--b3);transform:translateY(-3px);box-shadow:var(--shadow)}
.lw-num{font-size:40px;font-weight:800;font-family:'Space Mono',monospace;color:var(--acc);opacity:.18;position:absolute;top:12px;right:18px;line-height:1}
.lw-icon{font-size:32px;margin-bottom:14px}
.lw-name{font-size:16px;font-weight:700;margin-bottom:8px}
.lw-desc{font-size:13px;color:var(--t2);line-height:1.6}

/* ── Formats ── */
.lf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:14px}
@media(max-width:680px){.lf-grid{grid-template-columns:1fr}}
.lf-card{background:var(--card);border:1px solid var(--b1);border-radius:var(--r2);padding:22px;transition:all .3s;position:relative;overflow:hidden;cursor:default}
.lf-card:hover{border-color:var(--b3);transform:translateY(-2px);box-shadow:var(--shadow)}
.lf-bar{position:absolute;top:0;left:0;right:0;height:3px;border-radius:14px 14px 0 0}
.lf-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px}
.lf-icon{width:44px;height:44px;border-radius:var(--r);display:flex;align-items:center;justify-content:center;font-size:22px}
.lf-tag{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;padding:4px 8px;border-radius:6px}
.lf-name{font-size:17px;font-weight:700;margin-bottom:5px}
.lf-desc{color:var(--t2);font-size:12.5px;line-height:1.5;margin-bottom:10px}
.lf-ex{font-size:11px;color:var(--t3);display:flex;align-items:center;gap:5px}
.lf-ex span{color:var(--t2);font-style:italic}

/* ── Features ── */
.lfeat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
@media(max-width:680px){.lfeat-grid{grid-template-columns:1fr}}
.lfeat{background:var(--card);border:1px solid var(--b1);border-radius:var(--r2);padding:24px;transition:all .3s}
.lfeat:hover{border-color:var(--b3);transform:translateY(-2px);box-shadow:var(--shadow)}
.lfeat-icon{font-size:24px;margin-bottom:12px}
.lfeat-name{font-size:15px;font-weight:700;margin-bottom:6px}
.lfeat-desc{font-size:13px;color:var(--t2);line-height:1.6}

/* ── Pricing teaser ── */
.lprice{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;max-width:960px;margin:0 auto}
@media(max-width:680px){.lprice{grid-template-columns:1fr 1fr}}
@media(max-width:480px){.lprice{grid-template-columns:1fr}}
.lprice-card{background:var(--card);border:1px solid var(--b1);border-radius:var(--r2);padding:24px;text-align:center;transition:all .3s;position:relative}
.lprice-card:hover{border-color:var(--b3);transform:translateY(-2px);box-shadow:var(--shadow)}
.lprice-card.pop{border-color:rgba(255,107,53,.35);box-shadow:0 0 0 1px rgba(255,107,53,.15),var(--glow)}
.lprice-card.pop::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--acc-g);border-radius:14px 14px 0 0}
.lprice-badge{display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;padding:4px 10px;border-radius:6px;background:rgba(255,107,53,.12);color:var(--acc);margin-bottom:8px}
.lprice-name{font-size:16px;font-weight:700;margin-bottom:8px}
.lprice-amt{font-size:28px;font-weight:800;font-family:'Space Mono',monospace;letter-spacing:-1px}
.lprice-per{font-size:12px;color:var(--t3);margin-bottom:4px}
.lprice-credits{font-size:12px;color:var(--acc);font-weight:600;font-family:'Space Mono',monospace;margin-bottom:16px}
.lprice-btn{width:100%;padding:10px;border-radius:var(--r);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;border:none;transition:all .25s;text-decoration:none;display:inline-block;text-align:center}
.lprice-btn.primary{background:var(--acc-g);color:#fff;box-shadow:0 2px 12px rgba(255,107,53,.3)}
.lprice-btn.primary:hover{transform:translateY(-1px)}
.lprice-btn.secondary{background:var(--elev);color:var(--t2);border:1px solid var(--b2)}
.lprice-btn.secondary:hover{color:var(--t1);border-color:var(--b3)}

/* ── Final CTA ── */
.lcta{position:relative;z-index:1;text-align:center;padding:72px 24px 80px;max-width:640px;margin:0 auto}
.lcta-title{font-size:clamp(24px,4vw,36px);font-weight:800;letter-spacing:-.5px;margin-bottom:12px}
.lcta-title em{font-style:normal;background:var(--acc-g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.lcta-sub{color:var(--t2);font-size:15px;line-height:1.7;margin-bottom:32px}
.lcta-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

/* ── Footer ── */
.lft{border-top:1px solid var(--b1);padding:28px 32px;display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1;flex-wrap:wrap;gap:12px}
@media(max-width:680px){.lft{flex-direction:column;text-align:center;padding:24px 18px}}
.lft-copy{font-size:12px;color:var(--t3)}
.lft-links{display:flex;gap:16px}
.lft-link{font-size:12px;color:var(--t3);text-decoration:none;transition:color .2s}
.lft-link:hover{color:var(--t2)}

/* ── Animations ── */
.fade-up{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease}
.fade-up.visible{opacity:1;transform:translateY(0)}
`;

const FORMATS = [
  { name: "Reddit Story", tag: "Most Popular", desc: "Viral Reddit stories with gameplay background, voiceover narration, and animated captions.", icon: "💬", accent: "#FF4500", gradient: "linear-gradient(135deg,#FF4500,#FF6B35,#FFB088)", example: "Subway Surfers + AITA narration" },
  { name: "VOX Explainer", tag: "Trending", desc: "Data-driven explainer videos with maps, charts, motion graphics, and authoritative narration.", icon: "📊", accent: "#E5AC00", gradient: "linear-gradient(135deg,#F0B800,#FFD23F,#FFF0B3)", example: "Why cities are removing highways" },
  { name: "Stickman Animation", tag: "Fun", desc: "Whiteboard-style stick figure animations that explain topics, tell jokes, or narrate stories.", icon: "🏃", accent: "#10B981", gradient: "linear-gradient(135deg,#10B981,#34D399,#A7F3D0)", example: "What if Earth stopped spinning" },
  { name: "Cinematic Documentary", tag: "Premium", desc: "Dramatic AI-generated visuals with cinematic narration, music, and Ken Burns-style camera work.", icon: "🎬", accent: "#7B61FF", gradient: "linear-gradient(135deg,#5B3FD9,#7B61FF,#C4B5FD)", example: "The lost city of Atlantis" },
  { name: "AI News Broadcast", tag: "New", desc: "Synthetic news anchor presents your topic with B-roll footage, lower thirds, and breaking-news graphics.", icon: "📺", accent: "#EF4444", gradient: "linear-gradient(135deg,#DC2626,#EF4444,#FCA5A5)", example: "Tech company launches new AI chip" },
  { name: "Podcast Highlights", tag: "Creator", desc: "Split-screen talking heads with animated captions, perfect for short-form clips.", icon: "🎙️", accent: "#F97316", gradient: "linear-gradient(135deg,#EA580C,#F97316,#FDBA74)", example: "Joe Rogan-style debate clip" },
];

const FEATURES = [
  { icon: "⚡", name: "Ready in minutes", desc: "Full videos generated in 1–3 minutes. Script, voiceover, visuals, and editing — all automatic." },
  { icon: "🎙️", name: "Natural voiceovers", desc: "ElevenLabs voices that sound like real narrators. Pick from deep, casual, dramatic, and more." },
  { icon: "🎨", name: "AI-generated visuals", desc: "Every scene gets unique images created by Flux, matched to your script and visual style." },
  { icon: "📐", name: "Any aspect ratio", desc: "9:16 for Reels and TikTok, 16:9 for YouTube, 1:1 for Instagram. One click to switch." },
  { icon: "💬", name: "Auto captions", desc: "Animated subtitles synced to the voiceover, styled to match the format you chose." },
  { icon: "🎵", name: "Background music", desc: "Royalty-free music auto-selected to match the mood and pacing of your video." },
  { icon: "📦", name: "Bulk generation", desc: "Queue up multiple videos at once. Let ClipForge work while you focus on publishing." },
  { icon: "🔗", name: "API access", desc: "Integrate video generation directly into your workflow with our REST API." },
];

const PLANS_TEASER = [
  { name: "Free", price: "₹0", per: "", credits: "3 credits", popular: false },
  { name: "Starter", price: "₹749", per: "/mo", credits: "15 credits/mo", popular: false },
  { name: "Creator", price: "₹1,599", per: "/mo", credits: "40 credits/mo", popular: true },
  { name: "Pro", price: "₹4,099", per: "/mo", credits: "120 credits/mo", popular: false },
];

// ─── Scroll animation hook ────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".fade-up");
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─── Animated waveform bars for the demo ──────────────────────
function WaveBars() {
  const heights = [12, 20, 8, 24, 14, 18, 10, 22, 16, 6, 20, 14];
  return (
    <div className="lh-demo-bars">
      {heights.map((h, i) => (
        <div
          key={i}
          className="lh-demo-bar-item"
          style={{
            height: h,
            animation: `barPulse ${0.8 + i * 0.1}s ease-in-out infinite alternate`,
          }}
        />
      ))}
      <style>{`@keyframes barPulse{from{opacity:.3;height:4px}to{opacity:.7}}`}</style>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────
export default function LandingPage() {
  useScrollReveal();

  return (
    <div className="lp">
      <style>{CSS}</style>

      {/* ── Navigation ── */}
      <nav className="ln">
        <a href="/" className="ln-logo">
          <div className="ln-mark">C</div>
          <div className="ln-name">
            Clip<em>Forge</em>
          </div>
        </a>
        <div className="ln-links">
          <a href="#formats" className="ln-link">Formats</a>
          <a href="#features" className="ln-link">Features</a>
          <a href="/pricing" className="ln-link">Pricing</a>
          <a href="/" className="ln-cta">Start free →</a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lh">
        <div className="lh-badge">
          <span className="lh-badge-dot" />
          Now generating videos with AI
        </div>

        <h1>
          Type a topic.
          <br />
          Get a <em>finished video</em>.
        </h1>

        <p className="lh-sub">
          ClipForge turns any idea into a publish-ready video — script, voiceover,
          visuals, captions, and music. Pick a format, describe your topic,
          and download in minutes.
        </p>

        <div className="lh-actions">
          <a href="/" className="lh-btn-p">
            Start generating — it's free
          </a>
          <a href="#how" className="lh-btn-s">
            See how it works
          </a>
        </div>

        {/* Demo mock */}
        <div className="lh-demo">
          <div className="lh-demo-bar">
            <div className="lh-demo-dot" style={{ background: "#EF4444" }} />
            <div className="lh-demo-dot" style={{ background: "#E5AC00" }} />
            <div className="lh-demo-dot" style={{ background: "#34D399" }} />
            <span style={{ fontSize: 12, color: "var(--t3)", marginLeft: 8 }}>
              ClipForge
            </span>
          </div>
          <div className="lh-demo-content">
            <div className="lh-demo-left">
              <div className="lh-demo-prompt">
                <strong>Topic:</strong> "Why do planes leave white trails in the sky?"
              </div>
              <div className="lh-demo-tags">
                <div
                  className="lh-demo-tag"
                  style={{ background: "rgba(123,97,255,.1)", borderColor: "rgba(123,97,255,.25)", color: "#7B61FF" }}
                >
                  🎬 Cinematic Doc
                </div>
                <div
                  className="lh-demo-tag"
                  style={{ background: "rgba(255,107,53,.1)", borderColor: "rgba(255,107,53,.25)", color: "#FF6B35" }}
                >
                  60s · 9:16
                </div>
                <div
                  className="lh-demo-tag"
                  style={{ background: "rgba(52,211,153,.1)", borderColor: "rgba(52,211,153,.25)", color: "#34D399" }}
                >
                  🎙️ Deep Cinematic
                </div>
              </div>
              <div className="lh-demo-gen">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#34D399" strokeWidth="2"/><path d="M5 8l2 2 4-4" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Video ready — 1m 42s
              </div>
            </div>
            <div className="lh-demo-right">
              <div className="lh-demo-play">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                  <polygon points="6,3 20,12 6,21" />
                </svg>
              </div>
              <WaveBars />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="ls fade-up">
        <div className="ls-item">
          <div className="ls-num acc">6</div>
          <div className="ls-label">Video formats</div>
        </div>
        <div className="ls-item">
          <div className="ls-num vio">~₹10</div>
          <div className="ls-label">Cost per video</div>
        </div>
        <div className="ls-item">
          <div className="ls-num grn">&lt;3 min</div>
          <div className="ls-label">Generation time</div>
        </div>
        <div className="ls-item">
          <div className="ls-num acc">0</div>
          <div className="ls-label">Editing required</div>
        </div>
      </div>

      {/* ── How it works ── */}
      <section className="lsec" id="how">
        <div className="lsec-hdr fade-up">
          <div className="lsec-tag">How it works</div>
          <h2 className="lsec-title">
            Three steps to a <em>finished video</em>
          </h2>
          <p className="lsec-sub">
            No editing software, no timeline, no exports. Describe what you want
            and ClipForge handles the rest.
          </p>
        </div>
        <div className="lw-grid fade-up">
          <div className="lw-card">
            <div className="lw-num">1</div>
            <div className="lw-icon">📝</div>
            <div className="lw-name">Describe your topic</div>
            <div className="lw-desc">
              Pick a format — Reddit Story, Documentary, Explainer, and more. Then type your topic or paste a script.
            </div>
          </div>
          <div className="lw-card">
            <div className="lw-num">2</div>
            <div className="lw-icon">🤖</div>
            <div className="lw-name">AI builds your video</div>
            <div className="lw-desc">
              Claude writes the script, ElevenLabs creates the voiceover, and Flux generates every visual. Automatic.
            </div>
          </div>
          <div className="lw-card">
            <div className="lw-num">3</div>
            <div className="lw-icon">🚀</div>
            <div className="lw-name">Download and publish</div>
            <div className="lw-desc">
              Your video is assembled with captions and music, rendered, and ready to post on any platform.
            </div>
          </div>
        </div>
      </section>

      {/* ── Formats ── */}
      <section className="lsec" id="formats">
        <div className="lsec-hdr fade-up">
          <div className="lsec-tag">Formats</div>
          <h2 className="lsec-title">
            Six templates, six <em>different styles</em>
          </h2>
          <p className="lsec-sub">
            Each format uses a distinct combination of visuals, narration,
            editing, and pacing. Pick the one that fits your niche.
          </p>
        </div>
        <div className="lf-grid fade-up">
          {FORMATS.map((f) => (
            <div className="lf-card" key={f.name}>
              <div className="lf-bar" style={{ background: f.gradient }} />
              <div className="lf-top">
                <div
                  className="lf-icon"
                  style={{ background: `${f.accent}15` }}
                >
                  {f.icon}
                </div>
                <div
                  className="lf-tag"
                  style={{
                    background: `${f.accent}12`,
                    color: f.accent,
                  }}
                >
                  {f.tag}
                </div>
              </div>
              <div className="lf-name">{f.name}</div>
              <div className="lf-desc">{f.desc}</div>
              <div className="lf-ex">
                💡 <span>{f.example}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lsec" id="features">
        <div className="lsec-hdr fade-up">
          <div className="lsec-tag">Features</div>
          <h2 className="lsec-title">
            Everything happens <em>automatically</em>
          </h2>
          <p className="lsec-sub">
            You bring the idea. ClipForge brings the script, voice, images,
            captions, music, and final render.
          </p>
        </div>
        <div className="lfeat-grid fade-up">
          {FEATURES.map((f) => (
            <div className="lfeat" key={f.name}>
              <div className="lfeat-icon">{f.icon}</div>
              <div className="lfeat-name">{f.name}</div>
              <div className="lfeat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing teaser ── */}
      <section className="lsec">
        <div className="lsec-hdr fade-up">
          <div className="lsec-tag">Pricing</div>
          <h2 className="lsec-title">
            Start free, scale <em>when ready</em>
          </h2>
          <p className="lsec-sub">
            3 free videos on signup. No credit card required. Upgrade or buy
            extra credits whenever you need more.
          </p>
        </div>
        <div className="lprice fade-up">
          {PLANS_TEASER.map((p) => (
            <div
              className={`lprice-card ${p.popular ? "pop" : ""}`}
              key={p.name}
            >
              {p.popular && <div className="lprice-badge">Most popular</div>}
              <div className="lprice-name">{p.name}</div>
              <div className="lprice-amt">
                {p.price}
                <span style={{ fontSize: 13, fontWeight: 400, color: "var(--t3)", fontFamily: "inherit" }}>
                  {p.per}
                </span>
              </div>
              <div className="lprice-credits">{p.credits}</div>
              <a
                href="/pricing"
                className={`lprice-btn ${p.popular ? "primary" : "secondary"}`}
              >
                {p.popular ? "Get started" : "See details"}
              </a>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a
            href="/pricing"
            style={{
              color: "var(--acc)",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            View all plans and credit packs →
          </a>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lcta">
        <h2 className="lcta-title fade-up">
          Your first video is <em>on us</em>
        </h2>
        <p className="lcta-sub fade-up">
          Sign up, pick a format, type a topic. Your video will be ready before
          you finish your coffee.
        </p>
        <div className="lcta-actions fade-up">
          <a href="/" className="lh-btn-p">
            Create your first video →
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lft">
        <div className="lft-copy">
          © 2026 ClipForge. All rights reserved.
        </div>
        <div className="lft-links">
          <a href="/pricing" className="lft-link">Pricing</a>
          <a href="#" className="lft-link">Terms</a>
          <a href="#" className="lft-link">Privacy</a>
          <a href="mailto:support@clipforge.ai" className="lft-link">Contact</a>
        </div>
      </footer>
    </div>
  );
}
