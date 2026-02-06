(function () {
  const TYPING_BASE = 12;
  const TYPING_VARIANCE = 40;
  const LOOP_DELAY = 4000;
  const DEVIL_DURATION = 10000; // 10s
  const FRAME_INTERVAL = 250;

  const sequence = [
    { text: "[*] Inicializando subsistema...", delay: 600 },
    { text: "[*] Cargando drivers virtuales: tty0, tty1, tty2", delay: 800 },
    { text: "[*] Preparando entrada de buffer (size=64)", delay: 700 },
    { text: "[!] Buffer write: " + "R".repeat(64), delay: 120 },
    { text: "[!] Buffer write: " + "B".repeat(64), delay: 120 },
    { text: "[!] Buffer write: " + "P".repeat(96), delay: 80, cls: "overflow-line" },
    { text: "!! BUFFER OVERFLOW detected !!", delay: 500, cls: "err" },
    { text: "", delay: 300 }
  ];

  const devilFrames = [
`  ⠀⠀⠀⠀⠀⠀⠀⠀⢀⡠⠖⠊⠉⠉⠉⠉⢉⠝⠉⠓⠦⣄⠀⠀⠀⠀⠀⠀⠀⠀
  ⠀⠀⠀⠀⠀⠀⢀⡴⣋⠀⠀⣤⣒⡠⢀⠀⠐⠂⠀⠤⠤⠈⠓⢦⡀⠀⠀⠀⠀⠀
  ⠀⠀⠀⠀⠀⣰⢋⢬⠀⡄⣀⠤⠄⠀⠓⢧⠐⠥⢃⣴⠤⣤⠀⢀⡙⣆⠀⠀⠀⠀
  ⠀⠀⠀⠀⢠⡣⢨⠁⡘⠉⠀⢀⣤⡀⠀⢸⠀⢀⡏⠑⠢⣈⠦⠃⠦⡘⡆⠀⠀⠀
  ⠀⠀⠀⠀⢸⡠⠊⠀⣇⠀⠀⢿⣿⠇⠀⡼⠀⢸⡀⠠⣶⡎⠳⣸⡠⠃⡇⠀⠀⠀
  ⢀⠔⠒⠢⢜⡆⡆⠀⢿⢦⣤⠖⠒⢂⣽⢁⢀⠸⣿⣦⡀⢀⡼⠁⠀⠀⡇⠒⠑⡆
  ⡇⠀⠐⠰⢦⠱⡤⠀⠈⠑⠪⢭⠩⠕⢁⣾⢸⣧⠙⡯⣿⠏⠠⡌⠁⡼⢣⠁⡜⠁
  ⠈⠉⠻⡜⠚⢀⡏⠢⢆⠀⠀⢠⡆⠀⠀⣀⣀⣀⡀⠀⠀⠀⠀⣼⠾⢬⣹⡾⠀
  ⠀⠀⠀⠉⠀⠉⠀⠀⠈⣇⠀⠀⠀⣴⡟⢣⣀⡔⡭⣳⡈⠃⣼⠀⠀⠀⣼⣧⠀
  ⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⠀⠀⣸⣿⣿⣿⡿⣷⣿⣿⣷⠀⡇⠀⠀⠀⠙⠊⠀
  ⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣠⠀⢻⠛⠭⢏⣑⣛⣙⣛⠏⠀⡇⠀⠀⠀⠀⠀⠀⠀
  ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡏⠠⠜⠓⠉⠉⠀⠐⢒⡒⡍⠐⡇⠀⠀⠀⠀⠀⠀⠀
  ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠒⠢⠤⣀⣀⣀⣀⣘⠧⠤⠞⠁⠀⠀⠀⠀⠀⠀⠀`
  ];

  function getOutput() {
    return document.getElementById('term-output');
  }

  function createLine(outputEl, cls = '') {
    const span = document.createElement('span');
    span.className = cls ? cls + ' line' : 'line';
    outputEl.appendChild(span);
    // no newline appended — flujo continuo tipo terminal
    outputEl.scrollTop = outputEl.scrollHeight;
    return span;
  }

  function typeIntoSpan(span, text, cb) {
    let i = 0;
    (function step() {
      if (i < text.length) {
        span.textContent += text.charAt(i++);
        span.parentElement.scrollTop = span.parentElement.scrollHeight;
        setTimeout(step, TYPING_BASE + Math.random() * TYPING_VARIANCE);
      } else {
        cb && cb();
      }
    })();
  }

  // blink utility: add class, then remove after ms
  function blinkThenRemove(el, className, duration) {
    el.classList.add(className);
    setTimeout(() => el.classList.remove(className), duration);
  }

  function playDevil(outputEl, duration, onDone) {
    const frameSpan = createLine(outputEl, 'devil-frame');
    let idx = 0;

    const frameInterval = setInterval(() => {
      frameSpan.textContent = devilFrames[idx % devilFrames.length];
      outputEl.scrollTop = outputEl.scrollHeight;
      idx++;
    }, FRAME_INTERVAL);

    const rotAnim = frameSpan.animate([
      { transform: 'rotate(0deg) scale(0.98)', opacity: 0 },
      { transform: 'rotate(360deg) scale(1.02)', opacity: 1 }
    ], { duration, easing: 'cubic-bezier(.22,.8,.25,1)', iterations: 1, fill: 'forwards' });

    const scrollInterval = setInterval(() => outputEl.scrollTop = outputEl.scrollHeight, 200);

    setTimeout(() => {
      clearInterval(frameInterval);
      clearInterval(scrollInterval);
      rotAnim.finished?.catch(()=>{}).finally(() => {
        frameSpan.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' })
          .finished.then(() => {
            frameSpan.remove();
            onDone && onDone();
          })
          .catch(() => { frameSpan.remove(); onDone && onDone(); });
      });
    }, duration);
  }

  function playSequence(outputEl, seq, i = 0, finishCb) {
    if (i >= seq.length) return finishCb && finishCb();
    const item = seq[i];
    setTimeout(() => {
      const span = createLine(outputEl, item.cls || '');
      if (!item.text) return playSequence(outputEl, seq, i + 1, finishCb);

      typeIntoSpan(span, item.text, () => {
        // si la línea es el error de overflow, hacemos blink y luego seguimos con acceso+carabela
        if (item.cls === 'err' && /BUFFER OVERFLOW/i.test(item.text)) {
          // hacer parpadeo en la línea de error
          blinkThenRemove(span, 'blink', 1200); // 1.2s de blink
          // después del parpadeo, agregamos la línea de acceso y la carabela
          setTimeout(() => {
            const accessSpan = createLine(outputEl, 'dim');
            typeIntoSpan(accessSpan, 'accediendo al sistema...', () => {
              playDevil(outputEl, DEVIL_DURATION, () => {
                // mensaje final desde perspectiva atacante
                const successFlow = [
                  { text: "[*] BUFFER EXPLOIT SUCCESS — control remoto obtenido", cls: "success" },
                  { text: "Acceso al sistema con privilegios máximos: completo", cls: "success" },
                  { text: "", cls: "" },
                  { text: "root@bytezero:~$ whoami", cls: "" },
                  { text: "root", cls: "dim" }
                ];
                (function playSuccess(j) {
                  if (j >= successFlow.length) return playSequence(outputEl, seq, i + 1, finishCb);
                  const s = successFlow[j];
                  const sSpan = createLine(outputEl, s.cls || '');
                  typeIntoSpan(sSpan, s.text, () => setTimeout(() => playSuccess(j + 1), 120));
                })(0);
              });
            });
          }, 1200); // espera al blink terminado
        } else {
          // flujo normal
          playSequence(outputEl, seq, i + 1, finishCb);
        }
      });
    }, item.delay || 150);
  }

  function startAnimation() {
    const out = getOutput();
    if (!out) return;
    out.innerHTML = '';
    playSequence(out, sequence, 0, () => setTimeout(startAnimation, LOOP_DELAY));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startAnimation);
  else startAnimation();
})();
