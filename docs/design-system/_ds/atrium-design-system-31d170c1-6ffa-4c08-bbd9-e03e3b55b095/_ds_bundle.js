/* @ds-bundle: {"format":3,"namespace":"AtriumDesignSystem_31d170","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"Eyebrow","sourcePath":"components/core/Eyebrow.jsx"},{"name":"Highlight","sourcePath":"components/core/Highlight.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"ScriptAccent","sourcePath":"components/core/ScriptAccent.jsx"}],"sourceHashes":{"assets/social/image-slot.js":"9309434cb09c","components/core/Badge.jsx":"0c91976386ea","components/core/Button.jsx":"0741dc2b8e83","components/core/Card.jsx":"188d9e5984f5","components/core/Chip.jsx":"c577f66be61b","components/core/Eyebrow.jsx":"cadaa4eb37b4","components/core/Highlight.jsx":"8f38985d78d0","components/core/Input.jsx":"3fe1550101fa","components/core/Logo.jsx":"aeb8b086e789","components/core/ScriptAccent.jsx":"440ace3af2dc","ui_kits/atrium-site/AtriumKit.jsx":"0809111ad679","ui_kits/atrium-site/AtriumSections.jsx":"76ce3a3fbd32"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AtriumDesignSystem_31d170 = window.AtriumDesignSystem_31d170 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// assets/social/image-slot.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
/* BEGIN USAGE */
/**
 * <image-slot> — user-fillable image placeholder.
 *
 * Drop this into a deck, mockup, or page wherever you want the user to
 * supply an image. You control the slot's shape and size; the user fills it
 * by dragging an image file onto it (or clicking to browse). The dropped
 * image persists across reloads via a .image-slots.state.json sidecar —
 * same read-via-fetch / write-via-window.omelette pattern as
 * design_canvas.jsx, so the filled slot shows on share links, downloaded
 * zips, and PPTX export. Outside the omelette runtime the slot is read-only.
 *
 * The host bridge only allows sidecar writes at the project root, so the
 * HTML that uses this component is assumed to live at the project root too
 * (same constraint as design_canvas.jsx).
 *
 * Attributes:
 *   id           Persistence key. REQUIRED for the drop to survive reload —
 *                every slot on the page needs a distinct id.
 *   shape        'rect' | 'rounded' | 'circle' | 'pill'   (default 'rounded')
 *                'circle' applies 50% border-radius; on a non-square slot
 *                that's an ellipse — set equal width and height for a true
 *                circle.
 *   radius       Corner radius in px for 'rounded'.       (default 12)
 *   mask         Any CSS clip-path value. Overrides `shape` — use this for
 *                hexagons, blobs, arbitrary polygons.
 *   fit          object-fit: cover | contain | fill.       (default 'cover')
 *                With cover (the default) double-clicking the filled slot
 *                enters a reframe mode: the whole image spills past the mask
 *                (translucent outside, opaque inside), drag to reposition,
 *                corner-drag to scale. The crop persists alongside the image
 *                in the sidecar. contain/fill stay static.
 *   position     object-position for fit=contain|fill.     (default '50% 50%')
 *   placeholder  Empty-state caption.                      (default 'Drop an image')
 *   src          Optional initial/fallback image URL. A user drop overrides
 *                it; clearing the drop reveals src again.
 *
 * Size and layout come from ordinary CSS on the element — width/height
 * inline or from a parent grid — so it composes with any layout.
 *
 * Usage:
 *   <image-slot id="hero"   style="width:800px;height:450px" shape="rounded" radius="20"
 *               placeholder="Drop a hero image"></image-slot>
 *   <image-slot id="avatar" style="width:120px;height:120px" shape="circle"></image-slot>
 *   <image-slot id="kite"   style="width:300px;height:300px"
 *               mask="polygon(50% 0, 100% 50%, 50% 100%, 0 50%)"></image-slot>
 */
/* END USAGE */

