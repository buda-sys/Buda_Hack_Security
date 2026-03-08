(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  function escapeHtml(s) {
    return (s ?? "").toString()
      .replaceAll("&","&amp;").replaceAll("<","&lt;")
      .replaceAll(">","&gt;").replaceAll('"',"&quot;");
  }

  function normalizePath(p) {
    if (!p) return p;
    let f = p.toString().trim().replaceAll("\\","/");
    f = f.replaceAll("/budahacksecurity/uploads/","uploads/");
    if (f.startsWith("/uploads/")) f = f.replace("/uploads/","uploads/");
    if (f.startsWith("./")) f = f.slice(2);
    return f.replace(/\/{2,}/g,"/");
  }

  function fixStaticPaths(t) {
    if (!t) return t;
    return t
      .replaceAll("/budahacksecurity/uploads/","uploads/")
      .replaceAll('src="/uploads/','src="uploads/')
      .replaceAll("src='/uploads/","src='uploads/")
      .replaceAll('href="/uploads/','href="uploads/')
      .replaceAll("href='/uploads/","href='uploads/");
  }

  function slugify(str) {
    return (str ?? "").toString().trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-")
      .replace(/-+/g,"-").replace(/(^-|-$)/g,"");
  }

  async function waitForMdFile(ms = 15000) {
    const t = Date.now();
    while (!window.MD_FILE) {
      if (Date.now() - t > ms) return null;
      await new Promise(r => setTimeout(r, 60));
    }
    return window.MD_FILE;
  }

  /* ── Marked ── */
  function setupMarked() {
    if (!window.marked) return;
    marked.setOptions({
      gfm: true, breaks: false, headerIds: false, mangle: false,
      ...(window.hljs ? {
        highlight: (code, lang) => {
          try {
            return lang && hljs.getLanguage(lang)
              ? hljs.highlight(code, { language: lang }).value
              : hljs.highlightAuto(code).value;
          } catch { return escapeHtml(code); }
        }
      } : {})
    });
  }

  /* ── Mermaid ── */
  function setupMermaid() {
    if (!window.mermaid) return;
    try { mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "strict" }); }
    catch(e) { console.warn(e); }
  }

  function renderMermaid(container) {
    if (!window.mermaid) return;
    container.querySelectorAll("pre code.language-mermaid, pre code.lang-mermaid").forEach(el => {
      const pre = el.closest("pre"); if (!pre) return;
      const d = document.createElement("div");
      d.className = "mermaid"; d.textContent = el.textContent;
      pre.replaceWith(d);
    });
    try { mermaid.run({ querySelector: `#${container.id} .mermaid` }); } catch(e) {}
  }

  /* ══════════════════════════════════════════
     OVERLAY — imagen a pantalla completa
     Click imagen → se abre encima de todo
     Click en overlay o ESC → se cierra
  ══════════════════════════════════════════ */
  function buildOverlay() {
    if (document.getElementById("img-overlay")) return;

    const style = document.createElement("style");
    style.textContent = `
      #img-overlay {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(0,0,0,.95);
        backdrop-filter: blur(10px);
        align-items: center;
        justify-content: center;
        cursor: zoom-out;
      }
      #img-overlay.show {
        display: flex;
        animation: ov-in .2s ease;
      }
      @keyframes ov-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      #img-overlay img {
        max-width: 94vw;
        max-height: 92vh;
        object-fit: contain;
        display: block;
        border: 2px solid #00ffff;
        box-shadow:
          0 0 0 1px rgba(0,255,255,.15),
          0 0 80px rgba(0,255,255,.2);
        animation: ov-border 3s linear infinite;
        pointer-events: none;
        user-select: none;
        border-radius: 2px;
      }
      @keyframes ov-border {
        0%,100% { border-color:#00ffff; box-shadow: 0 0 80px rgba(0,255,255,.2); }
        33%      { border-color:#ff2d78; box-shadow: 0 0 80px rgba(255,45,120,.2); }
        66%      { border-color:#ffe600; box-shadow: 0 0 80px rgba(255,230,0,.2); }
      }
      #img-overlay-close {
        position: fixed;
        top: 18px; right: 22px;
        font-family: 'Press Start 2P', monospace;
        font-size: 7px; letter-spacing: 1px;
        color: #ff2d78;
        background: rgba(0,0,0,.8);
        border: 2px solid #ff2d78;
        padding: 7px 14px;
        cursor: pointer;
        box-shadow: 2px 2px 0 rgba(255,45,120,.4);
        text-shadow: 0 0 8px #ff2d78;
        z-index: 100000;
        transition: background .12s;
      }
      #img-overlay-close:hover { background: rgba(255,45,120,.25); }
      #img-overlay-hint {
        position: fixed;
        bottom: 20px; left: 50%; transform: translateX(-50%);
        font-family: 'Press Start 2P', monospace;
        font-size: 6px; letter-spacing: 2px;
        color: rgba(255,255,255,.2);
        pointer-events: none;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(style);

    const ov = document.createElement("div");
    ov.id = "img-overlay";
    ov.innerHTML = `
      <button id="img-overlay-close">✕ CLOSE</button>
      <img id="img-overlay-img" alt="">
      <div id="img-overlay-hint">CLICK ANYWHERE OR ESC TO CLOSE</div>
    `;
    document.body.appendChild(ov);

    // click overlay background → close
    ov.addEventListener("click", closeOverlay);
    // close button
    document.getElementById("img-overlay-close").addEventListener("click", e => {
      e.stopPropagation(); closeOverlay();
    });
    // ESC key
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeOverlay();
    });

    window._openImgOverlay = (src, alt) => {
      const img = document.getElementById("img-overlay-img");
      img.src = src;
      img.alt = alt || "";
      ov.classList.add("show");
      document.body.style.overflow = "hidden";
    };
  }

  function closeOverlay() {
    const ov = document.getElementById("img-overlay");
    if (!ov || !ov.classList.contains("show")) return;
    ov.classList.remove("show");
    document.body.style.overflow = "";
    setTimeout(() => {
      const img = document.getElementById("img-overlay-img");
      if (img) img.src = "";
    }, 200);
  }

  /* ── Make all images clickable → open overlay ── */
  function enhanceImages(container) {
    if (!container) return;
    buildOverlay();
    container.querySelectorAll("img").forEach(img => {
      if (img.dataset.ovReady) return;
      img.dataset.ovReady = "1";
      img.loading = "lazy";
      img.style.cursor = "zoom-in";
      img.title = "Click para ampliar";
      img.addEventListener("click", () => {
        if (window._openImgOverlay) window._openImgOverlay(img.src, img.alt);
      });
      // optional caption from alt
      const alt = (img.alt || "").trim();
      if (alt && !alt.match(/^https?:\/\//) && !img.nextElementSibling?.classList.contains("img-cap")) {
        const cap = document.createElement("div");
        cap.className = "img-cap";
        cap.style.cssText = "text-align:center;margin:-16px 0 28px;font-family:'Press Start 2P',monospace;font-size:6px;letter-spacing:1.5px;color:rgba(0,255,255,.38);text-transform:uppercase;";
        cap.textContent = "▶ " + alt;
        img.insertAdjacentElement("afterend", cap);
      }
    });
  }

  /* ── Videos ── */
  function enhanceVideos(container) {
    if (!container) return;
    container.querySelectorAll('a[href$=".mp4"]').forEach(a => {
      const v = document.createElement("video");
      v.controls = true; v.preload = "metadata";
      v.style.cssText = "width:100%;margin:18px 0;border:2px solid var(--cyan,#00ffff);";
      v.src = a.href;
      const p = a.closest("p");
      (p && p.textContent.trim() === a.textContent.trim() ? p : a).replaceWith(v);
    });
  }

  /* ── Code blocks + copy button ── */
  function enhanceCode(container) {
    if (!container) return;
    container.querySelectorAll("pre").forEach(pre => {
      if (pre.closest(".code-block-wrap")) return;
      const code = pre.querySelector("code");
      const lang = (code?.className.match(/language-(\w+)/) || [])[1] || "CODE";
      const wrap   = document.createElement("div"); wrap.className = "code-block-wrap";
      const bar    = document.createElement("div"); bar.className  = "code-window-bar";
      const copy   = document.createElement("button");
      copy.style.cssText = "font-family:var(--pixel,'Press Start 2P',monospace);font-size:6px;letter-spacing:1px;color:#000;background:var(--green,#00ff41);border:none;padding:3px 10px;cursor:pointer;box-shadow:2px 2px 0 rgba(0,0,0,.5);margin-left:auto;";
      copy.textContent = "COPY";
      copy.addEventListener("click", e => {
        e.stopPropagation();
        const txt = code ? code.textContent : pre.textContent;
        navigator.clipboard.writeText(txt).then(() => {
          copy.textContent = "✓ OK";
          setTimeout(() => { copy.textContent = "COPY"; }, 1600);
        }).catch(() => {
          const ta = document.createElement("textarea"); ta.value = txt;
          ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta);
          ta.select(); try { document.execCommand("copy"); } catch {}
          document.body.removeChild(ta); copy.textContent = "✓ OK";
          setTimeout(() => { copy.textContent = "COPY"; }, 1600);
        });
      });
      bar.innerHTML = `<div class="cwb-title">TERMINAL</div><span class="cwb-lang">${lang.toUpperCase()}</span>`;
      bar.style.cssText += "display:flex;align-items:center;gap:8px;";
      bar.appendChild(copy);
      const scroll = document.createElement("div"); scroll.className = "code-scroll";
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(bar); scroll.appendChild(pre); wrap.appendChild(scroll);
    });
  }

  /* ── Sidebar index + scroll spy ── */
  function buildIndex(container) {
    const sidebar = $("#sidebar-index");
    if (!sidebar || !container) return;
    sidebar.innerHTML = "";
    const headings = Array.from(container.querySelectorAll("h1,h2,h3"));
    if (!headings.length) return;
    const used = new Set();
    headings.forEach(h => {
      const lvl = parseInt(h.tagName[1]);
      const text = h.textContent.trim(); if (!text) return;
      let id = h.getAttribute("id") || slugify(text) || `s${Math.random().toString(16).slice(2,8)}`;
      if (used.has(id)) { let n=2; while(used.has(`${id}-${n}`))n++; id=`${id}-${n}`; }
      used.add(id); h.setAttribute("id", id);
      const li = document.createElement("li"); li.classList.add(`h${Math.min(lvl,3)}`);
      const a  = document.createElement("a"); a.href = `#${id}`; a.textContent = text;
      a.addEventListener("click", e => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior:"smooth", block:"start" });
        history.replaceState(null,"",`#${id}`);
      });
      li.appendChild(a); sidebar.appendChild(li);
    });
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting)
          sidebar.querySelectorAll("li").forEach(li =>
            li.classList.toggle("active", !!li.querySelector(`a[href="#${e.target.id}"]`))
          );
      });
    }, { rootMargin: "-10% 0px -70% 0px" });
    headings.forEach(h => obs.observe(h));
  }

  /* ── Reading progress ── */
  function initProgress() {
    if (document.getElementById("sps-prog")) return;
    const bar = document.createElement("div"); bar.id = "sps-prog";
    bar.style.cssText = "position:fixed;top:0;left:0;height:3px;width:0%;background:linear-gradient(90deg,#00ffff,#ff2d78,#ffe600);z-index:99998;pointer-events:none;box-shadow:0 0 8px #00ffff;transition:width .08s linear;";
    document.body.appendChild(bar);
    window.addEventListener("scroll", () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (total > 0 ? (scrollY / total) * 100 : 0).toFixed(1) + "%";
    }, { passive: true });
  }

  /* ── Back to top ── */
  function initBackToTop() {
    const btn = $("#volver-arriba"); if (!btn) return;
    window.addEventListener("scroll", () => btn.classList.toggle("show", scrollY > 500), { passive: true });
    btn.addEventListener("click", () => scrollTo({ top:0, behavior:"smooth" }));
  }

  /* ── Post-process ── */
  function postProcess(container) {
    if (!container) return;
    if (window.hljs) container.querySelectorAll("pre code").forEach(b => { try { hljs.highlightElement(b); } catch {} });
    enhanceCode(container);
    enhanceImages(container);
    enhanceVideos(container);
    renderMermaid(container);
    const rt = $("#read-time");
    if (rt) rt.textContent = `${Math.max(1, Math.round(container.textContent.trim().split(/\s+/).length / 200))} MIN READ`;
  }

  /* ── Init ── */
  async function init() {
    const mc = $("#markdown-container"); if (!mc) return;
    setupMarked(); setupMermaid(); initProgress(); initBackToTop();

    const raw = await waitForMdFile();
    if (!raw) { mc.innerHTML = `<p style="color:#ff2d78">No se detectó MD_FILE.</p>`; return; }

    const file = normalizePath(raw);
    let mdText = "";
    try {
      const res = await fetch(file, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${file}`);
      mdText = await res.text();
    } catch(e) {
      mc.innerHTML = `<div style="border:2px solid #ff2d78;padding:20px;font-family:monospace;color:#ff2d78"><b>Error cargando Markdown</b><br>${escapeHtml(e.message)}<br><small>Archivo: <code>${escapeHtml(file)}</code></small></div>`;
      return;
    }

    let html = "";
    try { html = marked.parse(fixStaticPaths(mdText)); }
    catch(e) { mc.innerHTML = `<p style="color:#ff2d78">Error renderizando Markdown: ${escapeHtml(e.message)}</p>`; return; }

    mc.innerHTML = html;
    postProcess(mc);
    buildIndex(mc);

    if (location.hash) {
      const t = document.getElementById(location.hash.slice(1));
      if (t) setTimeout(() => t.scrollIntoView({ behavior:"smooth", block:"start" }), 300);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();