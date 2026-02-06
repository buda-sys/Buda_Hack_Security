document.addEventListener("DOMContentLoaded", function() {
  const bars = document.querySelectorAll('.progress-bar.neon');
  bars.forEach(bar => {
    const value = bar.getAttribute('data-value');
    setTimeout(() => {
      bar.style.width = value + '%';
    }, 300); // retardo leve para efecto más suave
  });
});