(() => {
  const STATE_FILE = '.image-slots.state.json';
  // 2× a ~600px slot in a 1920-wide deck — retina-sharp without making the
  // sidecar enormous. A 1200px WebP at q=0.85 is ~150-300KB.
  const MAX_DIM = 1200;
  // Raster formats only. SVG is excluded (can carry script; createImageBitmap
  // on SVG blobs is inconsistent). GIF is excluded because the canvas
  // re-encode keeps only the first frame, so an animated GIF would silently
  // go still — better to reject than surprise.
  const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

  // ── Shared sidecar store ────────────────────────────────────────────────
  // One fetch + immediate write-on-change for every <image-slot> on the
  // page. Reads via fetch() so viewing works anywhere the HTML and sidecar
  // are served together; writes go through window.omelette.writeFile, which
  // the host allowlists to *.state.json basenames only.
  const subs = new Set();
  let slots = {};
  // ids explicitly cleared before the sidecar fetch resolved — otherwise
  // the merge below can't tell "never set" from "just deleted" and would
  // resurrect the sidecar's stale value.
  const tombstones = new Set();
  let loaded = false;
  let loadP = null;
  function load() {
    if (loadP) return loadP;
    loadP = fetch(STATE_FILE).then(r => r.ok ? r.json() : null).then(j => {
      // Merge: sidecar loses to any in-memory change that raced ahead of
      // the fetch (drop or clear) so neither is clobbered by hydration.
      if (j && typeof j === 'object') {
        const merged = Object.assign({}, j, slots);
        // A framing-only write that raced ahead of hydration must not
        // drop a user image that's only on disk — inherit u from the
        // sidecar for any in-memory entry that lacks one.
        for (const k in slots) {
          if (merged[k] && !merged[k].u && j[k]) {
            merged[k].u = typeof j[k] === 'string' ? j[k] : j[k].u;
          }
        }
        for (const id of tombstones) delete merged[id];
        slots = merged;
      }
      tombstones.clear();
    }).catch(() => {}).then(() => {
      loaded = true;
      subs.forEach(fn => fn());
    });
    return loadP;
  }

  // Serialize writes so two near-simultaneous drops on different slots
  // can't reorder at the backend and leave the sidecar with only the
  // first. A save requested mid-flight just marks dirty and re-fires on
  // completion with the then-current slots.
  let saving = false;
  let saveDirty = false;
  function save() {
    if (saving) {
      saveDirty = true;
      return;
    }
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    saving = true;
    Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {}).then(() => {
      saving = false;
      if (saveDirty) {
        saveDirty = false;
        save();
      }
    });
  }
  const S_MAX = 5;
  const clampS = s => Math.max(1, Math.min(S_MAX, s));

  // Normalize a stored slot value. Pre-reframe sidecars stored a bare
  // data-URL string; newer ones store {u, s, x, y}. Either shape is valid.
  function getSlot(id) {
    const v = slots[id];
    if (!v) return null;
    return typeof v === 'string' ? {
      u: v,
      s: 1,
      x: 0,
      y: 0
    } : v;
  }
  function setSlot(id, val) {
    if (!id) return;
    if (val) {
      slots[id] = val;
      tombstones.delete(id);
    } else {
      delete slots[id];
      if (!loaded) tombstones.add(id);
    }
    subs.forEach(fn => fn());
    // A drop is rare + high-value — write immediately so nav-away can't lose
    // it. Gate on the initial read so we don't overwrite a sidecar we haven't
    // merged yet; the merge in load() keeps this change once the read lands.
    if (loaded) save();else load().then(save);
  }

  // ── Image downscale ─────────────────────────────────────────────────────
  // Encode through a canvas so the sidecar carries resized bytes, not the
  // raw upload. Longest side is capped at 2× the slot's rendered width
  // (retina) and at MAX_DIM. WebP keeps alpha and is ~10× smaller than PNG
  // for photos, so there's no need for per-image format picking.
  async function toDataUrl(file, targetW) {
    const bitmap = await createImageBitmap(file);
    try {
      const cap = Math.min(MAX_DIM, Math.max(1, Math.round(targetW * 2)) || MAX_DIM);
      const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      return canvas.toDataURL('image/webp', 0.85);
    } finally {
      bitmap.close && bitmap.close();
    }
  }

  // ── Custom element ──────────────────────────────────────────────────────
  const stylesheet = ':host{display:inline-block;position:relative;vertical-align:top;' + '  font:13px/1.3 system-ui,-apple-system,sans-serif;color:rgba(0,0,0,.55);width:240px;height:160px}' + '.frame{position:absolute;inset:0;overflow:hidden;background:rgba(0,0,0,.04)}' +
  // .frame img (clipped) and .spill (unclipped ghost + handles) share the
  // same left/top/width/height in frame-%, computed by _applyView(), so the
  // inside-mask crop and the outside-mask spill stay pixel-aligned.
  '.frame img{position:absolute;max-width:none;transform:translate(-50%,-50%);' + '  -webkit-user-drag:none;user-select:none;touch-action:none}' +
  // Reframe mode (double-click): the full image spills past the mask. The
  // spill layer is sized to the IMAGE bounds so its corners are where the
  // resize handles belong. The ghost <img> inside is translucent; the real
  // clipped <img> underneath shows the opaque in-mask crop.
  '.spill{position:absolute;transform:translate(-50%,-50%);display:none;z-index:1;' + '  cursor:grab;touch-action:none}' + ':host([data-panning]) .spill{cursor:grabbing}' + '.spill .ghost{position:absolute;inset:0;width:100%;height:100%;opacity:.35;' + '  pointer-events:none;-webkit-user-drag:none;user-select:none;' + '  box-shadow:0 0 0 1px rgba(0,0,0,.2),0 12px 32px rgba(0,0,0,.2)}' + '.spill .handle{position:absolute;width:12px;height:12px;border-radius:50%;' + '  background:#fff;box-shadow:0 0 0 1.5px #c96442,0 1px 3px rgba(0,0,0,.3);' + '  transform:translate(-50%,-50%)}' + '.spill .handle[data-c=nw]{left:0;top:0;cursor:nwse-resize}' + '.spill .handle[data-c=ne]{left:100%;top:0;cursor:nesw-resize}' + '.spill .handle[data-c=sw]{left:0;top:100%;cursor:nesw-resize}' + '.spill .handle[data-c=se]{left:100%;top:100%;cursor:nwse-resize}' + ':host([data-reframe]){z-index:10}' + ':host([data-reframe]) .spill{display:block}' + ':host([data-reframe]) .frame{box-shadow:0 0 0 2px #c96442}' + '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  cursor:pointer;user-select:none}' + '.empty svg{opacity:.45}' + '.empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em}' + '.empty .sub{font-size:11px}' + '.empty .sub u{text-underline-offset:2px;text-decoration-color:rgba(0,0,0,.25)}' + '.empty:hover .sub u{color:rgba(0,0,0,.75);text-decoration-color:currentColor}' + ':host([data-over]) .frame{outline:2px solid #c96442;outline-offset:-2px;' + '  background:rgba(201,100,66,.10)}' + '.ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed rgba(0,0,0,.25);' + '  transition:border-color .12s}' + ':host([data-over]) .ring{border-color:#c96442}' + ':host([data-filled]) .ring{display:none}' +
  // Controls sit BELOW the mask (top:100%), absolutely positioned so the
  // author-declared slot height is unaffected. The gap is padding, not a
  // top offset, so the hover target stays contiguous with the frame.
  '.ctl{position:absolute;top:100%;left:50%;transform:translateX(-50%);padding-top:8px;' + '  display:flex;gap:6px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:2;' + '  white-space:nowrap}' + ':host([data-filled][data-editable]:hover) .ctl,:host([data-reframe]) .ctl' + '  {opacity:1;pointer-events:auto}' + '.ctl button{appearance:none;border:0;border-radius:6px;padding:5px 10px;cursor:pointer;' + '  background:rgba(0,0,0,.65);color:#fff;font:11px/1 system-ui,-apple-system,sans-serif;' + '  backdrop-filter:blur(6px)}' + '.ctl button:hover{background:rgba(0,0,0,.8)}' + '.err{position:absolute;left:8px;bottom:8px;right:8px;color:#b3261e;font-size:11px;' + '  background:rgba(255,255,255,.85);padding:4px 6px;border-radius:5px;pointer-events:none}';
  const icon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' + '<path d="m21 15-5-5L5 21"/></svg>';
  class ImageSlot extends HTMLElement {
    static get observedAttributes() {
      return ['shape', 'radius', 'mask', 'fit', 'position', 'placeholder', 'src', 'id'];
    }
    constructor() {
      super();
      const root = this.attachShadow({
        mode: 'open'
      });
      // .spill and .ctl sit OUTSIDE .frame so overflow:hidden + border-radius
      // on the frame (circle, pill, rounded) can't clip them.
      root.innerHTML = '<style>' + stylesheet + '</style>' + '<div class="frame" part="frame">' + '  <img part="image" alt="" draggable="false" style="display:none">' + '  <div class="empty" part="empty">' + icon + '    <div class="cap"></div>' + '    <div class="sub">or <u>browse files</u></div></div>' + '  <div class="ring" part="ring"></div>' + '</div>' + '<div class="spill">' + '  <img class="ghost" alt="" draggable="false">' + '  <div class="handle" data-c="nw"></div><div class="handle" data-c="ne"></div>' + '  <div class="handle" data-c="sw"></div><div class="handle" data-c="se"></div>' + '</div>' + '<div class="ctl"><button data-act="replace" title="Replace image">Replace</button>' + '  <button data-act="clear" title="Remove image">Remove</button></div>' + '<input type="file" accept="' + ACCEPT.join(',') + '" hidden>';
      this._frame = root.querySelector('.frame');
      this._ring = root.querySelector('.ring');
      this._img = root.querySelector('.frame img');
      this._empty = root.querySelector('.empty');
      this._cap = root.querySelector('.cap');
      this._sub = root.querySelector('.sub');
      this._spill = root.querySelector('.spill');
      this._ghost = root.querySelector('.ghost');
      this._err = null;
      this._input = root.querySelector('input');
      this._depth = 0;
      this._gen = 0;
      this._view = {
        s: 1,
        x: 0,
        y: 0
      };
      this._subFn = () => this._render();
      // Shadow-DOM listeners live with the shadow DOM — bound once here so
      // disconnect/reconnect (e.g. React remount) doesn't stack handlers.
      this._empty.addEventListener('click', () => this._input.click());
      root.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (act === 'replace') {
          this._exitReframe(true);
          this._input.click();
        }
        if (act === 'clear') {
          this._exitReframe(false);
          this._gen++;
          this._local = null;
          if (this.id) setSlot(this.id, null);else this._render();
        }
      });
      this._input.addEventListener('change', () => {
        const f = this._input.files && this._input.files[0];
        if (f) this._ingest(f);
        this._input.value = '';
      });
      // naturalWidth/Height aren't known until load — re-apply so the cover
      // baseline is computed from real dimensions, not the 100%×100% fallback.
      this._img.addEventListener('load', () => this._applyView());
      // Gated on editable + fit=cover so share links and contain/fill slots
      // stay static.
      this.addEventListener('dblclick', e => {
        if (!this.hasAttribute('data-editable') || !this._reframes()) return;
        e.preventDefault();
        if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
      });
      // Pan + resize both originate on the spill layer. A handle pointerdown
      // drives an aspect-locked resize anchored at the opposite corner; any
      // other pointerdown on the spill pans. Offsets are frame-% so a
      // reframed slot survives responsive resize / PPTX export.
      this._spill.addEventListener('pointerdown', e => {
        if (e.button !== 0 || !this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        e.stopPropagation();
        this._spill.setPointerCapture(e.pointerId);
        const rect = this.getBoundingClientRect();
        const fw = rect.width || 1,
          fh = rect.height || 1;
        const corner = e.target.getAttribute && e.target.getAttribute('data-c');
        let move;
        if (corner) {
          // Resize about the OPPOSITE corner. Viewport-px throughout (rect
          // fw/fh, not clientWidth) so the math survives a transform:scale()
          // ancestor — deck_stage renders slides scaled-to-fit.
          const iw = this._img.naturalWidth || 1,
            ih = this._img.naturalHeight || 1;
          const base = Math.max(fw / iw, fh / ih);
          const sx = corner.includes('e') ? 1 : -1;
          const sy = corner.includes('s') ? 1 : -1;
          const s0 = this._view.s;
          const w0 = iw * base * s0,
            h0 = ih * base * s0;
          const cx0 = (50 + this._view.x) / 100 * fw;
          const cy0 = (50 + this._view.y) / 100 * fh;
          const ox = cx0 - sx * w0 / 2,
            oy = cy0 - sy * h0 / 2;
          const diag0 = Math.hypot(w0, h0);
          const ux = sx * w0 / diag0,
            uy = sy * h0 / diag0;
          move = ev => {
            const proj = (ev.clientX - rect.left - ox) * ux + (ev.clientY - rect.top - oy) * uy;
            const s = clampS(s0 * proj / diag0);
            const d = diag0 * s / s0;
            this._view.s = s;
            this._view.x = (ox + ux * d / 2) / fw * 100 - 50;
            this._view.y = (oy + uy * d / 2) / fh * 100 - 50;
            this._clampView();
            this._applyView();
          };
        } else {
          this.setAttribute('data-panning', '');
          const start = {
            px: e.clientX,
            py: e.clientY,
            x: this._view.x,
            y: this._view.y
          };
          move = ev => {
            this._view.x = start.x + (ev.clientX - start.px) / fw * 100;
            this._view.y = start.y + (ev.clientY - start.py) / fh * 100;
            this._clampView();
            this._applyView();
          };
        }
        const up = () => {
          try {
            this._spill.releasePointerCapture(e.pointerId);
          } catch {}
          this._spill.removeEventListener('pointermove', move);
          this._spill.removeEventListener('pointerup', up);
          this._spill.removeEventListener('pointercancel', up);
          this.removeAttribute('data-panning');
          this._dragUp = null;
        };
        // Stashed so _exitReframe (Escape / outside-click mid-drag) can
        // tear the capture + listeners down synchronously.
        this._dragUp = up;
        this._spill.addEventListener('pointermove', move);
        this._spill.addEventListener('pointerup', up);
        this._spill.addEventListener('pointercancel', up);
      });
      // Wheel zoom stays available inside reframe mode as a trackpad nicety —
      // zooms toward the cursor (offset' = cursor·(1-k) + offset·k).
      this.addEventListener('wheel', e => {
        if (!this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        const r = this.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width * 100 - 50;
        const cy = (e.clientY - r.top) / r.height * 100 - 50;
        const prev = this._view.s;
        const next = clampS(prev * Math.pow(1.0015, -e.deltaY));
        if (next === prev) return;
        const k = next / prev;
        this._view.s = next;
        this._view.x = cx * (1 - k) + this._view.x * k;
        this._view.y = cy * (1 - k) + this._view.y * k;
        this._clampView();
        this._applyView();
      }, {
        passive: false
      });
    }
    connectedCallback() {
      // Warn once per page — an id-less slot works for the session but
      // cannot persist, and two id-less slots would share nothing.
      if (!this.id && !ImageSlot._warned) {
        ImageSlot._warned = true;
        console.warn('<image-slot> without an id will not persist its dropped image.');
      }
      this.addEventListener('dragenter', this);
      this.addEventListener('dragover', this);
      this.addEventListener('dragleave', this);
      this.addEventListener('drop', this);
      subs.add(this._subFn);
      // width%/height% in _applyView encode the frame aspect at call time —
      // a host resize (responsive grid, pane divider) would stretch the
      // image until the next _render. Re-render on size change: _render()
      // re-seeds _view from stored before clamp/apply, so a shrink→grow
      // cycle round-trips instead of ratcheting x/y toward the narrower
      // frame's clamp range.
      this._ro = new ResizeObserver(() => this._render());
      this._ro.observe(this);
      load();
      this._render();
    }
    disconnectedCallback() {
      subs.delete(this._subFn);
      this.removeEventListener('dragenter', this);
      this.removeEventListener('dragover', this);
      this.removeEventListener('dragleave', this);
      this.removeEventListener('drop', this);
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
      this._exitReframe(false);
    }
    _enterReframe() {
      if (this.hasAttribute('data-reframe')) return;
      this.setAttribute('data-reframe', '');
      this._applyView();
      // Close on click outside (the spill handler stopPropagation()s so
      // in-image drags don't reach this) and on Escape. Listeners are held
      // on the instance so _exitReframe / disconnectedCallback can detach
      // exactly what was attached.
      this._outside = e => {
        if (e.composedPath && e.composedPath().includes(this)) return;
        this._exitReframe(true);
      };
      this._esc = e => {
        if (e.key === 'Escape') this._exitReframe(true);
      };
      document.addEventListener('pointerdown', this._outside, true);
      document.addEventListener('keydown', this._esc, true);
    }
    _exitReframe(commit) {
      if (!this.hasAttribute('data-reframe')) return;
      if (this._dragUp) this._dragUp();
      this.removeAttribute('data-reframe');
      this.removeAttribute('data-panning');
      if (this._outside) document.removeEventListener('pointerdown', this._outside, true);
      if (this._esc) document.removeEventListener('keydown', this._esc, true);
      this._outside = this._esc = null;
      if (commit) this._commitView();
    }
    attributeChangedCallback() {
      if (this.shadowRoot) this._render();
    }

    // handleEvent — one listener object for all four drag events keeps the
    // add/remove symmetric and the depth counter correct.
    handleEvent(e) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        // Without preventDefault the browser never fires 'drop'.
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        if (e.type === 'dragenter') this._depth++;
        this.setAttribute('data-over', '');
      } else if (e.type === 'dragleave') {
        // dragenter/leave fire for every descendant crossing — count depth
        // so hovering the icon inside the empty state doesn't flicker.
        if (--this._depth <= 0) {
          this._depth = 0;
          this.removeAttribute('data-over');
        }
      } else if (e.type === 'drop') {
        e.preventDefault();
        e.stopPropagation();
        this._depth = 0;
        this.removeAttribute('data-over');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) this._ingest(f);
      }
    }
    async _ingest(file) {
      this._setError(null);
      if (!file || ACCEPT.indexOf(file.type) < 0) {
        this._setError('Drop a PNG, JPEG, WebP, or AVIF image.');
        return;
      }
      // toDataUrl can take hundreds of ms on a large photo. A Clear or a
      // newer drop during that window would be clobbered when this await
      // resumes — bump + capture a generation so stale encodes bail.
      const gen = ++this._gen;
      try {
        const w = this.clientWidth || this.offsetWidth || MAX_DIM;
        const url = await toDataUrl(file, w);
        if (gen !== this._gen) return;
        // Only exit reframe once the new image is in hand — a rejected type
        // or decode failure leaves the in-progress crop untouched.
        this._exitReframe(false);
        const val = {
          u: url,
          s: 1,
          x: 0,
          y: 0
        };
        setSlot(this.id || '', val);
        // Keep a session-local copy for id-less slots so the drop still
        // shows, even though it cannot persist.
        if (!this.id) {
          this._local = val;
          this._render();
        }
      } catch (err) {
        if (gen !== this._gen) return;
        this._setError('Could not read that image.');
        console.warn('<image-slot> ingest failed:', err);
      }
    }
    _setError(msg) {
      if (this._err) {
        this._err.remove();
        this._err = null;
      }
      if (!msg) return;
      const d = document.createElement('div');
      d.className = 'err';
      d.textContent = msg;
      this.shadowRoot.appendChild(d);
      this._err = d;
      setTimeout(() => {
        if (this._err === d) {
          d.remove();
          this._err = null;
        }
      }, 3000);
    }

    // Reframing (pan/resize) is only meaningful for fit=cover — contain/fill
    // keep the old object-fit path and double-click is a no-op.
    _reframes() {
      return this.hasAttribute('data-filled') && (this.getAttribute('fit') || 'cover') === 'cover';
    }

    // Cover-baseline geometry, shared by clamp/apply/resize. Null until the
    // img has loaded (naturalWidth is 0 before that) or when the slot has no
    // layout box — ResizeObserver fires with a 0×0 rect under display:none,
    // and clamping against a degenerate 1×1 frame would silently pull the
    // stored pan toward zero.
    _geom() {
      const iw = this._img.naturalWidth,
        ih = this._img.naturalHeight;
      const fw = this.clientWidth,
        fh = this.clientHeight;
      if (!iw || !ih || !fw || !fh) return null;
      return {
        iw,
        ih,
        fw,
        fh,
        base: Math.max(fw / iw, fh / ih)
      };
    }
    _clampView() {
      // Pan range on each axis is half the overflow past the frame edge.
      const g = this._geom();
      if (!g) return;
      const mx = Math.max(0, (g.iw * g.base * this._view.s / g.fw - 1) * 50);
      const my = Math.max(0, (g.ih * g.base * this._view.s / g.fh - 1) * 50);
      this._view.x = Math.max(-mx, Math.min(mx, this._view.x));
      this._view.y = Math.max(-my, Math.min(my, this._view.y));
    }
    _applyView() {
      const g = this._geom();
      const fit = this.getAttribute('fit') || 'cover';
      if (fit !== 'cover' || !g) {
        // Non-cover, or dimensions not known yet (before img load).
        this._img.style.width = '100%';
        this._img.style.height = '100%';
        this._img.style.left = '50%';
        this._img.style.top = '50%';
        this._img.style.objectFit = fit;
        this._img.style.objectPosition = this.getAttribute('position') || '50% 50%';
        return;
      }
      // Cover baseline: img fills the frame on its tighter axis at s=1, so
      // pan works immediately on the overflowing axis without zooming first.
      // Width/height and left/top are all frame-% — depends only on the
      // frame aspect ratio, so a responsive resize keeps the same crop. The
      // spill layer mirrors the same box so its corners = image corners.
      const k = g.base * this._view.s;
      const w = g.iw * k / g.fw * 100 + '%';
      const h = g.ih * k / g.fh * 100 + '%';
      const l = 50 + this._view.x + '%';
      const t = 50 + this._view.y + '%';
      this._img.style.width = w;
      this._img.style.height = h;
      this._img.style.left = l;
      this._img.style.top = t;
      this._img.style.objectFit = '';
      this._spill.style.width = w;
      this._spill.style.height = h;
      this._spill.style.left = l;
      this._spill.style.top = t;
    }
    _commitView() {
      const v = {
        s: this._view.s,
        x: this._view.x,
        y: this._view.y
      };
      if (this._userUrl) v.u = this._userUrl;
      // Framing-only (no u) persists too so an author-src slot remembers its
      // crop; clearing the sidecar still falls through to src=.
      if (this.id) setSlot(this.id, v);else {
        this._local = v;
      }
    }
    _render() {
      // Shape / mask. Presets use border-radius so the dashed ring can
      // follow the rounded outline; clip-path is only applied for an
      // explicit `mask` (the ring is hidden there since a rectangle
      // dashed border chopped by an arbitrary polygon looks broken).
      const mask = this.getAttribute('mask');
      const shape = (this.getAttribute('shape') || 'rounded').toLowerCase();
      let radius = '';
      if (shape === 'circle') radius = '50%';else if (shape === 'pill') radius = '9999px';else if (shape === 'rounded') {
        const n = parseFloat(this.getAttribute('radius'));
        radius = (Number.isFinite(n) ? n : 12) + 'px';
      }
      this._frame.style.borderRadius = mask ? '' : radius;
      this._frame.style.clipPath = mask || '';
      this._ring.style.borderRadius = mask ? '' : radius;
      this._ring.style.display = mask ? 'none' : '';

      // Controls and reframe entry gate on this so share links stay read-only.
      const editable = !!(window.omelette && window.omelette.writeFile);
      this.toggleAttribute('data-editable', editable);
      this._sub.style.display = editable ? '' : 'none';

      // Content. The sidecar is also writable by the agent's write_file
      // tool, so its value isn't guaranteed canvas-originated — only accept
      // data:image/ URLs from it. The `src` attribute is author-controlled
      // (Claude wrote it into the HTML) so it passes through unchanged.
      let stored = this.id ? getSlot(this.id) : this._local;
      if (stored && stored.u && !/^data:image\//i.test(stored.u)) stored = null;
      const srcAttr = this.getAttribute('src') || '';
      this._userUrl = stored && stored.u || null;
      const url = this._userUrl || srcAttr;
      // Don't clobber an in-flight reframe with a store-triggered re-render.
      if (!this.hasAttribute('data-reframe')) {
        this._view = {
          s: stored && Number.isFinite(stored.s) ? clampS(stored.s) : 1,
          x: stored && Number.isFinite(stored.x) ? stored.x : 0,
          y: stored && Number.isFinite(stored.y) ? stored.y : 0
        };
      }
      this._cap.textContent = this.getAttribute('placeholder') || 'Drop an image';
      // Toggle via style.display — the [hidden] attribute alone loses to
      // the display:flex / display:block rules in the stylesheet above.
      if (url) {
        if (this._img.getAttribute('src') !== url) {
          this._img.src = url;
          this._ghost.src = url;
        }
        this._img.style.display = 'block';
        this._empty.style.display = 'none';
        this.setAttribute('data-filled', '');
        this._clampView();
        this._applyView();
      } else {
        this._img.style.display = 'none';
        this._img.removeAttribute('src');
        this._ghost.removeAttribute('src');
        this._empty.style.display = 'flex';
        this.removeAttribute('data-filled');
      }
    }
  }
  if (!customElements.get('image-slot')) {
    customElements.define('image-slot', ImageSlot);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/social/image-slot.js", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Atrium Badge — small status / category tag. Smaller and flatter than a Chip;
 * not interactive.
 */
function Badge({
  children,
  tone = "mint",
  style = {},
  ...rest
}) {
  const tones = {
    mint: {
      background: "var(--mint-300)",
      color: "var(--teal-800)"
    },
    teal: {
      background: "var(--teal-800)",
      color: "var(--mint-400)"
    },
    amber: {
      background: "var(--amber-400)",
      color: "var(--teal-800)"
    },
    cloud: {
      background: "var(--cloud-300)",
      color: "var(--teal-700)"
    },
    outline: {
      background: "transparent",
      color: "var(--teal-800)",
      boxShadow: "inset 0 0 0 1.5px var(--teal-800)"
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      fontFamily: "var(--font-sans)",
      fontSize: "12px",
      fontWeight: 600,
      letterSpacing: "0.04em",
      lineHeight: 1,
      padding: "5px 10px",
      borderRadius: "var(--radius-pill)",
      ...tones[tone],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Atrium Button — stadium-pill action. Flat, confident, color-led.
 */
function Button({
  children,
  variant = "primary",
  size = "md",
  as = "button",
  iconLeft = null,
  iconRight = null,
  fullWidth = false,
  disabled = false,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: "8px 16px",
      fontSize: "13px",
      gap: "6px"
    },
    md: {
      padding: "12px 24px",
      fontSize: "15px",
      gap: "8px"
    },
    lg: {
      padding: "16px 34px",
      fontSize: "17px",
      gap: "10px"
    }
  };
  const variants = {
    primary: {
      background: "var(--teal-800)",
      color: "var(--mint-400)",
      border: "1.5px solid var(--teal-800)"
    },
    mint: {
      background: "var(--mint-400)",
      color: "var(--teal-800)",
      border: "1.5px solid var(--mint-400)"
    },
    amber: {
      background: "var(--amber-500)",
      color: "var(--teal-800)",
      border: "1.5px solid var(--amber-500)"
    },
    outline: {
      background: "transparent",
      color: "var(--teal-800)",
      border: "1.5px solid var(--teal-800)"
    },
    ghost: {
      background: "transparent",
      color: "var(--teal-800)",
      border: "1.5px solid transparent"
    }
  };
  const Comp = as;
  const [pressed, setPressed] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const hoverBg = {
    primary: "var(--teal-900)",
    mint: "var(--mint-500)",
    amber: "var(--amber-600)",
    outline: "var(--teal-800)",
    ghost: "var(--cloud-300)"
  }[variant];
  const hoverColor = variant === "outline" ? "var(--mint-400)" : undefined;
  return /*#__PURE__*/React.createElement(Comp, _extends({
    disabled: as === "button" ? disabled : undefined,
    onPointerDown: () => setPressed(true),
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => {
      setPressed(false);
      setHover(false);
    },
    onPointerEnter: () => setHover(true),
    style: {
      display: fullWidth ? "flex" : "inline-flex",
      width: fullWidth ? "100%" : undefined,
      alignItems: "center",
      justifyContent: "center",
      gap: sizes[size].gap,
      fontFamily: "var(--font-sans)",
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: "0.01em",
      borderRadius: "var(--radius-pill)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      textDecoration: "none",
      whiteSpace: "nowrap",
      transition: "transform var(--dur-fast) var(--ease-out), background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out)",
      transform: pressed ? "scale(0.97)" : "scale(1)",
      ...sizes[size],
      ...variants[variant],
      ...(hover && !disabled ? {
        background: hoverBg,
        color: hoverColor
      } : {}),
      ...style
    }
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Atrium Card — flat color-led surface. Elevation comes from the field color
 * (mint / amber / teal), not shadow. Soft 14px corners by default.
 */
function Card({
  children,
  tone = "light",
  padding = "28px",
  radius = "var(--radius-md)",
  bordered = false,
  hover = false,
  style = {},
  ...rest
}) {
  const tones = {
    light: {
      background: "var(--surface-card)",
      color: "var(--text-body)",
      border: bordered ? "1px solid var(--cloud-400)" : "1px solid transparent"
    },
    cloud: {
      background: "var(--cloud-300)",
      color: "var(--text-body)",
      border: "1px solid transparent"
    },
    mint: {
      background: "var(--mint-400)",
      color: "var(--teal-800)",
      border: "1px solid transparent"
    },
    amber: {
      background: "var(--amber-500)",
      color: "var(--teal-800)",
      border: "1px solid transparent"
    },
    teal: {
      background: "var(--teal-800)",
      color: "var(--text-on-dark)",
      border: "1px solid transparent"
    }
  };
  const [h, setH] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onPointerEnter: () => hover && setH(true),
    onPointerLeave: () => hover && setH(false),
    style: {
      borderRadius: radius,
      padding,
      transition: "transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)",
      transform: h ? "translateY(-4px)" : "none",
      boxShadow: h ? "var(--shadow-card)" : "none",
      ...tones[tone],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Atrium Chip — the stadium service pill (Seo · Marketing · Photography).
 * Outlined by default; becomes a filled field when selected.
 */
function Chip({
  children,
  variant = "outline",
  selected = false,
  size = "md",
  onClick,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: "5px 14px",
      fontSize: "13px"
    },
    md: {
      padding: "9px 20px",
      fontSize: "15px"
    },
    lg: {
      padding: "12px 26px",
      fontSize: "17px"
    }
  };
  const palettes = {
    outline: {
      background: "transparent",
      color: "var(--teal-800)",
      border: "1.5px solid var(--teal-800)"
    },
    "outline-light": {
      background: "transparent",
      color: "var(--mint-400)",
      border: "1.5px solid var(--teal-500)"
    },
    mint: {
      background: "var(--mint-400)",
      color: "var(--teal-800)",
      border: "1.5px solid var(--mint-400)"
    },
    teal: {
      background: "var(--teal-800)",
      color: "var(--mint-400)",
      border: "1.5px solid var(--teal-800)"
    },
    amber: {
      background: "var(--amber-500)",
      color: "var(--teal-800)",
      border: "1.5px solid var(--amber-500)"
    }
  };
  const selectedStyle = selected ? {
    background: "var(--teal-800)",
    color: "var(--mint-400)",
    borderColor: "var(--teal-800)"
  } : {};
  const interactive = !!onClick;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    tabIndex: interactive ? 0 : -1,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      fontFamily: "var(--font-sans)",
      fontWeight: 500,
      lineHeight: 1,
      borderRadius: "var(--radius-pill)",
      cursor: interactive ? "pointer" : "default",
      transition: "background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)",
      ...sizes[size],
      ...palettes[variant],
      ...selectedStyle,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Atrium Eyebrow — the wide letter-spaced caps label used above headings
 * and as section markers ("THE EXPERIENCE ERA", "MEDIA AND ADVERTISING").
 */
function Eyebrow({
  children,
  tone = "muted",
  spread = "wide",
  as = "div",
  style = {},
  ...rest
}) {
  const Comp = as;
  const colors = {
    muted: "var(--text-muted)",
    teal: "var(--teal-800)",
    mint: "var(--mint-400)",
    amber: "var(--amber-500)",
    onDark: "var(--teal-300)"
  };
  const tracking = {
    wide: "0.18em",
    widest: "0.32em"
  }[spread];
  return /*#__PURE__*/React.createElement(Comp, _extends({
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.8125rem",
      fontWeight: 600,
      letterSpacing: tracking,
      textTransform: "uppercase",
      color: colors[tone],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/core/Highlight.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Atrium Highlight — the signature marker swipe behind an emphasised word.
 * A hand-drawn-feeling amber (or mint) band sits low behind the text.
 */
function Highlight({
  children,
  color = "amber",
  style = {},
  ...rest
}) {
  const band = {
    amber: "var(--amber-400)",
    mint: "var(--mint-400)",
    teal: "var(--teal-800)"
  }[color];
  const ink = color === "teal" ? "var(--mint-400)" : "inherit";
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      backgroundImage: `linear-gradient(${band}, ${band})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "100% 62%",
      backgroundPosition: "0 74%",
      padding: "0 0.12em",
      color: ink,
      WebkitBoxDecorationBreak: "clone",
      boxDecorationBreak: "clone",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Highlight });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Highlight.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Atrium Input — clean text field with optional label. Hairline border that
 * deepens to teal on focus with an amber focus ring. Works on light surfaces.
 */
function Input({
  label,
  hint,
  id,
  type = "text",
  invalid = false,
  style = {},
  inputStyle = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "7px",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "13px",
      fontWeight: 600,
      letterSpacing: "0.02em",
      color: "var(--text-strong)"
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: type,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "15px",
      color: "var(--text-body)",
      background: "var(--cloud-100)",
      padding: "12px 16px",
      borderRadius: "var(--radius-sm)",
      border: `1.5px solid ${invalid ? "var(--amber-600)" : focus ? "var(--teal-800)" : "var(--cloud-400)"}`,
      outline: focus ? "2px solid var(--focus-ring)" : "2px solid transparent",
      outlineOffset: "2px",
      transition: "border-color var(--dur-base) var(--ease-out), outline-color var(--dur-base) var(--ease-out)",
      ...inputStyle
    }
  }, rest)), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "12px",
      color: invalid ? "var(--amber-600)" : "var(--text-muted)"
    }
  }, hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const MARK = "atrium-mark.svg";
const WORDMARK = "atrium-wordmark.svg";

/**
 * Atrium Logo — α monogram, wordmark, or horizontal lockup.
 * Recolors via CSS mask, so `color` accepts any brand token / hex.
 * `assetBase` points at the folder holding the logo SVGs (default
 * resolves the kit's own assets/logos via a relative path).
 */
function Logo({
  variant = "wordmark",
  color = "var(--teal-800)",
  height = 32,
  assetBase = "../../assets/logos",
  gap = 14,
  style = {},
  ...rest
}) {
  const mask = (file, ratio) => ({
    display: "block",
    height: `${height}px`,
    width: `${height * ratio}px`,
    background: color,
    WebkitMask: `url(${assetBase}/${file}) left center / contain no-repeat`,
    mask: `url(${assetBase}/${file}) left center / contain no-repeat`
  });
  if (variant === "mark") {
    return /*#__PURE__*/React.createElement("span", _extends({
      role: "img",
      "aria-label": "Atrium",
      style: {
        ...mask(MARK, 1),
        ...style
      }
    }, rest));
  }
  if (variant === "wordmark") {
    return /*#__PURE__*/React.createElement("span", _extends({
      role: "img",
      "aria-label": "atrium",
      style: {
        ...mask(WORDMARK, 819.21 / 225.63),
        ...style
      }
    }, rest));
  }
  // lockup: mark + wordmark
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: `${gap}px`,
      ...style
    },
    "aria-label": "Atrium",
    role: "img"
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: mask(MARK, 1)
  }), /*#__PURE__*/React.createElement("span", {
    style: mask(WORDMARK, 819.21 / 225.63)
  }));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/ScriptAccent.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Atrium ScriptAccent — a handwritten word (Nothing You Could Do), usually
 * underlined, dropped into a headline for warmth ("Welcome to atrium").
 */
function ScriptAccent({
  children,
  underline = true,
  color = "inherit",
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      fontFamily: "var(--font-script)",
      fontWeight: 400,
      color,
      textDecoration: underline ? "underline" : "none",
      textDecorationThickness: "2px",
      textUnderlineOffset: "3px",
      lineHeight: 1.1,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { ScriptAccent });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ScriptAccent.jsx", error: String((e && e.message) || e) }); }

// ui_kits/atrium-site/AtriumKit.jsx
try { (() => {
/* Atrium marketing site — chrome + hero + footer.
   Loaded as a Babel script; exports to window for the other kit files.
   Reads design-system primitives from window.AtriumDesignSystem_31d170. */

const ATR_NS = "AtriumDesignSystem_31d170";
const LOGO_BASE = "../../assets/logos";

/* ---- Lucide icon (real icon set via CDN) ---- */
function Icon({
  name,
  size = 20,
  stroke = 1.75,
  color = "currentColor",
  style = {}
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const host = ref.current;
    if (!host || !window.lucide) return;
    host.innerHTML = "";
    const i = document.createElement("i");
    i.setAttribute("data-lucide", name);
    host.appendChild(i);
    window.lucide.createIcons({
      attrs: {
        width: size,
        height: size,
        "stroke-width": stroke
      }
    });
  }, [name, size, stroke]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    style: {
      display: "inline-flex",
      color,
      ...style
    }
  });
}

/* ---- Header ---- */
function AtriumHeader({
  onNav
}) {
  const {
    Button,
    Logo
  } = window[ATR_NS];
  const [open, setOpen] = React.useState(false);
  const links = ["Services", "Work", "The Experience Era", "Contact"];
  const anchor = l => "#" + l.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "");
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "rgba(244,248,248,0.86)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--cloud-400)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-wide)",
      margin: "0 auto",
      padding: "16px var(--gutter)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    onClick: e => {
      e.preventDefault();
      onNav && onNav("top");
    },
    style: {
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: "lockup",
    color: "var(--teal-800)",
    height: 28,
    assetBase: LOGO_BASE
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: "30px",
      alignItems: "center"
    },
    className: "atr-desktop-nav"
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: anchor(l),
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "15px",
      fontWeight: 500,
      color: "var(--text-strong)",
      textDecoration: "none",
      letterSpacing: "0.01em"
    }
  }, l))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    as: "a",
    href: "#contact",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 16
    })
  }, "Start a project"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(v => !v),
    "aria-label": "Menu",
    className: "atr-burger",
    style: {
      display: "none",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "var(--teal-800)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: open ? "x" : "menu",
    size: 24
  })))), open && /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--cloud-400)",
      padding: "12px var(--gutter)",
      display: "flex",
      flexDirection: "column",
      gap: "4px"
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: anchor(l),
    onClick: () => setOpen(false),
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "16px",
      fontWeight: 500,
      color: "var(--text-strong)",
      textDecoration: "none",
      padding: "10px 0"
    }
  }, l))));
}

/* ---- Hero ---- */
function AtriumHero() {
  const {
    Button,
    Chip,
    ScriptAccent,
    Highlight,
    Eyebrow
  } = window[ATR_NS];
  const services = ["Seo", "Marketing", "Graphic Design", "Photography"];
  return /*#__PURE__*/React.createElement("section", {
    id: "top",
    style: {
      position: "relative",
      background: "var(--teal-800)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      right: "-4%",
      bottom: "-18%",
      width: "min(46vw, 620px)",
      height: "min(46vw, 620px)",
      background: "var(--teal-700)",
      WebkitMask: `url(${window.__resources && window.__resources.atriumMark || LOGO_BASE + "/atrium-mark.svg"}) center/contain no-repeat`,
      mask: `url(${window.__resources && window.__resources.atriumMark || LOGO_BASE + "/atrium-mark.svg"}) center/contain no-repeat`,
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      maxWidth: "var(--container-wide)",
      margin: "0 auto",
      padding: "clamp(3.5rem, 8vw, 7rem) var(--gutter) clamp(3rem, 6vw, 5rem)"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "amber",
    style: {
      marginBottom: "22px"
    }
  }, "Kansas City \xB7 Creative & Marketing Studio"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      color: "var(--cloud-300)",
      margin: 0,
      fontSize: "clamp(2.6rem, 6.4vw, 5.4rem)",
      lineHeight: 1.04,
      fontWeight: 700,
      letterSpacing: "-0.01em",
      maxWidth: "16ch"
    }
  }, "We're ", /*#__PURE__*/React.createElement(ScriptAccent, {
    color: "var(--mint-400)"
  }, "humans."), " Marketing experts & simple software for", " ", /*#__PURE__*/React.createElement(Highlight, {
    color: "amber"
  }, "better Business.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      color: "var(--teal-300)",
      fontSize: "clamp(1rem,1.6vw,1.25rem)",
      lineHeight: 1.6,
      maxWidth: "44ch",
      margin: "26px 0 0"
    }
  }, "Congratulations \u2014 you've found your people. We don't just create ads; we build growth engines for tens of thousands of brands."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      margin: "32px 0 36px"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "mint",
    size: "lg",
    as: "a",
    href: "#contact",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    })
  }, "Start a project"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "lg",
    as: "a",
    href: "#work",
    style: {
      color: "var(--mint-400)",
      borderColor: "var(--teal-500)"
    }
  }, "See our work")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap"
    }
  }, services.map(s => /*#__PURE__*/React.createElement(Chip, {
    key: s,
    variant: "outline-light"
  }, s)))));
}

/* ---- Footer ---- */
function AtriumFooter() {
  const {
    Logo
  } = window[ATR_NS];
  const cols = [{
    h: "Studio",
    items: ["About", "The Experience Era", "Careers", "Contact"]
  }, {
    h: "Services",
    items: ["SEO", "Marketing", "Graphic Design", "Photography"]
  }, {
    h: "Connect",
    items: ["Instagram", "LinkedIn", "Dribbble", "hello@atrium.studio"]
  }];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--teal-900)",
      color: "var(--text-on-dark)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-wide)",
      margin: "0 auto",
      padding: "clamp(2.5rem,5vw,4rem) var(--gutter)",
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
      gap: "32px"
    },
    className: "atr-footer-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Logo, {
    variant: "lockup",
    color: "var(--mint-400)",
    height: 26,
    assetBase: LOGO_BASE
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "14px",
      color: "var(--teal-300)",
      lineHeight: 1.6,
      marginTop: "16px",
      maxWidth: "30ch"
    }
  }, "The team you call when you need help yesterday. Kansas City, everywhere.")), cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.h
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "12px",
      fontWeight: 600,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "var(--mint-400)",
      marginBottom: "14px"
    }
  }, c.h), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "9px"
    }
  }, c.items.map(i => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: "#",
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "14px",
      color: "var(--teal-300)",
      textDecoration: "none"
    }
  }, i)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--teal-700)",
      padding: "18px var(--gutter)",
      maxWidth: "var(--container-wide)",
      margin: "0 auto",
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "13px",
      color: "var(--teal-500)"
    }
  }, "\xA9 2026 Atrium Studio. We're humans."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "13px",
      color: "var(--teal-500)"
    }
  }, "Privacy \xB7 Terms")));
}
Object.assign(window, {
  Icon,
  AtriumHeader,
  AtriumHero,
  AtriumFooter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/atrium-site/AtriumKit.jsx", error: String((e && e.message) || e) }); }

// ui_kits/atrium-site/AtriumSections.jsx
try { (() => {
/* Atrium marketing site — content sections.
   Reads Icon from window (AtriumKit.jsx) and primitives from the DS namespace. */

const ATR_NS_S = "AtriumDesignSystem_31d170";

/* ---- Services · BENTO ----
   Asymmetric grid of service tiles. Each cell uses a different brand type
   treatment: Nimora wordmark, serif headings, wide caps, the amber marker
   highlight, big serif/grotesk stat figures, and the handwriting accent.
   Photo cells are drag-to-fill <image-slot>s (persist by id). */
const ATR_CAPS = {
  fontFamily: "var(--font-sans)",
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.22em",
  textTransform: "uppercase"
};
const ATR_SERIF_H = {
  fontFamily: "var(--font-serif)",
  fontWeight: 400,
  letterSpacing: "0",
  lineHeight: 1.04
};
function AtriumServices() {
  const {
    Eyebrow,
    Highlight,
    ScriptAccent
  } = window[ATR_NS_S];
  const Icon = window.Icon;
  return /*#__PURE__*/React.createElement("section", {
    id: "services",
    style: {
      background: "var(--cloud-200)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-wide)",
      margin: "0 auto",
      padding: "clamp(3.5rem,7vw,6rem) var(--gutter)"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "amber"
  }, "What we do"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "clamp(2rem,4.6vw,3.6rem)",
      fontWeight: 700,
      color: "var(--text-strong)",
      letterSpacing: "-0.01em",
      lineHeight: 1.04,
      margin: "16px 0 12px",
      maxWidth: "24ch"
    }
  }, "Everything you need to grow \u2014 ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-serif)",
      fontStyle: "italic",
      fontWeight: 400
    }
  }, "under one roof.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "1.05rem",
      lineHeight: 1.6,
      color: "var(--text-muted)",
      maxWidth: "46ch",
      margin: "0 0 40px"
    }
  }, "Strategy, creative, and data \u2014 woven into one team. Drag your own photos into any tile."), /*#__PURE__*/React.createElement("div", {
    className: "atr-bento"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#work",
    className: "b-cell b-gd",
    style: {
      background: "var(--teal-800)",
      padding: "32px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      gap: "24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "b-grain"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 3,
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "26px",
      color: "var(--cloud-300)",
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(181,242,219,0.25)",
      borderRadius: "12px",
      padding: "10px 18px",
      lineHeight: 1
    }
  }, "atrium"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      background: "var(--mint-400)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      background: "var(--amber-500)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      background: "var(--cloud-300)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      background: "var(--mint-400)",
      clipPath: "polygon(0 0,100% 0,0 100%)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...ATR_CAPS,
      color: "var(--mint-300)",
      marginLeft: "auto"
    }
  }, "Identity \xB7 Packaging")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...ATR_CAPS,
      color: "var(--mint-300)",
      marginBottom: "12px"
    }
  }, "Graphic Design"), /*#__PURE__*/React.createElement("h3", {
    style: {
      ...ATR_SERIF_H,
      fontSize: "clamp(2rem,3.2vw,2.9rem)",
      color: "var(--cloud-300)",
      margin: 0
    }
  }, "Brand systems, built with ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontStyle: "italic",
      color: "var(--amber-400)"
    }
  }, "craft.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "15px",
      lineHeight: 1.6,
      color: "var(--teal-300)",
      margin: "14px 0 0",
      maxWidth: "44ch"
    }
  }, "Visually compelling identity, packaging and design systems that stand out and carry your brand's whole visual narrative."))), /*#__PURE__*/React.createElement("a", {
    href: "#work",
    className: "b-cell b-photo",
    style: {
      background: "var(--teal-700)"
    }
  }, /*#__PURE__*/React.createElement("image-slot", {
    id: "atr-bento-photo",
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%"
    },
    shape: "rect",
    placeholder: "Drop a brand / product photo"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(180deg,rgba(7,47,52,0) 45%,rgba(7,47,52,0.6))",
      zIndex: 2,
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "b-grain",
    style: {
      zIndex: 3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "20px",
      right: "20px",
      bottom: "20px",
      zIndex: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...ATR_CAPS,
      color: "var(--mint-300)",
      marginBottom: "8px"
    }
  }, "Stop the scroll"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...ATR_SERIF_H,
      fontSize: "2.1rem",
      color: "#fff"
    }
  }, "Photography"))), /*#__PURE__*/React.createElement("a", {
    href: "#the-experience-era",
    className: "b-cell b-camp",
    style: {
      background: "var(--amber-500)",
      padding: "26px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "b-grain",
    style: {
      opacity: 0.15
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 3,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...ATR_CAPS,
      color: "var(--teal-800)"
    }
  }, "Campaigns"), /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up-right",
    size: 20,
    color: "var(--teal-800)"
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      position: "relative",
      zIndex: 3,
      fontFamily: "var(--font-sans)",
      fontSize: "1.7rem",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      lineHeight: 1.0,
      color: "var(--teal-800)",
      margin: 0
    }
  }, "Big ideas that ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-serif)",
      fontStyle: "italic",
      fontWeight: 400
    }
  }, "travel."))), /*#__PURE__*/React.createElement("a", {
    href: "#work",
    className: "b-cell b-seo",
    style: {
      background: "var(--cloud-100)",
      border: "1px solid rgba(7,47,52,0.08)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "#fff",
      border: "1px solid rgba(7,47,52,0.1)",
      borderRadius: "999px",
      padding: "8px 14px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 15,
    color: "var(--teal-500)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "12.5px",
      color: "var(--text-muted)"
    }
  }, "best near me")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: 800,
      fontSize: "2.6rem",
      letterSpacing: "-0.03em",
      color: "var(--teal-800)",
      lineHeight: 1
    }
  }, "#1"), /*#__PURE__*/React.createElement("span", {
    style: {
      ...ATR_SERIF_H,
      fontStyle: "italic",
      fontSize: "1.3rem",
      color: "var(--teal-700)"
    }
  }, "Found first.")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...ATR_CAPS,
      color: "var(--text-muted)",
      marginTop: "8px"
    }
  }, "SEO that compounds"))), /*#__PURE__*/React.createElement("a", {
    href: "#work",
    className: "b-cell b-video",
    style: {
      background: "var(--teal-800)"
    }
  }, /*#__PURE__*/React.createElement("image-slot", {
    id: "atr-bento-video",
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%"
    },
    shape: "rect",
    placeholder: "Drop a video still"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(180deg,rgba(7,47,52,0.25),rgba(7,47,52,0.75))",
      zIndex: 2,
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "b-grain",
    style: {
      zIndex: 3
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "18px",
      right: "18px",
      zIndex: 4,
      width: "42px",
      height: "42px",
      borderRadius: "50%",
      background: "var(--mint-400)",
      color: "var(--teal-800)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "play",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "20px",
      right: "20px",
      bottom: "20px",
      zIndex: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: 800,
      fontSize: "1.5rem",
      letterSpacing: "-0.02em",
      color: "var(--cloud-300)"
    }
  }, "Video"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "13px",
      color: "var(--teal-300)",
      marginTop: "4px"
    }
  }, "Script, shoot, edit, animate."))), /*#__PURE__*/React.createElement("a", {
    href: "#work",
    className: "b-cell b-mkt",
    style: {
      background: "var(--mint-400)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...ATR_CAPS,
      color: "var(--teal-700)"
    }
  }, "Marketing"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...ATR_SERIF_H,
      fontStyle: "italic",
      fontSize: "clamp(3rem,6vw,4.4rem)",
      color: "var(--teal-800)"
    }
  }, "2.7\xD7"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "14px",
      lineHeight: 1.45,
      color: "var(--teal-700)",
      margin: "8px 0 0",
      maxWidth: "22ch"
    }
  }, "more covers booked in a partner's first 90 days."))), /*#__PURE__*/React.createElement("a", {
    href: "#work",
    className: "b-cell b-social",
    style: {
      background: "var(--teal-700)",
      padding: "26px",
      display: "flex",
      alignItems: "center",
      gap: "26px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "b-grain"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 3,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...ATR_CAPS,
      color: "var(--mint-300)",
      marginBottom: "10px"
    }
  }, "Organic + Paid Social"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "clamp(1.5rem,2.6vw,2rem)",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      lineHeight: 1.02,
      color: "var(--cloud-300)",
      margin: 0
    }
  }, "Content that stops the ", /*#__PURE__*/React.createElement(ScriptAccent, {
    color: "var(--amber-400)"
  }, "scroll.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "14px",
      lineHeight: 1.55,
      color: "var(--teal-300)",
      margin: "12px 0 0",
      maxWidth: "40ch"
    }
  }, "From high-impact static posts to an educational video series \u2014 every size and format the algorithm wants.")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 3,
      display: "flex",
      gap: "12px",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("image-slot", {
    id: "atr-bento-social-1",
    style: {
      width: "118px",
      height: "158px",
      borderRadius: "14px",
      overflow: "hidden",
      border: "1px solid rgba(181,242,219,0.2)"
    },
    shape: "rounded",
    radius: "14",
    placeholder: "post"
  }), /*#__PURE__*/React.createElement("image-slot", {
    id: "atr-bento-social-2",
    style: {
      width: "118px",
      height: "158px",
      borderRadius: "14px",
      overflow: "hidden",
      border: "1px solid rgba(181,242,219,0.2)"
    },
    shape: "rounded",
    radius: "14",
    placeholder: "reel"
  }))))));
}

/* ---- The Experience Era marquee ---- */
function AtriumMarquee() {
  const phrase = "THE EXPERIENCE ERA";
  const row = Array.from({
    length: 6
  });
  return /*#__PURE__*/React.createElement("section", {
    id: "the-experience-era",
    style: {
      background: "var(--amber-500)",
      padding: "clamp(2rem,4vw,3.2rem) 0",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "0",
      whiteSpace: "nowrap",
      animation: "atr-marquee 28s linear infinite"
    }
  }, [0, 1].map(k => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      gap: "48px",
      paddingRight: "48px"
    }
  }, row.map((_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "clamp(1.8rem,4vw,3.2rem)",
      color: "var(--teal-800)",
      letterSpacing: "0.02em",
      display: "inline-flex",
      alignItems: "center",
      gap: "48px"
    }
  }, phrase, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "0.7em"
    }
  }, "\u2733")))))));
}

/* ---- Work gallery with chip filter ---- */
const ATR_WORK = [{
  t: "Meridian Coffee",
  cat: "Graphic Design",
  tone: "teal",
  year: "2026"
}, {
  t: "Northwind Outdoor",
  cat: "Photography",
  tone: "mint",
  year: "2025"
}, {
  t: "Loop Fitness",
  cat: "Marketing",
  tone: "amber",
  year: "2026"
}, {
  t: "Verdant Skincare",
  cat: "Graphic Design",
  tone: "mintdark",
  year: "2025"
}, {
  t: "Atlas Logistics",
  cat: "Seo",
  tone: "teal",
  year: "2026"
}, {
  t: "Bloom Florals",
  cat: "Photography",
  tone: "cloud",
  year: "2025"
}];
function AtriumWork({
  filter,
  setFilter
}) {
  const {
    Chip,
    Badge,
    Eyebrow
  } = window[ATR_NS_S];
  const Icon = window.Icon;
  const cats = ["All", "Seo", "Marketing", "Graphic Design", "Photography"];
  const tiles = {
    teal: {
      background: "var(--teal-800)",
      color: "var(--mint-400)"
    },
    mint: {
      background: "var(--mint-400)",
      color: "var(--teal-800)"
    },
    mintdark: {
      background: "var(--mint-500)",
      color: "var(--teal-800)"
    },
    amber: {
      background: "var(--amber-500)",
      color: "var(--teal-800)"
    },
    cloud: {
      background: "var(--cloud-300)",
      color: "var(--teal-800)"
    }
  };
  const shown = ATR_WORK.filter(w => filter === "All" || w.cat === filter);
  return /*#__PURE__*/React.createElement("section", {
    id: "work",
    style: {
      background: "var(--cloud-100)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-wide)",
      margin: "0 auto",
      padding: "clamp(3.5rem,7vw,6rem) var(--gutter)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      flexWrap: "wrap",
      gap: "20px",
      marginBottom: "32px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "amber"
  }, "Selected work"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "clamp(2rem,4.5vw,3.4rem)",
      fontWeight: 700,
      color: "var(--text-strong)",
      letterSpacing: "-0.01em",
      margin: "16px 0 0"
    }
  }, "Brands we've helped grow")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "9px",
      flexWrap: "wrap"
    }
  }, cats.map(c => /*#__PURE__*/React.createElement(Chip, {
    key: c,
    variant: "outline",
    selected: filter === c,
    onClick: () => setFilter(c),
    size: "sm"
  }, c)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "18px"
    }
  }, shown.map(w => /*#__PURE__*/React.createElement("a", {
    key: w.t,
    href: "#",
    style: {
      textDecoration: "none",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      aspectRatio: "4/3",
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
      ...tiles[w.tone],
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: "44%",
      height: "44%",
      background: "currentColor",
      opacity: 0.16,
      WebkitMask: "url(../../assets/logos/atrium-mark.svg) center/contain no-repeat",
      mask: "url(../../assets/logos/atrium-mark.svg) center/contain no-repeat"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "12px",
      left: "12px"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "cloud"
  }, w.year))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "12px",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "1.2rem",
      fontWeight: 700,
      color: "var(--text-strong)"
    }
  }, w.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "13px",
      color: "var(--text-muted)"
    }
  }, w.cat)), /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up-right",
    size: 20,
    color: "var(--teal-500)"
  })))))));
}

/* ---- Contact ---- */
function AtriumContact({
  state,
  onSubmit,
  onField
}) {
  const {
    Button,
    Input,
    Chip,
    ScriptAccent
  } = window[ATR_NS_S];
  const Icon = window.Icon;
  const interests = ["Seo", "Marketing", "Graphic Design", "Photography"];
  if (state.sent) {
    return /*#__PURE__*/React.createElement("section", {
      id: "contact",
      style: {
        background: "var(--teal-800)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: "720px",
        margin: "0 auto",
        padding: "clamp(4rem,8vw,7rem) var(--gutter)",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: "64px",
        height: "64px",
        borderRadius: "999px",
        background: "var(--mint-400)",
        color: "var(--teal-800)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "24px"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 32
    })), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: "clamp(2rem,5vw,3.2rem)",
        fontWeight: 700,
        color: "var(--cloud-300)",
        margin: 0
      }
    }, "You've found ", /*#__PURE__*/React.createElement(ScriptAccent, {
      color: "var(--mint-400)"
    }, "your people.")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "var(--font-sans)",
        color: "var(--teal-300)",
        fontSize: "1.05rem",
        marginTop: "16px"
      }
    }, "Thanks, ", state.name || "friend", ". We'll be in touch within one business day.")));
  }
  return /*#__PURE__*/React.createElement("section", {
    id: "contact",
    style: {
      background: "var(--teal-800)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-wide)",
      margin: "0 auto",
      padding: "clamp(3.5rem,7vw,6rem) var(--gutter)",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "48px",
      alignItems: "center"
    },
    className: "atr-contact-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "clamp(2.2rem,5vw,3.6rem)",
      fontWeight: 700,
      color: "var(--cloud-300)",
      letterSpacing: "-0.01em",
      lineHeight: 1.05,
      margin: 0
    }
  }, "Need help ", /*#__PURE__*/React.createElement(ScriptAccent, {
    color: "var(--amber-400)"
  }, "yesterday?")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      color: "var(--teal-300)",
      fontSize: "1.05rem",
      lineHeight: 1.6,
      marginTop: "20px",
      maxWidth: "38ch"
    }
  }, "Tell us what you're building. We'll bring the strategy, the creative and the software to make it move."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginTop: "28px",
      color: "var(--mint-400)",
      fontFamily: "var(--font-sans)",
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "mail",
    size: 20
  }), " hello@atrium.studio")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--cloud-100)",
      borderRadius: "var(--radius-lg)",
      padding: "clamp(22px,3vw,34px)"
    }
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onSubmit();
    },
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Name",
    placeholder: "Jane Maker",
    value: state.name,
    onChange: e => onField("name", e.target.value),
    required: true
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Work email",
    type: "email",
    placeholder: "jane@brand.com",
    value: state.email,
    onChange: e => onField("email", e.target.value),
    required: true
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "13px",
      fontWeight: 600,
      color: "var(--text-strong)",
      marginBottom: "9px"
    }
  }, "I'm interested in"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap"
    }
  }, interests.map(i => /*#__PURE__*/React.createElement(Chip, {
    key: i,
    variant: "outline",
    size: "sm",
    selected: state.interest === i,
    onClick: () => onField("interest", i)
  }, i)))), /*#__PURE__*/React.createElement(Button, {
    variant: "amber",
    size: "lg",
    type: "submit",
    fullWidth: true,
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    })
  }, "Send it our way")))));
}
Object.assign(window, {
  AtriumServices,
  AtriumMarquee,
  AtriumWork,
  AtriumContact
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/atrium-site/AtriumSections.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.Highlight = __ds_scope.Highlight;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.ScriptAccent = __ds_scope.ScriptAccent;

})();
