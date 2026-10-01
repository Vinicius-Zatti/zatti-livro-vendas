// Símbolo M.E.G.A. em 3D da página do Zatti Hub.
// Começa encaixado no logo, na tela do celular do topo. No computador, ao rolar, ele se solta,
// voa até a lateral direita e passa a girar com a rolagem. No celular e com redução de movimento,
// fica no logo (no celular ele gira no lugar).
// Posição dos nós é fixa (M esquerda, E topo, G direita, A base); só o conjunto gira.
document.addEventListener("DOMContentLoaded", function () {
  var stage = document.querySelector(".mega3d-stage");
  var anchor = document.querySelector(".m3-anchor");
  var target = document.querySelector(".m3-target");
  if (!stage || !anchor || !target) return;
  var body = stage.querySelector(".mega3d");
  var decor = stage.querySelectorAll(".m3-halo, .m3-orbits");
  var hero = document.querySelector(".hero-hub");
  var closing = document.querySelector(".closing-hub");
  var bands = Array.prototype.slice.call(document.querySelectorAll(".band"));
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var wide = window.matchMedia("(min-width: 1200px)");
  var BASE = 360;
  var cur = { rx: 0, ry: 0, y: 0 };
  // No celular o símbolo fica no logo do topo; fora da tela, a animação para (economiza bateria).
  var anchorVisible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      anchorVisible = entries[0].isIntersecting;
    }).observe(anchor);
  }
  var start = performance.now();

  function flying() { return wide.matches && !reduce; }

  function place() {
    if (flying()) {
      if (stage.parentNode !== document.body) document.body.appendChild(stage);
      stage.classList.add("is-flying");
    } else {
      if (stage.parentNode !== anchor) anchor.appendChild(stage);
      stage.classList.remove("is-flying");
      stage.style.transform = "";
    }
  }
  place();
  if (wide.addEventListener) wide.addEventListener("change", place);

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

  function apply(rx, ry, y) {
    body.style.transform = "translateY(" + y + "px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
    stage.style.setProperty("--brx", -rx + "deg");
    stage.style.setProperty("--bry", -ry + "deg");
  }

  if (reduce) {
    apply(0, 0, 0);
    stage.style.setProperty("--swk", 3.4);
    decor.forEach(function (d) { d.style.opacity = 0; });
    return;
  }

  function frame(now) {
    if (!flying() && !anchorVisible) {
      requestAnimationFrame(frame);
      return;
    }
    var t = (now - start) / 1000;
    var p = pageProgress();
    // Quanto do voo já aconteceu: 0 no topo, 1 depois de rolar ~55% da altura do topo.
    var f = flying() ? ease(clamp(window.scrollY / ((hero ? hero.offsetHeight : 800) * 0.55))) : 1;

    if (flying()) {
      var a = anchor.getBoundingClientRect();
      var g = target.getBoundingClientRect();
      var x = a.left + (g.left - a.left) * f;
      var yy = a.top + (g.top - a.top) * f;
      var w = a.width + (g.width - a.width) * f;
      stage.style.transform = "translate3d(" + x + "px," + yy + "px,0) scale(" + w / BASE + ")";
      stage.classList.toggle("on-light", f > 0.5 && onLightBand(yy + w / 2));
      var r = closing ? closing.getBoundingClientRect().top : Infinity;
      stage.classList.toggle("is-hidden", r < window.innerHeight * 0.75);
    }

    // Parado e de frente dentro do logo; o movimento entra junto com o voo.
    var targetRy = f * (p * 540 + t * 15 - 20);
    var targetRx = f * (-8 + 14 * Math.sin(p * Math.PI * 4));
    var targetY = f * 10 * Math.sin(t * 0.9);
    cur.ry += (targetRy - cur.ry) * 0.1;
    cur.rx += (targetRx - cur.rx) * 0.1;
    cur.y += (targetY - cur.y) * 0.1;
    apply(cur.rx, cur.ry, cur.y);
    decor.forEach(function (d) { d.style.opacity = flying() ? f : 0; });
    // No logo os arcos são proporcionalmente mais grossos; afinam até a espessura do símbolo grande.
    stage.style.setProperty("--swk", flying() ? 3.4 + (1 - 3.4) * f : 3.4);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
});
