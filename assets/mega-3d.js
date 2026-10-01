// Símbolo M.E.G.A. em 3D da página do Zatti Hub.
// Começa encaixado no logo, na tela do celular do topo. Ao rolar, em qualquer tamanho de tela,
// ele se solta, voa até a posição marcada por .m3-target e passa a girar com a rolagem.
// No celular, o destino é a lateral direita, grande e translúcido, atrás da leitura.
// Com redução de movimento ativada, fica parado no logo.
// Posição dos nós é fixa (M esquerda, E topo, G direita, A base); só o conjunto gira.
// Marcação do símbolo, usada pelas páginas que só trazem o .m3-anchor (home e consultoria).
var M3_MARKUP = `<div class="mega3d-stage" aria-hidden="true">
      <svg class="m3-defs" width="0" height="0" aria-hidden="true"><defs><linearGradient id="m3-ambar-metal" gradientUnits="userSpaceOnUse" x1="160" y1="160" x2="1040" y2="1040"><stop offset="0" stop-color="#5B320D"/><stop offset=".20" stop-color="#C9882A"/><stop offset=".43" stop-color="#FFF0C7"/><stop offset=".55" stop-color="#F0B85E"/><stop offset=".76" stop-color="#C9882A"/><stop offset="1" stop-color="#4D2808"/></linearGradient><filter id="m3-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="m3-glow-forte" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="13" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs></svg>
      <div class="m3-halo"></div>
      <div class="m3-orbits"><span class="m3-orbit o1"></span><span class="m3-orbit o2"></span></div>
      <div class="mega3d">
        <div class="m3-ring" style="--z:-10px;--o:0.30"><svg viewBox="160 160 880 880"><path d="M 749.05 294.41 A 340.00 340.00 0 0 1 905.59 450.95"/><path d="M 905.59 749.05 A 340.00 340.00 0 0 1 749.05 905.59"/><path d="M 450.95 905.59 A 340.00 340.00 0 0 1 294.41 749.05"/><path d="M 294.41 450.95 A 340.00 340.00 0 0 1 450.95 294.41"/></svg></div>
        <div class="m3-ring" style="--z:-8px;--o:0.42"><svg viewBox="160 160 880 880"><path d="M 749.05 294.41 A 340.00 340.00 0 0 1 905.59 450.95"/><path d="M 905.59 749.05 A 340.00 340.00 0 0 1 749.05 905.59"/><path d="M 450.95 905.59 A 340.00 340.00 0 0 1 294.41 749.05"/><path d="M 294.41 450.95 A 340.00 340.00 0 0 1 450.95 294.41"/></svg></div>
        <div class="m3-ring" style="--z:-6px;--o:0.54"><svg viewBox="160 160 880 880"><path d="M 749.05 294.41 A 340.00 340.00 0 0 1 905.59 450.95"/><path d="M 905.59 749.05 A 340.00 340.00 0 0 1 749.05 905.59"/><path d="M 450.95 905.59 A 340.00 340.00 0 0 1 294.41 749.05"/><path d="M 294.41 450.95 A 340.00 340.00 0 0 1 450.95 294.41"/></svg></div>
        <div class="m3-ring" style="--z:-4px;--o:0.66"><svg viewBox="160 160 880 880"><path d="M 749.05 294.41 A 340.00 340.00 0 0 1 905.59 450.95"/><path d="M 905.59 749.05 A 340.00 340.00 0 0 1 749.05 905.59"/><path d="M 450.95 905.59 A 340.00 340.00 0 0 1 294.41 749.05"/><path d="M 294.41 450.95 A 340.00 340.00 0 0 1 450.95 294.41"/></svg></div>
        <div class="m3-ring" style="--z:-2px;--o:0.78"><svg viewBox="160 160 880 880"><path d="M 749.05 294.41 A 340.00 340.00 0 0 1 905.59 450.95"/><path d="M 905.59 749.05 A 340.00 340.00 0 0 1 749.05 905.59"/><path d="M 450.95 905.59 A 340.00 340.00 0 0 1 294.41 749.05"/><path d="M 294.41 450.95 A 340.00 340.00 0 0 1 450.95 294.41"/></svg></div>
        <div class="m3-ring" style="--z:2px;--o:0.78"><svg viewBox="160 160 880 880"><path d="M 749.05 294.41 A 340.00 340.00 0 0 1 905.59 450.95"/><path d="M 905.59 749.05 A 340.00 340.00 0 0 1 749.05 905.59"/><path d="M 450.95 905.59 A 340.00 340.00 0 0 1 294.41 749.05"/><path d="M 294.41 450.95 A 340.00 340.00 0 0 1 450.95 294.41"/></svg></div>
        <div class="m3-ring" style="--z:4px;--o:0.66"><svg viewBox="160 160 880 880"><path d="M 749.05 294.41 A 340.00 340.00 0 0 1 905.59 450.95"/><path d="M 905.59 749.05 A 340.00 340.00 0 0 1 749.05 905.59"/><path d="M 450.95 905.59 A 340.00 340.00 0 0 1 294.41 749.05"/><path d="M 294.41 450.95 A 340.00 340.00 0 0 1 450.95 294.41"/></svg></div>
        <div class="m3-ring" style="--z:6px;--o:0.54"><svg viewBox="160 160 880 880"><path d="M 749.05 294.41 A 340.00 340.00 0 0 1 905.59 450.95"/><path d="M 905.59 749.05 A 340.00 340.00 0 0 1 749.05 905.59"/><path d="M 450.95 905.59 A 340.00 340.00 0 0 1 294.41 749.05"/><path d="M 294.41 450.95 A 340.00 340.00 0 0 1 450.95 294.41"/></svg></div>
        <div class="m3-ring" style="--z:8px;--o:0.42"><svg viewBox="160 160 880 880"><path d="M 749.05 294.41 A 340.00 340.00 0 0 1 905.59 450.95"/><path d="M 905.59 749.05 A 340.00 340.00 0 0 1 749.05 905.59"/><path d="M 450.95 905.59 A 340.00 340.00 0 0 1 294.41 749.05"/><path d="M 294.41 450.95 A 340.00 340.00 0 0 1 450.95 294.41"/></svg></div>
        <div class="m3-ring" style="--z:10px;--o:0.30"><svg viewBox="160 160 880 880"><path d="M 749.05 294.41 A 340.00 340.00 0 0 1 905.59 450.95"/><path d="M 905.59 749.05 A 340.00 340.00 0 0 1 749.05 905.59"/><path d="M 450.95 905.59 A 340.00 340.00 0 0 1 294.41 749.05"/><path d="M 294.41 450.95 A 340.00 340.00 0 0 1 450.95 294.41"/></svg></div>
        <div class="m3-ring m3-front" style="--z:0px;--o:1.00"><svg viewBox="160 160 880 880"><path d="M 749.05 294.41 A 340.00 340.00 0 0 1 905.59 450.95"/><path d="M 905.59 749.05 A 340.00 340.00 0 0 1 749.05 905.59"/><path d="M 450.95 905.59 A 340.00 340.00 0 0 1 294.41 749.05"/><path d="M 294.41 450.95 A 340.00 340.00 0 0 1 450.95 294.41"/></svg></div>
        <div class="m3-node m3-e"><span class="m3-sphere"></span></div>
        <div class="m3-node m3-g"><span class="m3-sphere"></span></div>
        <div class="m3-node m3-a"><span class="m3-sphere"></span></div>
        <div class="m3-node m3-m"><span class="m3-sphere"></span></div>
      </div>
    </div>`;

