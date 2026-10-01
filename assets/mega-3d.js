// Símbolo M.E.G.A. em 3D da página do Zatti Hub.
// Começa encaixado no logo, na tela do celular do topo. Ao rolar, em qualquer tamanho de tela,
// ele se solta, voa até a posição marcada por .m3-target e passa a girar com a rolagem.
// No celular, o destino é a lateral direita, grande e translúcido, atrás da leitura.
// Com redução de movimento ativada, fica parado no logo.
// Posição dos nós é fixa (M esquerda, E topo, G direita, A base); só o conjunto gira.
document.addEventListener("DOMContentLoaded", function () {
  var stage = document.querySelector(".mega3d-stage");
  var anchor = document.querySelector(".m3-anchor");
  var target = document.querySelector(".m3-target");
  if (!stage || !anchor || !target) return;
  var body = stage.querySelector(".mega3d");
  var decor = stage.querySelectorAll(".m3-halo, .m3-orbits");
  var closing = document.querySelector(".closing-hub");
  var bands = Array.prototype.slice.call(document.querySelectorAll(".band"));
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BASE = 360;
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
    stage.style.setProperty("--swk", 3.4);
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
    stage.style.setProperty("--swk", 3.4 + (1 - 3.4) * f);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
});
