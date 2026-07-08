/* Atrium marketing site — chrome + hero + footer.
   Loaded as a Babel script; exports to window for the other kit files.
   Reads design-system primitives from window.AtriumDesignSystem_31d170. */

const ATR_NS = "AtriumDesignSystem_31d170";
const LOGO_BASE = "../../assets/logos";

/* ---- Lucide icon (real icon set via CDN) ---- */
function Icon({ name, size = 20, stroke = 1.75, color = "currentColor", style = {} }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const host = ref.current;
    if (!host || !window.lucide) return;
    host.innerHTML = "";
    const i = document.createElement("i");
    i.setAttribute("data-lucide", name);
    host.appendChild(i);
    window.lucide.createIcons({ attrs: { width: size, height: size, "stroke-width": stroke } });
  }, [name, size, stroke]);
  return <span ref={ref} style={{ display: "inline-flex", color, ...style }} />;
}

/* ---- Header ---- */
function AtriumHeader({ onNav }) {
  const { Button, Logo } = window[ATR_NS];
  const [open, setOpen] = React.useState(false);
  const links = ["Services", "Work", "The Experience Era", "Contact"];
  const anchor = (l) => "#" + l.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "");
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(244,248,248,0.86)", backdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--cloud-400)",
    }}>
      <div style={{
        maxWidth: "var(--container-wide)", margin: "0 auto",
        padding: "16px var(--gutter)", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="#top" onClick={(e) => { e.preventDefault(); onNav && onNav("top"); }} style={{ display: "inline-flex" }}>
          <Logo variant="lockup" color="var(--teal-800)" height={28} assetBase={LOGO_BASE} />
        </a>
        <nav style={{ display: "flex", gap: "30px", alignItems: "center" }} className="atr-desktop-nav">
          {links.map((l) => (
            <a key={l} href={anchor(l)} style={{
              fontFamily: "var(--font-sans)", fontSize: "15px", fontWeight: 500,
              color: "var(--text-strong)", textDecoration: "none", letterSpacing: "0.01em",
            }}>{l}</a>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Button variant="primary" size="sm" as="a" href="#contact"
            iconRight={<Icon name="arrow-right" size={16} />}>Start a project</Button>
          <button onClick={() => setOpen((v) => !v)} aria-label="Menu" className="atr-burger" style={{
            display: "none", background: "none", border: "none", cursor: "pointer", color: "var(--teal-800)",
          }}><Icon name={open ? "x" : "menu"} size={24} /></button>
        </div>
      </div>
      {open && (
        <div style={{ borderTop: "1px solid var(--cloud-400)", padding: "12px var(--gutter)", display: "flex", flexDirection: "column", gap: "4px" }}>
          {links.map((l) => (
            <a key={l} href={anchor(l)} onClick={() => setOpen(false)} style={{
              fontFamily: "var(--font-sans)", fontSize: "16px", fontWeight: 500, color: "var(--text-strong)",
              textDecoration: "none", padding: "10px 0",
            }}>{l}</a>
          ))}
        </div>
      )}
    </header>
  );
}

/* ---- Hero ---- */
function AtriumHero() {
  const { Button, Chip, ScriptAccent, Highlight, Eyebrow } = window[ATR_NS];
  const services = ["Seo", "Marketing", "Graphic Design", "Photography"];
  return (
    <section id="top" style={{ position: "relative", background: "var(--teal-800)", overflow: "hidden" }}>
      {/* α watermark */}
      <span aria-hidden="true" style={{
        position: "absolute", right: "-4%", bottom: "-18%", width: "min(46vw, 620px)", height: "min(46vw, 620px)",
        background: "var(--teal-700)",
        WebkitMask: `url(${(window.__resources&&window.__resources.atriumMark)||(LOGO_BASE+"/atrium-mark.svg")}) center/contain no-repeat`,
        mask: `url(${(window.__resources&&window.__resources.atriumMark)||(LOGO_BASE+"/atrium-mark.svg")}) center/contain no-repeat`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "relative", maxWidth: "var(--container-wide)", margin: "0 auto",
        padding: "clamp(3.5rem, 8vw, 7rem) var(--gutter) clamp(3rem, 6vw, 5rem)",
      }}>
        <Eyebrow tone="amber" style={{ marginBottom: "22px" }}>Kansas City · Creative &amp; Marketing Studio</Eyebrow>
        <h1 style={{
          fontFamily: "var(--font-display)", color: "var(--cloud-300)", margin: 0,
          fontSize: "clamp(2.6rem, 6.4vw, 5.4rem)", lineHeight: 1.04, fontWeight: 700, letterSpacing: "-0.01em",
          maxWidth: "16ch",
        }}>
          We're <ScriptAccent color="var(--mint-400)">humans.</ScriptAccent> Marketing experts &amp; simple software for{" "}
          <Highlight color="amber">better Business.</Highlight>
        </h1>
        <p style={{
          fontFamily: "var(--font-sans)", color: "var(--teal-300)", fontSize: "clamp(1rem,1.6vw,1.25rem)",
          lineHeight: 1.6, maxWidth: "44ch", margin: "26px 0 0",
        }}>
          Congratulations — you've found your people. We don't just create ads; we build growth engines for tens of
          thousands of brands.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", margin: "32px 0 36px" }}>
          <Button variant="mint" size="lg" as="a" href="#contact"
            iconRight={<Icon name="arrow-right" size={18} />}>Start a project</Button>
          <Button variant="outline" size="lg" as="a" href="#work" style={{ color: "var(--mint-400)", borderColor: "var(--teal-500)" }}>
            See our work
          </Button>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {services.map((s) => <Chip key={s} variant="outline-light">{s}</Chip>)}
        </div>
      </div>
    </section>
  );
}

/* ---- Footer ---- */
function AtriumFooter() {
  const { Logo } = window[ATR_NS];
  const cols = [
    { h: "Studio", items: ["About", "The Experience Era", "Careers", "Contact"] },
    { h: "Services", items: ["SEO", "Marketing", "Graphic Design", "Photography"] },
    { h: "Connect", items: ["Instagram", "LinkedIn", "Dribbble", "hello@atrium.studio"] },
  ];
  return (
    <footer style={{ background: "var(--teal-900)", color: "var(--text-on-dark)" }}>
      <div style={{
        maxWidth: "var(--container-wide)", margin: "0 auto", padding: "clamp(2.5rem,5vw,4rem) var(--gutter)",
        display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: "32px",
      }} className="atr-footer-grid">
        <div>
          <Logo variant="lockup" color="var(--mint-400)" height={26} assetBase={LOGO_BASE} />
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "var(--teal-300)", lineHeight: 1.6, marginTop: "16px", maxWidth: "30ch" }}>
            The team you call when you need help yesterday. Kansas City, everywhere.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--mint-400)", marginBottom: "14px" }}>{c.h}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              {c.items.map((i) => (
                <a key={i} href="#" style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "var(--teal-300)", textDecoration: "none" }}>{i}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--teal-700)", padding: "18px var(--gutter)", maxWidth: "var(--container-wide)", margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--teal-500)" }}>© 2026 Atrium Studio. We're humans.</span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--teal-500)" }}>Privacy · Terms</span>
      </div>
    </footer>
  );
}

Object.assign(window, { Icon, AtriumHeader, AtriumHero, AtriumFooter });
