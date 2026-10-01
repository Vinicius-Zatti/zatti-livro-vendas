// Símbolo M.E.G.A. em 3D que acompanha a rolagem da página do Zatti Hub.
// Posição dos nós é fixa (M esquerda, E topo, G direita, A base); só o conjunto gira.
document.addEventListener("DOMContentLoaded", function () {
  var stage = document.querySelector(".mega3d-stage");
  if (!stage) return;
  var body = stage.querySelector(".mega3d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fixedMode = window.matchMedia("(min-width: 1200px)");
  var bands = Array.prototype.slice.call(document.querySelectorAll(".band"));
  var closing = document.querySelector(".closing-hub");

  var cur = { rx: -8, ry: -20, y: 0 };
  var start = performance.now();

  function progress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  }

  function onLightBand() {
    var rect = stage.getBoundingClientRect();
    var mid = rect.top + rect.height / 2;
    for (var i = 0; i < bands.length; i++) {
      var b = bands[i].getBoundingClientRect();
      if (b.top <= mid && b.bottom >= mid) return bands[i].classList.contains("band-light");
    }
    return false;
  }

  function closingVisible() {
    if (!closing) return false;
    var r = closing.getBoundingClientRect();
    return r.top < window.innerHeight * 0.75;
  }

  function apply(rx, ry, y) {
    body.style.transform = "translateY(" + y + "px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
    stage.style.setProperty("--brx", -rx + "deg");
    stage.style.setProperty("--bry", -ry + "deg");
  }

  if (reduce) {
    apply(-8, -20, 0);
    return;
  }

  function frame(now) {
    var p = progress();
    var t = (now - start) / 1000;
    // Uma volta e meia ao longo da página, mais um giro lento contínuo (24 s por volta).
    var targetRy = p * 540 + t * 15 - 20;
    var targetRx = -8 + 14 * Math.sin(p * Math.PI * 4);
    var targetY = 10 * Math.sin(t * 0.9);
    cur.ry += (targetRy - cur.ry) * 0.08;
    cur.rx += (targetRx - cur.rx) * 0.08;
    cur.y += (targetY - cur.y) * 0.08;
    apply(cur.rx, cur.ry, cur.y);

    stage.classList.toggle("on-light", onLightBand());
    stage.classList.toggle("is-hidden", fixedMode.matches && closingVisible());
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
});
