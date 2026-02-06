// ───────────────────────────────────────────────
//  MÉTRICA DE CONOCIMIENTO - BUDA-SYS DASHBOARD
// ───────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", function() {
  const ctx = document.getElementById('skillsChart');

  // ──────────────── HABILIDADES ────────────────
  const skills = {
    "Red Team": 20,
    "Blue Team": 5,
    "OSINT": 10,
    "Pentesting": 62,
    "Scripting": 44,
    "Networking": 35
  };

  const avg = Math.round(
    Object.values(skills).reduce((a, b) => a + b) / Object.values(skills).length
  );
  const overall = document.getElementById("overall-skill");
  if (overall) overall.textContent = avg + "%";

  // Colores neón por habilidad
  const neonColors = {
    "Red Team": "#ff0044",
    "Blue Team": "#00aaff",
    "OSINT": "#00ff88",
    "Pentesting": "#ffaa00",
    "Scripting": "#ff00ff",
    "Networking": "#00ffff"
  };

  // ──────────────── GRÁFICO RADAR ────────────────
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: Object.keys(skills),
      datasets: [{
        label: 'Nivel actual',
        data: Object.values(skills),
        fill: true,
        backgroundColor: 'rgba(0,255,136,0.1)',
        borderColor: '#00ff88',
        pointBackgroundColor: '#00ff88',
        borderWidth: 2,
      }]
    },
    options: {
      animation: {
        duration: 1800,
        easing: 'easeOutQuart'
      },
      scales: {
        r: {
          angleLines: { color: '#1e3a8a' },
          grid: { color: '#1e3a8a' },
          pointLabels: {
            color: (ctx) => {
              const label = ctx.label;
              return neonColors[label] || '#e0f2fe';
            },
            font: {
              size: 12,
              family: 'MartianMono Nerd Font',
              weight: 'bold'
            }
          },
          ticks: { display: false, suggestedMin: 0, suggestedMax: 100 }
        }
      },
      plugins: {
        legend: { display: false }
      }
    },
    plugins: [{
      // plugin para sombra / glow del texto
      id: 'neonGlow',
      beforeDraw: (chart) => {
        const ctx = chart.ctx;
        ctx.save();
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 15;
        ctx.restore();
      }
    }]
  });
});


new Chart(ctx, {
  type: 'radar',
  data: {
    labels: Object.keys(skills),
    datasets: [{
      label: 'Nivel actual',
      data: Object.values(skills),
      fill: true,
      backgroundColor: 'rgba(0,255,136,0.08)',
      borderColor: '#00ff88',
      pointBackgroundColor: '#00ff88',
      borderWidth: 2
    }]
  },
  options: {
    maintainAspectRatio: false, // <--- permitir que el canvas use el tamaño del contenedor
    aspectRatio: 1,             // <--- relación 1:1 (cuadrado)
    animation: {
      duration: 1500,
      easing: 'easeOutQuart'
    },
    scales: {
      r: {
        angleLines: { color: '#1e3a8a' },
        grid: { color: '#1e3a8a' },
        pointLabels: {
          color: (ctx) => {
            const label = ctx.label;
            return neonColors[label] || '#e0f2fe';
          },
          font: { size: 12, family: 'MartianMono Nerd Font', weight: 'bold' }
        },
        ticks: { display: false, suggestedMin: 0, suggestedMax: 100 }
      }
    },
    plugins: {
      legend: { display: false }
    }
  }
});