document.addEventListener("DOMContentLoaded", function () {
  var anchor = document.querySelector(".m3-anchor");
  if (anchor && !document.querySelector(".mega3d-stage")) anchor.innerHTML = M3_MARKUP;
  var stage = document.querySelector(".mega3d-stage");
  var target = document.querySelector(".m3-target");
  if (!stage || !anchor || !target) return;
  var body = stage.querySelector(".mega3d");
  var decor = stage.querySelectorAll(".m3-halo, .m3-orbits");
  var closing = document.querySelector(".closing-hub");
  var bands = Array.prototype.slice.call(document.querySelectorAll(".band"));
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BASE = 360;
  // Espessura dos arcos no ponto de partida: no logo pequeno do Zatti Hub eles são proporcionalmente
  // mais grossos (3.4); quando o símbolo já começa grande, fica 1.
  var SWK = parseFloat(anchor.getAttribute("data-swk")) || 3.4;
  var cur = { rx: 0, ry: 0, y: 0 };
  var start = performance.now();

  function apply(rx, ry, y) {
    body.style.transform = "translateY(" + y + "px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
    stage.style.setProperty("--brx", -rx + "deg");
    stage.style.setProperty("--bry", -ry + "deg");
  }

  if (reduce) {
    anchor.appendChild(stage);
    apply(0, 0, 0);
    stage.style.setProperty("--swk", SWK);
    decor.forEach(function (d) { d.style.opacity = 0; });
    return;
  }

  document.body.appendChild(stage);
  stage.classList.add("is-flying");

  function clamp(v) { return Math.min(1, Math.max(0, v)); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function pageProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? clamp(window.scrollY / max) : 0;
  }

  function onLightBand(mid) {
    for (var i = 0; i < bands.length; i++) {
      var b = bands[i].getBoundingClientRect();
      if (b.top <= mid && b.bottom >= mid) return bands[i].classList.contains("band-light");
    }
    return false;
  }

  // Opacidade final vem do CSS do destino (translúcido no celular, cheio no computador).
  var endOpacity = 1;
  function readTarget() {
    var v = parseFloat(getComputedStyle(target).getPropertyValue("--m3-op"));
    endOpacity = isNaN(v) ? 1 : v;
  }
  readTarget();
  window.addEventListener("resize", readTarget);

  function frame(now) {
    var t = (now - start) / 1000;
    var vh = window.innerHeight;
    var a = anchor.getBoundingClientRect();
    var g = target.getBoundingClientRect();

    // O voo começa quando o logo do celular passa da metade da tela e dura ~45% da altura da tela.
    var anchorDocTop = a.top + window.scrollY;
    var flightStart = Math.max(0, anchorDocTop - vh * 0.5);
    var f = ease(clamp((window.scrollY - flightStart) / (vh * 0.45)));

    var x = a.left + (g.left - a.left) * f;
    var y = a.top + (g.top - a.top) * f;
    var w = a.width + (g.width - a.width) * f;
    stage.style.transform = "translate3d(" + x + "px," + y + "px,0) scale(" + w / BASE + ")";

    var hideAtEnd = closing && closing.getBoundingClientRect().top < vh * 0.75;
    stage.style.opacity = hideAtEnd ? 0 : 1 + (endOpacity - 1) * f;
    stage.classList.toggle("on-light", f > 0.5 && onLightBand(y + w / 2));

    // Parado e de frente dentro do logo; o movimento entra junto com o voo.
    var p = pageProgress();
    var targetRy = f * (p * 540 + t * 15 - 20);
    var targetRx = f * (-8 + 14 * Math.sin(p * Math.PI * 4));
    var targetY = f * 10 * Math.sin(t * 0.9);
    cur.ry += (targetRy - cur.ry) * 0.1;
    cur.rx += (targetRx - cur.rx) * 0.1;
    cur.y += (targetY - cur.y) * 0.1;
    apply(cur.rx, cur.ry, cur.y);
    decor.forEach(function (d) { d.style.opacity = f; });
    // No logo os arcos são proporcionalmente mais grossos; afinam até a espessura do símbolo grande.
    stage.style.setProperty("--swk", SWK + (1 - SWK) * f);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
});
