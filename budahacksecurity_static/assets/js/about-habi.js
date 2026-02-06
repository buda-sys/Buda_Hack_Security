
  // Inicializar tooltips de bootstrap
  document.addEventListener('DOMContentLoaded', function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (el) {
      new bootstrap.Tooltip(el);
    });

    // Copiar nombre al portapapeles al hacer clic en la herramienta
    document.querySelectorAll('.tool, .tool-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name') || btn.textContent.trim();
        navigator.clipboard?.writeText(name).then(() => {
          // feedback visual rápido: cambiar texto del tooltip
          const bsTooltip = bootstrap.Tooltip.getInstance(btn);
          if (bsTooltip) {
            bsTooltip.setContent({ '.tooltip-inner': 'Copiado: ' + name });
            bsTooltip.show();
            setTimeout(() => {
              bsTooltip.setContent({ '.tooltip-inner': btn.getAttribute('title') });
            }, 1200);
          }
        }).catch(()=> {
          // si no se puede copiar, mostramos el tooltip normal
          const bsTooltip = bootstrap.Tooltip.getInstance(btn);
          bsTooltip?.show();
        });
      });
    });
  });

