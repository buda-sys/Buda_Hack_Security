(function () {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function escapeHtml(s) {
    return (s ?? "")
      .toString()
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Normaliza rutas para XAMPP / Vercel / subcarpetas
  function normalizePath(p) {
    if (!p) return p;

    let file = p.toString().trim();

    // Quitar backslashes
    file = file.replaceAll("\\", "/");

    // Caso PHP antiguo
    file = file.replaceAll("/budahacksecurity/uploads/", "uploads/");

    // Si viene como /uploads/xxx.md
    if (file.startsWith("/uploads/")) file = file.replace("/uploads/", "uploads/");

    // Si viene como ./uploads/xxx.md
    if (file.startsWith("./")) file = file.slice(2);

    // Evitar dobles //
    file = file.replace(/\/{2,}/g, "/");

    return file;
  }

  // Reescribe rutas antiguas del proyecto PHP a rutas estáticas dentro del markdown
  function fixStaticPaths(text) {
    if (!text) return text;

    text = text.replaceAll("/budahacksecurity/uploads/", "uploads/");

    text = text.replaceAll('src="/uploads/', 'src="uploads/');
    text = text.replaceAll("src='/uploads/", "src='uploads/");
    text = text.replaceAll('href="/uploads/', 'href="uploads/');
    text = text.replaceAll("href='/uploads/", "href='uploads/");

    return text;
  }

  // Convierte headings en ids estables
  function slugifyHeading(str) {
    return (str ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Espera a que exista MD_FILE (robusto)
  async function waitForMdFile(timeoutMs = 15000) {
    const start = Date.now();

    // si ya existe, listo
    if (window.MD_FILE) return window.MD_FILE;

    // si ver.html lo setea tarde, esperamos
    while (!window.MD_FILE) {
      if (Date.now() - start > timeoutMs) return null;
      await new Promise((r) => setTimeout(r, 60));
    }
    return window.MD_FILE;
  }

  // ---------- Marked config ----------
  function setupMarked() {
    if (!window.marked) return;

    if (window.hljs) {
      marked.setOptions({
        gfm: true,
        breaks: false,
        headerIds: false, // nosotros manejamos ids
        mangle: false,
        highlight: function (code, lang) {
          try {
            if (lang && hljs.getLanguage(lang)) {
              return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
          } catch {
            return escapeHtml(code);
          }
        },
      });
    } else {
      marked.setOptions({
        gfm: true,
        breaks: false,
        headerIds: false,
        mangle: false,
      });
    }
  }

  // ---------- Mermaid ----------
  function setupMermaid() {
    if (!window.mermaid) return;
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "strict",
      });
    } catch (e) {
      console.warn("Mermaid init error:", e);
    }
  }

  // ---------- Lightbox ----------
  function openLightbox(src) {
    const lb = $("#lightbox");
    if (!lb) return;
    const img = lb.querySelector("img");
    if (!img) return;

    img.src = src;
    lb.style.display = "flex";
    lb.classList.add("show");
  }

  function closeLightbox() {
    const lb = $("#lightbox");
    if (!lb) return;
    lb.classList.remove("show");
    lb.style.display = "none";
    const img = lb.querySelector("img");
    if (img) img.src = "";
  }

  function initLightbox() {
    const lb = $("#lightbox");
    if (!lb) return;
    lb.style.display = "none";

    lb.addEventListener("click", () => closeLightbox());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  // ---------- Volver arriba ----------
  function initBackToTop() {
    const btn = $("#volver-arriba");
    if (!btn) return;

    const toggle = () => {
      btn.style.display = window.scrollY > 500 ? "flex" : "none";
    };

    btn.style.display = "none";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.cursor = "pointer";

    window.addEventListener("scroll", toggle);
    toggle();

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---------- Mermaid Render ----------
  function renderMermaidInside(container) {
    if (!window.mermaid) return;

    const codeBlocks = Array.from(
      container.querySelectorAll("pre code.language-mermaid, pre code.lang-mermaid")
    );

    codeBlocks.forEach((codeEl) => {
      const parentPre = codeEl.closest("pre");
      if (!parentPre) return;

      const graphDef = codeEl.textContent || "";
      const wrapper = document.createElement("div");
      wrapper.className = "mermaid";
      wrapper.textContent = graphDef;

      parentPre.replaceWith(wrapper);
    });

    try {
      mermaid.run({ querySelector: `#${container.id} .mermaid` });
    } catch (e) {
      console.warn("Mermaid render error:", e);
    }
  }

  // ---------- MP4 Support ----------
  function enhanceVideos(container) {
    if (!container) return;

    // 1) Convertir links .mp4 en <video>
    const links = Array.from(container.querySelectorAll('a[href$=".mp4"]'));
    links.forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;

      const video = document.createElement("video");
      video.controls = true;
      video.preload = "metadata";
      video.style.width = "100%";
      video.style.borderRadius = "12px";
      video.style.margin = "18px 0";
      video.style.boxShadow = "0 0 25px rgba(255,0,51,.25)";
      video.src = href;

      // Reemplaza el link por el video
      const p = a.closest("p");
      if (p && p.textContent.trim() === a.textContent.trim()) {
        p.replaceWith(video);
      } else {
        a.replaceWith(video);
      }
    });

    // 2) Si alguien pegó <img src="...mp4"> por error, lo convertimos
    const weird = Array.from(container.querySelectorAll('img[src$=".mp4"]'));
    weird.forEach((img) => {
      const src = img.getAttribute("src");
      if (!src) return;

      const video = document.createElement("video");
      video.controls = true;
      video.preload = "metadata";
      video.style.width = "100%";
      video.style.borderRadius = "12px";
      video.style.margin = "18px 0";
      video.style.boxShadow = "0 0 25px rgba(255,0,51,.25)";
      video.src = src;

      img.replaceWith(video);
    });
  }

  // ---------- Sidebar Index ----------
  function buildSidebarIndex(mdContainer) {
    const sidebar = $("#sidebar-index");
    if (!sidebar || !mdContainer) return;

    sidebar.innerHTML = "";

    const headings = Array.from(mdContainer.querySelectorAll("h1, h2, h3, h4"));
    if (!headings.length) {
      sidebar.innerHTML = `<li class="text-secondary">Sin índice</li>`;
      return;
    }

    const usedIds = new Set();

    headings.forEach((h) => {
      const level = parseInt(h.tagName.replace("H", ""), 10);
      const text = (h.textContent || "").trim();
      if (!text) return;

      let id =
        h.getAttribute("id") ||
        slugifyHeading(text) ||
        `sec-${Math.random().toString(16).slice(2)}`;

      if (usedIds.has(id)) {
        let i = 2;
        while (usedIds.has(`${id}-${i}`)) i++;
        id = `${id}-${i}`;
      }

      usedIds.add(id);
      h.setAttribute("id", id);

      const li = document.createElement("li");
      li.classList.add(`level-${Math.min(level, 3)}`);
      li.style.marginLeft = level >= 2 ? `${(level - 1) * 10}px` : "0px";

      const a = document.createElement("a");
      a.href = `#${id}`;
      a.textContent = text;

      a.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById(id);
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${id}`);
      });

      li.appendChild(a);
      sidebar.appendChild(li);
    });
  }

  // ---------- Postprocess ----------
  function postProcessRendered(container) {
    if (!container) return;

    // Images: lazy + lightbox
    const imgs = Array.from(container.querySelectorAll("img"));
    imgs.forEach((img) => {
      img.loading = "lazy";
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => openLightbox(img.src));
    });

    // Highlight
    if (window.hljs) {
      Array.from(container.querySelectorAll("pre code")).forEach((block) => {
        try {
          hljs.highlightElement(block);
        } catch {}
      });
    }

    // Mermaid
    renderMermaidInside(container);

    // MP4
    enhanceVideos(container);
  }

  // ---------- Load + Render Markdown ----------
  async function loadAndRenderMarkdown() {
    const mdContainer = $("#markdown-container");
    if (!mdContainer) return;

    setupMarked();
    setupMermaid();
    initLightbox();
    initBackToTop();

    const raw = await waitForMdFile();
    if (!raw) {
      mdContainer.innerHTML = `<p class="text-danger">No se pudo detectar el archivo Markdown (MD_FILE).</p>`;
      return;
    }

    const file = normalizePath(raw);

    let mdText = "";
    try {
      const res = await fetch(file, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${file}`);
      mdText = await res.text();
    } catch (e) {
      mdContainer.innerHTML = `
        <div class="alert alert-danger">
          <b>Error cargando Markdown</b><br>
          ${escapeHtml(e.message || e)}<br><br>
          <small>
            Tips: verifica que el archivo exista y se abra directo en el navegador:
            <code>${escapeHtml(file)}</code>
          </small>
        </div>`;
      return;
    }

    mdText = fixStaticPaths(mdText);

    let html = "";
    try {
      html = marked.parse(mdText);
    } catch (e) {
      mdContainer.innerHTML = `<p class="text-danger">Error renderizando Markdown: ${escapeHtml(e.message || e)}</p>`;
      return;
    }

    mdContainer.innerHTML = html;

    postProcessRendered(mdContainer);
    buildSidebarIndex(mdContainer);

    // hash scroll
    if (location.hash) {
      const id = location.hash.slice(1);
      const t = document.getElementById(id);
      if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // ---------- Init ----------
  document.addEventListener("DOMContentLoaded", () => {
    loadAndRenderMarkdown();
  });
})();
