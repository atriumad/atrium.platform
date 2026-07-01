/* Atrium marketing site — content sections.
   Reads Icon from window (AtriumKit.jsx) and primitives from the DS namespace. */

const ATR_NS_S = "AtriumDesignSystem_31d170";

/* ---- Services · BENTO ----
   Asymmetric grid of service tiles. Each cell uses a different brand type
   treatment: Nimora wordmark, serif headings, wide caps, the amber marker
   highlight, big serif/grotesk stat figures, and the handwriting accent.
   Photo cells are drag-to-fill <image-slot>s (persist by id). */
const ATR_CAPS = { fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase" };
const ATR_SERIF_H = { fontFamily: "var(--font-serif)", fontWeight: 400, letterSpacing: "0", lineHeight: 1.04 };

function AtriumServices() {
  const { Eyebrow, Highlight, ScriptAccent } = window[ATR_NS_S];
  const Icon = window.Icon;
  return (
    <section id="services" style={{ background: "var(--cloud-200)" }}>
      <div style={{ maxWidth: "var(--container-wide)", margin: "0 auto", padding: "clamp(3.5rem,7vw,6rem) var(--gutter)" }}>
        <Eyebrow tone="amber">What we do</Eyebrow>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4.6vw,3.6rem)", fontWeight: 700, color: "var(--text-strong)", letterSpacing: "-0.01em", lineHeight: 1.04, margin: "16px 0 12px", maxWidth: "24ch" }}>
          Everything you need to grow — <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>under one roof.</span>
        </h2>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", lineHeight: 1.6, color: "var(--text-muted)", maxWidth: "46ch", margin: "0 0 40px" }}>
          Strategy, creative, and data — woven into one team. Drag your own photos into any tile.
        </p>

        <div className="atr-bento">

          {/* ① Graphic Design — feature */}
          <a href="#work" className="b-cell b-gd" style={{ background: "var(--teal-800)", padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "24px" }}>
            <div className="b-grain" />
            <div style={{ position: "relative", zIndex: 3, display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "26px", color: "var(--cloud-300)", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(181,242,219,0.25)", borderRadius: "12px", padding: "10px 18px", lineHeight: 1 }}>atrium</span>
              <span style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--mint-400)" }} />
              <span style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--amber-500)" }} />
              <span style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--cloud-300)" }} />
              <span style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--mint-400)", clipPath: "polygon(0 0,100% 0,0 100%)" }} />
              <span style={{ ...ATR_CAPS, color: "var(--mint-300)", marginLeft: "auto" }}>Identity · Packaging</span>
            </div>
            <div style={{ position: "relative", zIndex: 3 }}>
              <div style={{ ...ATR_CAPS, color: "var(--mint-300)", marginBottom: "12px" }}>Graphic Design</div>
              <h3 style={{ ...ATR_SERIF_H, fontSize: "clamp(2rem,3.2vw,2.9rem)", color: "var(--cloud-300)", margin: 0 }}>
                Brand systems, built with <span style={{ fontStyle: "italic", color: "var(--amber-400)" }}>craft.</span>
              </h3>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "15px", lineHeight: 1.6, color: "var(--teal-300)", margin: "14px 0 0", maxWidth: "44ch" }}>
                Visually compelling identity, packaging and design systems that stand out and carry your brand's whole visual narrative.
              </p>
            </div>
          </a>

          {/* ② Photography — tall photo */}
          <a href="#work" className="b-cell b-photo" style={{ background: "var(--teal-700)" }}>
            <image-slot id="atr-bento-photo" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} shape="rect" placeholder="Drop a brand / product photo"></image-slot>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(7,47,52,0) 45%,rgba(7,47,52,0.6))", zIndex: 2, pointerEvents: "none" }} />
            <div className="b-grain" style={{ zIndex: 3 }} />
            <div style={{ position: "absolute", left: "20px", right: "20px", bottom: "20px", zIndex: 4 }}>
              <div style={{ ...ATR_CAPS, color: "var(--mint-300)", marginBottom: "8px" }}>Stop the scroll</div>
              <div style={{ ...ATR_SERIF_H, fontSize: "2.1rem", color: "#fff" }}>Photography</div>
            </div>
          </a>

          {/* ③ Campaigns — amber */}
          <a href="#the-experience-era" className="b-cell b-camp" style={{ background: "var(--amber-500)", padding: "26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="b-grain" style={{ opacity: 0.15 }} />
            <div style={{ position: "relative", zIndex: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...ATR_CAPS, color: "var(--teal-800)" }}>Campaigns</span>
              <Icon name="arrow-up-right" size={20} color="var(--teal-800)" />
            </div>
            <h3 style={{ position: "relative", zIndex: 3, fontFamily: "var(--font-sans)", fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.0, color: "var(--teal-800)", margin: 0 }}>
              Big ideas that <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>travel.</span>
            </h3>
          </a>

          {/* ④ SEO — light, search mock */}
          <a href="#work" className="b-cell b-seo" style={{ background: "var(--cloud-100)", border: "1px solid rgba(7,47,52,0.08)", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", border: "1px solid rgba(7,47,52,0.1)", borderRadius: "999px", padding: "8px 14px" }}>
              <Icon name="search" size={15} color="var(--teal-500)" />
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "12.5px", color: "var(--text-muted)" }}>best near me</span>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: "2.6rem", letterSpacing: "-0.03em", color: "var(--teal-800)", lineHeight: 1 }}>#1</span>
                <span style={{ ...ATR_SERIF_H, fontStyle: "italic", fontSize: "1.3rem", color: "var(--teal-700)" }}>Found first.</span>
              </div>
              <div style={{ ...ATR_CAPS, color: "var(--text-muted)", marginTop: "8px" }}>SEO that compounds</div>
            </div>
          </a>

          {/* ⑤ Video — dark photo */}
          <a href="#work" className="b-cell b-video" style={{ background: "var(--teal-800)" }}>
            <image-slot id="atr-bento-video" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} shape="rect" placeholder="Drop a video still"></image-slot>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(7,47,52,0.25),rgba(7,47,52,0.75))", zIndex: 2, pointerEvents: "none" }} />
            <div className="b-grain" style={{ zIndex: 3 }} />
            <span style={{ position: "absolute", top: "18px", right: "18px", zIndex: 4, width: "42px", height: "42px", borderRadius: "50%", background: "var(--mint-400)", color: "var(--teal-800)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="play" size={18} />
            </span>
            <div style={{ position: "absolute", left: "20px", right: "20px", bottom: "20px", zIndex: 4 }}>
              <div style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em", color: "var(--cloud-300)" }}>Video</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--teal-300)", marginTop: "4px" }}>Script, shoot, edit, animate.</div>
            </div>
          </a>

          {/* ⑥ Marketing — mint stat */}
          <a href="#work" className="b-cell b-mkt" style={{ background: "var(--mint-400)", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <span style={{ ...ATR_CAPS, color: "var(--teal-700)" }}>Marketing</span>
            <div>
              <div style={{ ...ATR_SERIF_H, fontStyle: "italic", fontSize: "clamp(3rem,6vw,4.4rem)", color: "var(--teal-800)" }}>2.7×</div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", lineHeight: 1.45, color: "var(--teal-700)", margin: "8px 0 0", maxWidth: "22ch" }}>
                more covers booked in a partner's first 90 days.
              </p>
            </div>
          </a>

          {/* ⑦ Social — wide */}
          <a href="#work" className="b-cell b-social" style={{ background: "var(--teal-700)", padding: "26px", display: "flex", alignItems: "center", gap: "26px" }}>
            <div className="b-grain" />
            <div style={{ position: "relative", zIndex: 3, flex: 1 }}>
              <div style={{ ...ATR_CAPS, color: "var(--mint-300)", marginBottom: "10px" }}>Organic + Paid Social</div>
              <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(1.5rem,2.6vw,2rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.02, color: "var(--cloud-300)", margin: 0 }}>
                Content that stops the <ScriptAccent color="var(--amber-400)">scroll.</ScriptAccent>
              </h3>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", lineHeight: 1.55, color: "var(--teal-300)", margin: "12px 0 0", maxWidth: "40ch" }}>
                From high-impact static posts to an educational video series — every size and format the algorithm wants.
              </p>
            </div>
            <div style={{ position: "relative", zIndex: 3, display: "flex", gap: "12px", flexShrink: 0 }}>
              <image-slot id="atr-bento-social-1" style={{ width: "118px", height: "158px", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(181,242,219,0.2)" }} shape="rounded" radius="14" placeholder="post"></image-slot>
              <image-slot id="atr-bento-social-2" style={{ width: "118px", height: "158px", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(181,242,219,0.2)" }} shape="rounded" radius="14" placeholder="reel"></image-slot>
            </div>
          </a>

        </div>
      </div>
    </section>
  );
}

/* ---- The Experience Era marquee ---- */
function AtriumMarquee() {
  const phrase = "THE EXPERIENCE ERA";
  const row = Array.from({ length: 6 });
  return (
    <section id="the-experience-era" style={{ background: "var(--amber-500)", padding: "clamp(2rem,4vw,3.2rem) 0", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: "0", whiteSpace: "nowrap", animation: "atr-marquee 28s linear infinite" }}>
        {[0, 1].map((k) => (
          <div key={k} style={{ display: "flex", gap: "48px", paddingRight: "48px" }}>
            {row.map((_, i) => (
              <span key={i} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(1.8rem,4vw,3.2rem)", color: "var(--teal-800)", letterSpacing: "0.02em", display: "inline-flex", alignItems: "center", gap: "48px" }}>
                {phrase}<span style={{ fontSize: "0.7em" }}>✳</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---- Work gallery with chip filter ---- */
const ATR_WORK = [
  { t: "Meridian Coffee", cat: "Graphic Design", tone: "teal", year: "2026" },
  { t: "Northwind Outdoor", cat: "Photography", tone: "mint", year: "2025" },
  { t: "Loop Fitness", cat: "Marketing", tone: "amber", year: "2026" },
  { t: "Verdant Skincare", cat: "Graphic Design", tone: "mintdark", year: "2025" },
  { t: "Atlas Logistics", cat: "Seo", tone: "teal", year: "2026" },
  { t: "Bloom Florals", cat: "Photography", tone: "cloud", year: "2025" },
];
function AtriumWork({ filter, setFilter }) {
  const { Chip, Badge, Eyebrow } = window[ATR_NS_S];
  const Icon = window.Icon;
  const cats = ["All", "Seo", "Marketing", "Graphic Design", "Photography"];
  const tiles = {
    teal: { background: "var(--teal-800)", color: "var(--mint-400)" },
    mint: { background: "var(--mint-400)", color: "var(--teal-800)" },
    mintdark: { background: "var(--mint-500)", color: "var(--teal-800)" },
    amber: { background: "var(--amber-500)", color: "var(--teal-800)" },
    cloud: { background: "var(--cloud-300)", color: "var(--teal-800)" },
  };
  const shown = ATR_WORK.filter((w) => filter === "All" || w.cat === filter);
  return (
    <section id="work" style={{ background: "var(--cloud-100)" }}>
      <div style={{ maxWidth: "var(--container-wide)", margin: "0 auto", padding: "clamp(3.5rem,7vw,6rem) var(--gutter)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px", marginBottom: "32px" }}>
          <div>
            <Eyebrow tone="amber">Selected work</Eyebrow>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4.5vw,3.4rem)", fontWeight: 700, color: "var(--text-strong)", letterSpacing: "-0.01em", margin: "16px 0 0" }}>
              Brands we've helped grow
            </h2>
          </div>
          <div style={{ display: "flex", gap: "9px", flexWrap: "wrap" }}>
            {cats.map((c) => (
              <Chip key={c} variant="outline" selected={filter === c} onClick={() => setFilter(c)} size="sm">{c}</Chip>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "18px" }}>
          {shown.map((w) => (
            <a key={w.t} href="#" style={{ textDecoration: "none", display: "block" }}>
              <div style={{ position: "relative", aspectRatio: "4/3", borderRadius: "var(--radius-md)", overflow: "hidden", ...tiles[w.tone], display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span aria-hidden="true" style={{
                  width: "44%", height: "44%", background: "currentColor", opacity: 0.16,
                  WebkitMask: "url(../../assets/logos/atrium-mark.svg) center/contain no-repeat",
                  mask: "url(../../assets/logos/atrium-mark.svg) center/contain no-repeat",
                }} />
                <span style={{ position: "absolute", top: "12px", left: "12px" }}><Badge tone="cloud">{w.year}</Badge></span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", gap: "10px" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "var(--text-strong)" }}>{w.t}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--text-muted)" }}>{w.cat}</div>
                </div>
                <Icon name="arrow-up-right" size={20} color="var(--teal-500)" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- Contact ---- */
function AtriumContact({ state, onSubmit, onField }) {
  const { Button, Input, Chip, ScriptAccent } = window[ATR_NS_S];
  const Icon = window.Icon;
  const interests = ["Seo", "Marketing", "Graphic Design", "Photography"];
  if (state.sent) {
    return (
      <section id="contact" style={{ background: "var(--teal-800)" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "clamp(4rem,8vw,7rem) var(--gutter)", textAlign: "center" }}>
          <span style={{ width: "64px", height: "64px", borderRadius: "999px", background: "var(--mint-400)", color: "var(--teal-800)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
            <Icon name="check" size={32} />
          </span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 700, color: "var(--cloud-300)", margin: 0 }}>
            You've found <ScriptAccent color="var(--mint-400)">your people.</ScriptAccent>
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", color: "var(--teal-300)", fontSize: "1.05rem", marginTop: "16px" }}>
            Thanks, {state.name || "friend"}. We'll be in touch within one business day.
          </p>
        </div>
      </section>
    );
  }
  return (
    <section id="contact" style={{ background: "var(--teal-800)" }}>
      <div style={{ maxWidth: "var(--container-wide)", margin: "0 auto", padding: "clamp(3.5rem,7vw,6rem) var(--gutter)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }} className="atr-contact-grid">
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem,5vw,3.6rem)", fontWeight: 700, color: "var(--cloud-300)", letterSpacing: "-0.01em", lineHeight: 1.05, margin: 0 }}>
            Need help <ScriptAccent color="var(--amber-400)">yesterday?</ScriptAccent>
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", color: "var(--teal-300)", fontSize: "1.05rem", lineHeight: 1.6, marginTop: "20px", maxWidth: "38ch" }}>
            Tell us what you're building. We'll bring the strategy, the creative and the software to make it move.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "28px", color: "var(--mint-400)", fontFamily: "var(--font-sans)", fontWeight: 500 }}>
            <Icon name="mail" size={20} /> hello@atrium.studio
          </div>
        </div>
        <div style={{ background: "var(--cloud-100)", borderRadius: "var(--radius-lg)", padding: "clamp(22px,3vw,34px)" }}>
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input label="Name" placeholder="Jane Maker" value={state.name} onChange={(e) => onField("name", e.target.value)} required />
            <Input label="Work email" type="email" placeholder="jane@brand.com" value={state.email} onChange={(e) => onField("email", e.target.value)} required />
            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 600, color: "var(--text-strong)", marginBottom: "9px" }}>I'm interested in</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {interests.map((i) => (
                  <Chip key={i} variant="outline" size="sm" selected={state.interest === i} onClick={() => onField("interest", i)}>{i}</Chip>
                ))}
              </div>
            </div>
            <Button variant="amber" size="lg" type="submit" fullWidth iconRight={<Icon name="arrow-right" size={18} />}>Send it our way</Button>
          </form>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { AtriumServices, AtriumMarquee, AtriumWork, AtriumContact });
