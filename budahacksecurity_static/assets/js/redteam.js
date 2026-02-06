 const text = "Welcome to my Red Team Documents";
  const speed = 120; // milisegundos por letra
  let i = 0;

  function typeEffect() {
    if (i < text.length) {
      document.getElementById("typewriter").textContent += text.charAt(i);
      i++;
      setTimeout(typeEffect, speed);
    }
  }

  document.addEventListener("DOMContentLoaded", typeEffect);