(function () {

  /* ══════════════════════════════════════
     CONFIG
  ══════════════════════════════════════ */
  var TYPING_BASE     = 12;
  var TYPING_VARIANCE = 38;
  var LOOP_DELAY      = 4000;
  var DEVIL_DURATION  = 10000;
  var FRAME_INTERVAL  = 280;

  /* ══════════════════════════════════════
     PALETA — rojo consistente con main.css
     FIX: nombres y valores alineados con las
     CSS custom properties de main.css
  ══════════════════════════════════════ */
  var C = {
    primary:    '#00ff41',              /* --green          */
    bright:     '#00ff99',              /* verde brillante  */
    dim:        '#007722',              /* verde oscuro     */
    dark:       '#00aa33',              /* verde medio      */
    err:        '#ff4444',              /* error (rojo)     */
    success:    '#00ff41',              /* éxito terminal   */
    overflow:   '#00ff99',              /* overflow line    */
    devil:      '#00cc44',              /* ASCII devil      */
    matrix1:    '#00ff41',              /* matrix cabeza    */
    matrix2:    'rgba(0,180,50,0.40)',  /* matrix trail     */
    radarRing:  'rgba(0,255,65,0.30)',    /* radar anillos    */
    radarSweep1:'rgba(0,255,65,0.00)',    /* sweep inicio     */
    radarSweep2:'rgba(0,220,55,0.25)',    /* sweep medio      */
    radarSweep3:'rgba(0,255,65,0.60)',    /* sweep punta      */
    radarBlip:  'rgba(0,255,65,',         /* blip (+ opacity) */
    watermark:  '#00ff41',              /* watermark text   */
  };

  /* ══════════════════════════════════════
     SECUENCIA TERMINAL
  ══════════════════════════════════════ */
  var sequence = [
    { text: "[*] Inicializando subsistema...",                delay: 600 },
    { text: "[*] Cargando drivers virtuales: tty0, tty1, tty2", delay: 800 },
    { text: "[*] Preparando entrada de buffer (size=64)",     delay: 700 },
    { text: "[!] Buffer write: " + "R".repeat(64),            delay: 120 },
    { text: "[!] Buffer write: " + "B".repeat(64),            delay: 120 },
    { text: "[!] Buffer write: " + "P".repeat(96),            delay: 80,  cls: "overflow-line" },
    { text: "!! BUFFER OVERFLOW detected !!",                 delay: 500, cls: "err" },
    { text: "",                                               delay: 300 }
  ];

  /* ══════════════════════════════════════
     ASCII DEVIL — pure ASCII, no braille
  ══════════════════════════════════════ */
  var devilFrames = [
    [
      "          `  .  '  `  .  '  `  .  '  `  .  '  `  .  '",
      "       .    __  __  __  __  __  __  __  __  __  __   . ",
      "     '   .-'  \\/  \\/  \\/  \\/  \\/  \\/  \\/  \\/  \\`-.  '",
      "    .   /  ,--/|                              |\\--,  \\  .",
      "     ' | / / | |    ( * )            ( * )    | | \\ | `",
      "    .  |/ /  | |     \\_/              \\_/     | |  \\|  .",
      "     ' |/    \\ |                              | /    |  '",
      "    .  |  /\\  \\|   ___________________________|/  /\\  | .",
      "     ' | /  \\  | /  .--.     .------.  .--.  \\ /  \\ | '",
      "    .  |/ /\\ \\ |/  / >  \\   / ~~~~~~ \\/  < \\  |/ /\\ \\| .",
      "     ' |  /  \\/   /  \\__/   \\__________/\\__/  \\  /   | '",
      "    .  \\ \\   /   / /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\ \\   \\   / / .",
      "     '  \\ \\_/ __/ /  | | | | | | | | | |  \\ \\__\\_/ /  '",
      "    .    \\___/   /   \\ \\ \\ \\ \\ \\ \\ \\ \\ \\   \\   ___/   .",
      "     '       \\__/     \\_\\_\\_\\_\\_\\_\\_\\_\\_\\   \\__/       '",
      "    .           `-.                         .-'           .",
      "     '             `-----.___________.-----'             '",
      "    .                                                      .",
      "          I N V O K E D    B Y    T H E    O V E R F L O W"
    ].join("\n"),

    [
      "          `  .  '  `  .  '  `  .  '  `  .  '  `  .  '",
      "       .    __  __  __  __  __  __  __  __  __  __   . ",
      "     '   .-'  \\/  \\/  \\/  \\/  \\/  \\/  \\/  \\/  \\`-.  '",
      "    .   /  ,--/|                              |\\--,  \\  .",
      "     ' | / / | |    ( @ )            ( @ )    | | \\ | `",
      "    .  |/ /  | |     /^\\              /^\\     | |  \\|  .",
      "     ' |/    \\ |                              | /    |  '",
      "    .  |  /\\  \\|   ___________________________|/  /\\  | .",
      "     ' | /  \\  | /  .--.     .------.  .--.  \\ /  \\ | '",
      "    .  |/ /\\ \\ |/  / >  \\   / ~~~~~~ \\/  < \\  |/ /\\ \\| .",
      "     ' |  /  \\/   /  \\__/   \\__________/\\__/  \\  /   | '",
      "    .  \\ \\   /   / |||||||||||||||||||||||||\\ \\   \\   / / .",
      "     '  \\ \\_/ __/ /  | | | | | | | | | |  \\ \\__\\_/ /  '",
      "    .    \\___/   /   \\ \\ \\ \\ \\ \\ \\ \\ \\ \\   \\   ___/   .",
      "     '       \\__/     \\_\\_\\_\\_\\_\\_\\_\\_\\_\\   \\__/       '",
      "    .           `-.                         .-'           .",
      "     '             `-----.___________.-----'             '",
      "    .                                                      .",
      "          S Y S T E M    C O M P R O M I S E D ! ! !"
    ].join("\n"),

    [
      "          `  .  '  `  .  '  `  .  '  `  .  '  `  .  '",
      "       .    __  __  __  __  __  __  __  __  __  __   . ",
      "     '   .-'  \\/  \\/  \\/  \\/  \\/  \\/  \\/  \\/  \\`-.  '",
      "    .   /  ,--/|                              |\\--,  \\  .",
      "     ' | / / | |    ( X )            ( X )    | | \\ | `",
      "    .  |/ /  | |     ---              ---     | |  \\|  .",
      "     ' |/    \\ |         >_________<          | /    |  '",
      "    .  |  /\\  \\|   ___________________________|/  /\\  | .",
      "     ' | /  \\  | /  .--.     .------.  .--.  \\ /  \\ | '",
      "    .  |/ /\\ \\ |/  / >  \\   / ###### \\/  < \\  |/ /\\ \\| .",
      "     ' |  /  \\/   /  \\__/   \\__________/\\__/  \\  /   | '",
      "    .  \\ \\   /   /  ###################### \\   \\   / / .",
      "     '  \\ \\_/ __/ /  ###################### \\__\\_/ /  '",
      "    .    \\___/   /   \\ \\ \\ \\ \\ \\ \\ \\ \\ \\   \\   ___/   .",
      "     '       \\__/     \\_\\_\\_\\_\\_\\_\\_\\_\\_\\   \\__/       '",
      "    .           `-.                         .-'           .",
      "     '             `-----.___________.-----'             '",
      "    .                                                      .",
      "          R O O T    A C C E S S    G R A N T E D ! ! !"
    ].join("\n")
  ];

  /* ══════════════════════════════════════
     TERMINAL CORE
  ══════════════════════════════════════ */
  function getOutput() { return document.getElementById('term-output'); }

  function createLine(outputEl, cls) {
    var span = document.createElement('span');
    span.className = cls ? cls + ' line' : 'line';
    outputEl.appendChild(span);
    outputEl.scrollTop = outputEl.scrollHeight;
    return span;
  }

  function typeIntoSpan(span, text, cb) {
    var i = 0;
    (function step() {
      if (i < text.length) {
        span.textContent += text.charAt(i++);
        span.parentElement.scrollTop = span.parentElement.scrollHeight;
        setTimeout(step, TYPING_BASE + Math.random() * TYPING_VARIANCE);
      } else { cb && cb(); }
    })();
  }

  function blinkThenRemove(el, className, duration) {
    el.classList.add(className);
    setTimeout(function () { el.classList.remove(className); }, duration);
  }

  function playDevil(outputEl, duration, onDone) {
    var frameSpan = createLine(outputEl, 'devil-frame');
    var idx = 0;

    var frameInterval = setInterval(function () {
      frameSpan.textContent = devilFrames[idx % devilFrames.length];
      outputEl.scrollTop = outputEl.scrollHeight;
      idx++;
    }, FRAME_INTERVAL);

    frameSpan.animate([
      { transform: 'scale(0.95)', opacity: 0 },
      { transform: 'scale(1.02)', opacity: 1 }
    ], { duration: 600, easing: 'ease-out', fill: 'forwards' });

    var scrollInterval = setInterval(function () {
      outputEl.scrollTop = outputEl.scrollHeight;
    }, 200);

    setTimeout(function () {
      clearInterval(frameInterval);
      clearInterval(scrollInterval);
      frameSpan.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' })
        .finished
        .then(function () { frameSpan.remove(); onDone && onDone(); })
        .catch(function () { frameSpan.remove(); onDone && onDone(); });
    }, duration);
  }

  function playSequence(outputEl, seq, i, finishCb) {
    if (i === undefined) i = 0;
    if (i >= seq.length) { finishCb && finishCb(); return; }
    var item = seq[i];
    setTimeout(function () {
      var span = createLine(outputEl, item.cls || '');
      if (!item.text) { playSequence(outputEl, seq, i + 1, finishCb); return; }
      typeIntoSpan(span, item.text, function () {
        if (item.cls === 'err' && /BUFFER OVERFLOW/i.test(item.text)) {
          blinkThenRemove(span, 'blink', 1200);
          setTimeout(function () {
            var accessSpan = createLine(outputEl, 'dim');
            typeIntoSpan(accessSpan, 'accediendo al sistema...', function () {
              playDevil(outputEl, DEVIL_DURATION, function () {
                var successFlow = [
                  { text: "[*] BUFFER EXPLOIT SUCCESS — control remoto obtenido", cls: "success" },
                  { text: "Acceso al sistema con privilegios maximos: completo",   cls: "success" },
                  { text: "",                                                      cls: "" },
                  { text: "root@bytezero:~$ whoami",                              cls: "" },
                  { text: "root",                                                  cls: "dim" }
                ];
                (function playSuccess(j) {
                  if (j >= successFlow.length) { playSequence(outputEl, seq, i + 1, finishCb); return; }
                  var s = successFlow[j];
                  var sSpan = createLine(outputEl, s.cls || '');
                  typeIntoSpan(sSpan, s.text, function () {
                    setTimeout(function () { playSuccess(j + 1); }, 120);
                  });
                })(0);
              });
            });
          }, 1200);
        } else {
          playSequence(outputEl, seq, i + 1, finishCb);
        }
      });
    }, item.delay || 150);
  }

  function startAnimation() {
    var out = getOutput();
    if (!out) return;
    out.innerHTML = '';
    playSequence(out, sequence, 0, function () {
      setTimeout(startAnimation, LOOP_DELAY);
    });
  }


  /* ══════════════════════════════════════
     MATRIX RAIN — rojo fuego
  ══════════════════════════════════════ */
  function initMatrix() {
    var canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var chars = '0123456789ABCDEF<>[]{}|\\/?!@#$%^&*~`+-=_:;.,ROOTEXPLOITHACKPWNED';
    var fontSize = 14;
    var drops = [];

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      drops = Array(Math.floor(canvas.width / fontSize)).fill(1);
    }
    resize();
    window.addEventListener('resize', resize);

    setInterval(function () {
      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontSize + 'px monospace';
      drops.forEach(function (y, i) {
        var ch = chars[Math.floor(Math.random() * chars.length)];
        if (y === 1)    { ctx.fillStyle = C.matrix1; }         /* cabeza: rojo vivo  */
        else if (y < 4) { ctx.fillStyle = C.primary; }         /* cuerpo: rojo base  */
        else            { ctx.fillStyle = C.matrix2; }         /* trail:  rojo suave */
        ctx.fillText(ch, i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }, 50);
  }


  /* ══════════════════════════════════════
     RADAR — rojo consistente
  ══════════════════════════════════════ */
  function initRadar() {
    var canvas = document.getElementById('radar-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = 180, H = 180, cx = W / 2, cy = H / 2, R = 80;
    var angle = 0;
    var dots = [];
    for (var d = 0; d < 14; d++) {
      dots.push({ a: Math.random() * Math.PI * 2, r: Math.random() * R * 0.85, life: 0 });
    }

    setInterval(function () {
      ctx.clearRect(0, 0, W, H);

      /* rings + crosshairs */
      ctx.strokeStyle = C.radarRing;
      ctx.lineWidth = 0.9;
      [R * 0.3, R * 0.6, R].forEach(function (r) {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      });

      /* crosshairs */
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();

      /* sweep */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      var grad = ctx.createLinearGradient(0, 0, R, 0);
      grad.addColorStop(0,   C.radarSweep1);
      grad.addColorStop(0.6, C.radarSweep2);
      grad.addColorStop(1,   C.radarSweep3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, -0.65, 0);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      /* blips */
      dots.forEach(function (dot) {
        var da = (angle - dot.a + Math.PI * 4) % (Math.PI * 2);
        if (da < 0.18) dot.life = 1;
        if (dot.life > 0) {
          var x = cx + Math.cos(dot.a) * dot.r;
          var y = cy + Math.sin(dot.a) * dot.r;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = C.radarBlip + dot.life + ')';
          ctx.shadowColor = '#00ff41';
          ctx.shadowBlur  = 8;
          ctx.fill();
          ctx.shadowBlur  = 0;
          dot.life = Math.max(0, dot.life - 0.012);
        }
      });

      angle = (angle + 0.025) % (Math.PI * 2);
    }, 33);
  }


  /* ══════════════════════════════════════
     CLASSIFIED WATERMARK
  ══════════════════════════════════════ */
  function initWatermark() {
    var el = document.getElementById('classified-watermark');
    if (!el) return;
    var words = ['CLASSIFIED', 'TOP SECRET', 'CONFIDENTIAL', 'RESTRICTED', 'NOFORN', 'EYES ONLY'];
    var html = '';
    for (var r = 0; r < 14; r++) {
      for (var c = 0; c < 7; c++) {
        var word = words[(r + c) % words.length];
        html += '<span style="top:' + (r * 8 - 2) + '%;left:' + (c * 16 - 2) + '%">' + word + '</span>';
      }
    }
    el.innerHTML = html;
  }


  /* ══════════════════════════════════════
     STATUS BARS
  ══════════════════════════════════════ */
  function initStatusBars() {
    var clockEl = document.getElementById('status-clock');
    var encEl   = document.getElementById('enc-label');
    var pktEl   = document.getElementById('pkt');

    if (clockEl) {
      setInterval(function () {
        var now = new Date();
        var pad = function (n) { return String(n).padStart(2, '0'); };
        clockEl.textContent =
          pad(now.getUTCHours()) + ':' + pad(now.getUTCMinutes()) + ':' + pad(now.getUTCSeconds()) +
          ' UTC | NODE: TOR-' + String(Math.floor(Math.random() * 9000 + 1000));
      }, 1000);
    }

    if (encEl) {
      setInterval(function () {
        encEl.style.opacity = encEl.style.opacity === '0.25' ? '1' : '0.25';
      }, 800);
    }

    if (pktEl) {
      var packets = 0;
      setInterval(function () {
        packets += Math.floor(Math.random() * 120 + 40);
        pktEl.textContent = packets.toLocaleString();
      }, 300);
    }
  }


  /* ══════════════════════════════════════
     BOOT
  ══════════════════════════════════════ */
  startAnimation();
  initMatrix();
  initRadar();
  initWatermark();
  initStatusBars();

})();