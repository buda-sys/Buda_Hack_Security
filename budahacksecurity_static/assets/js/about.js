/* =========================
   TYPEWRITER
========================= */
const text = "I am Buda-sys";
const speed = 120;
let i = 0;

function typeEffect() {
  if (i < text.length) {
    document.getElementById("typewriter").textContent += text.charAt(i);
    i++;
    setTimeout(typeEffect, speed);
  }
}

document.addEventListener("DOMContentLoaded", typeEffect);

/* =========================
   MATRIX — ABOUT HERO (ROJO)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("matrix-about");
  if (!canvas) return;

  const hero = canvas.closest(".about-hero");
  const ctx = canvas.getContext("2d");

  let w, h, columns, drops;
  const fontSize = 16;

  function resize() {
    w = canvas.width = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
    columns = Math.floor(w / fontSize);
    drops = new Array(columns).fill(1);
  }

  resize();
  window.addEventListener("resize", resize);

  function draw() {
    ctx.fillStyle = "rgba(2,6,23,0.25)";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#ff0033";
    ctx.font = fontSize + "px monospace";

    drops.forEach((y, i) => {
      const char = Math.random() > 0.5 ? "1" : "0";
      ctx.fillText(char, i * fontSize, y * fontSize);

      if (y * fontSize > h && Math.random() > 0.97) {
        drops[i] = 0;
      }
      drops[i]++;
    });

    requestAnimationFrame(draw);
  }

  draw();
});
