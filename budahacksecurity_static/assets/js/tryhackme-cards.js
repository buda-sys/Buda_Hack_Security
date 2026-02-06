/* ==========================================================================
   tryhackme-cards.js
   - Genera cards desde docs.json
   - Filtros por dificultad + búsqueda
   - Masonry simple (posicionamiento absoluto)
   Requiere en tryhackme.html:
     - #masonry (contenedor)
     - #searchInput (input)
     - .category-btn (botones con data-category)
   ========================================================================== */

(function () {
  "use strict";

  const masonry = document.getElementById("masonry");
  const searchInput = document.getElementById("searchInput");
  const categoryButtons = Array.from(document.querySelectorAll(".category-btn"));

  if (!masonry) return;

  // ---- Helpers ----
  const esc = (s) =>
    (s ?? "")
      .toString()
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  function dificultadSlug(raw) {
    const d = (raw || "").toString().trim().toLowerCase();
    const map = {
      "fácil": "easy",
      "facil": "easy",
      "easy": "easy",
      "medio": "medium",
      "media": "medium",
      "mediana": "medium",
      "medium": "medium",
      "difícil": "hard",
      "dificil": "hard",
      "hard": "hard",
      "loco": "crazy",
      "crazy": "crazy",
    };
    return map[d] || d || "easy";
  }

  function diffBadgeClass(diffSlug) {
    switch (diffSlug) {
      case "easy":
        return "badge text-bg-success";
      case "medium":
        return "badge text-bg-warning";
      case "hard":
        return "badge text-bg-danger";
      case "crazy":
        return "badge text-bg-info";
      default:
        return "badge text-bg-secondary";
    }
  }

  function niceDate(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("es-PA", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return iso;
    }
  }

  function defaultThumb(category) {
    const c = (category || "").toLowerCase();
    if (c.includes("try")) return "assets/img/autothumbs/tryhackme.png";
    if (c.includes("hack")) return "assets/img/autothumbs/htb.png";
    if (c.includes("docker")) return "assets/img/autothumbs/dockerlabs.png";
    return "assets/img/autothumbs/default.png";
  }

  // ---- Render cards ----
  function makeCard(doc) {
    // Solo TryHackMe aquí:
    const cat = doc.category || "TryHackMe";
    const diffSlug = dificultadSlug(doc.difficulty);
    const dateText = niceDate(doc.date);
    const title = doc.title || "Write-up";
    const file = doc.file || "";
    const slug = doc.slug || "";

    // Si el json ya trae thumb, úsalo; si no, usa default
    const thumb = doc.thumb ? doc.thumb : defaultThumb(cat);

    // descripción: si no existe, usa el nombre del archivo
    const desc = doc.description || (file ? `Documento: ${file}` : "Sin descripción.");

    return `
      <div class="col-12 col-md-6 col-lg-4 wu-card-wrap"
           data-category="${esc(diffSlug)}"
           data-search="${esc((title + " " + desc).toLowerCase())}">
        <div class="card bg-dark text-light h-100 border-danger shadow-sm">

          <div class="p-2 d-flex justify-content-between align-items-center">
            <span class="${diffBadgeClass(diffSlug)}">${esc(diffSlug.toUpperCase())}</span>
            <small class="text-secondary">${esc(dateText)}</small>
          </div>

          <div class="text-center px-3">
            <img src="${esc(thumb)}" alt="thumb"
                 style="max-height:150px; width:100%; object-fit:contain;"
                 class="mb-2">
          </div>

          <div class="card-body">
            <h5 class="card-title">${esc(title)}</h5>
            <p class="card-text text-secondary" style="min-height:60px;">
              ${esc(desc).slice(0, 160)}${desc.length > 160 ? "..." : ""}
            </p>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-secondary">${esc(cat)}</small>
              <a class="btn btn-danger btn-sm"
                 href="ver.html?doc=${encodeURIComponent(slug)}">
                 Ver
              </a>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  async function loadDocs() {
    const res = await fetch("docs.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar docs.json");
    const docs = await res.json();
    return Array.isArray(docs) ? docs : [];
  }

  // ---- Simple Masonry layout (solo si tu contenedor lo necesita) ----
  function layoutMasonry() {
    // Si tu CSS ya maneja el grid, puedes comentar esto.
    // Pero lo dejo para que se vea "compacto" si usas position-relative masonry.
    const items = Array.from(masonry.children);
    if (window.innerWidth <= 768) {
      masonry.style.height = "auto";
      items.forEach((el) => {
        el.style.position = "static";
        el.style.transform = "none";
      });
      return;
    }

    const gap = 16;
    const colWidth = items[0]?.offsetWidth || 300;
    const containerWidth = masonry.clientWidth || window.innerWidth;
    const cols = Math.max(1, Math.floor(containerWidth / (colWidth + gap)));
    const heights = new Array(cols).fill(0);

    items.forEach((el) => {
      // ocultos no cuentan
      if (el.style.display === "none") return;

      el.style.position = "absolute";

      const minH = Math.min(...heights);
      const col = heights.indexOf(minH);

      const x = col * (colWidth + gap);
      const y = heights[col];

      el.style.transform = `translate(${x}px, ${y}px)`;
      heights[col] += el.offsetHeight + gap;
    });

    masonry.style.height = Math.max(...heights, 0) + "px";
  }

  // ---- Filters/Search ----
  let activeCategory = "all";
  let query = "";

  function applyFilters() {
    const cards = Array.from(masonry.children);

    cards.forEach((card) => {
      const c = (card.getAttribute("data-category") || "").toLowerCase();
      const s = (card.getAttribute("data-search") || "").toLowerCase();

      const matchCategory = activeCategory === "all" || c === activeCategory;
      const matchSearch = !query || s.includes(query);

      card.style.display = matchCategory && matchSearch ? "" : "none";
    });

    layoutMasonry();
  }

  // ---- Init ----
  document.addEventListener("DOMContentLoaded", async () => {
    masonry.innerHTML = `<div class="text-center text-secondary py-4">Cargando write-ups...</div>`;

    let docs = [];
    try {
      docs = await loadDocs();
    } catch (e) {
      masonry.innerHTML = `<div class="text-center text-danger py-4">Error: ${esc(e.message || e)}</div>`;
      return;
    }

    // Solo TryHackMe
    const thmDocs = docs.filter((d) => (d.category || "").toLowerCase().includes("try"));

    if (!thmDocs.length) {
      masonry.innerHTML = `<div class="text-center text-secondary py-4">No hay write-ups TryHackMe aún.</div>`;
      return;
    }

    // Construye cards
    masonry.innerHTML = thmDocs.map(makeCard).join("");

    // Si quieres que el contenedor sea masonry absoluto:
    masonry.style.position = "relative";

    // Eventos filtros
    categoryButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        categoryButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        activeCategory = (btn.getAttribute("data-category") || "all").toLowerCase();
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        query = (searchInput.value || "").trim().toLowerCase();
        applyFilters();
      });
    }

    // Layout inicial
    window.addEventListener("load", layoutMasonry);
    window.addEventListener("resize", layoutMasonry);
    setTimeout(layoutMasonry, 50);

    // Aplicar filtros inicial
    applyFilters();
  });
})();
