// Home: vídeo do topo com barra de progresso acelerada e sol M.E.G.A. com módulos em órbita.
(function () {
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Vídeo. Sempre tenta começar com som. Quando o navegador recusa, toca sem som e o som entra
  // no primeiro toque ou clique em qualquer ponto da página, recomeçando do início.
  var caixa = document.getElementById("video-quem-sou");
  if (caixa) {
    var v = caixa.querySelector("video");
    var barra = caixa.querySelector(".video-barra i");
    var cta = document.querySelector(".video-cta");

    // Metade da barra no 1º quarto do vídeo, mais 1/4 no 2º quarto e o último 1/4 na metade final.
    function barraDe(p) {
      if (p <= 0.25) return p * 2;
      if (p <= 0.5) return 0.5 + (p - 0.25);
      return 0.75 + (p - 0.5) * 0.5;
    }
    function desenha() {
      if (v.duration) barra.style.transform = "scaleX(" + barraDe(Math.min(1, v.currentTime / v.duration)) + ")";
      if (!v.paused && !v.ended) requestAnimationFrame(desenha);
    }
    function estado() {
      caixa.classList.toggle("mudo", v.muted);
      caixa.classList.toggle("pausado", v.paused && !v.ended);
    }
    v.addEventListener("play", function () { caixa.classList.remove("fim"); if (cta) cta.classList.remove("chama"); estado(); desenha(); });
    v.addEventListener("pause", estado);
    v.addEventListener("volumechange", estado);
    v.addEventListener("ended", function () {
      barra.style.transform = "scaleX(1)";
      caixa.classList.add("fim");
      if (cta) cta.classList.add("chama");
      estado();
    });

    function comSom() {
      v.muted = false;
      var t = v.play();
      if (t && t.catch) t.catch(function () { v.muted = true; v.play().catch(function () { caixa.classList.add("pausado"); }); });
    }
    function ligaSom(e) {
      if (!v.muted) return;
      if (e.target && e.target.closest && e.target.closest("a")) return; // quem clicou em link está saindo
      var r = caixa.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= window.innerHeight) return; // vídeo fora da tela não recomeça
      v.currentTime = 0;
      v.muted = false;
      v.play().catch(function () { v.muted = true; v.play().catch(function () {}); });
    }
    document.addEventListener("click", ligaSom);
    document.addEventListener("keydown", ligaSom);
    caixa.addEventListener("click", function () {
      if (v.muted) return; // quem liga o som é o ligaSom, logo em seguida
      if (v.ended) { v.currentTime = 0; v.play(); return; }
      if (v.paused) v.play(); else v.pause();
    });

    var economia = navigator.connection && navigator.connection.saveData;
    if (reduz || economia) { v.muted = true; caixa.classList.add("pausado"); }
    else comSom();
    estado();
  }

  // Sol M.E.G.A.: o símbolo fica parado (M esquerda, E topo, G direita, A base); só os módulos giram.
  var sol = document.getElementById("sol-mega");
  if (!sol) return;
  var svg = sol.querySelector(".sol-orbitas");
  var ORBITAS = [
    { a: 0.47, b: 0.40, giro: -16, vel: 0.11 },
    { a: 0.40, b: 0.33, giro: 18, vel: -0.14 },
    { a: 0.32, b: 0.47, giro: 8, vel: 0.09 }
  ];
  var itens = [].slice.call(sol.querySelectorAll(".orb")).map(function (el) {
    return { el: el, o: ORBITAS[+el.getAttribute("data-o")], fase: +el.getAttribute("data-f") * Math.PI * 2 };
  });
  var L = 0, A = 0, K = 1;

  function medir() {
    L = sol.clientWidth;
    A = sol.clientHeight;
    K = L < 520 ? 0.84 : 1; // no celular a órbita encolhe para o nome do módulo não sair da tela
    svg.setAttribute("viewBox", "0 0 " + L + " " + A);
    var h = "";
    ORBITAS.forEach(function (o) {
      h += '<ellipse cx="' + L / 2 + '" cy="' + A / 2 + '" rx="' + o.a * L * K + '" ry="' + o.b * A + '" transform="rotate(' + o.giro + " " + L / 2 + " " + A / 2 + ')"/>';
    });
    svg.innerHTML = h;
  }
  function desenhaOrbitas(seg) {
    itens.forEach(function (it) {
      var t = it.fase + seg * it.o.vel;
      var x = it.o.a * L * K * Math.cos(t), y = it.o.b * A * Math.sin(t);
      var g = it.o.giro * Math.PI / 180;
      var px = L / 2 + x * Math.cos(g) - y * Math.sin(g);
      var py = A / 2 + x * Math.sin(g) + y * Math.cos(g);
      var frente = (Math.sin(t) + 1) / 2;
      it.el.style.transform = "translate(" + px + "px," + py + "px) translate(-50%,-50%) scale(" + (0.86 + 0.14 * frente) + ")";
      it.el.style.opacity = 0.62 + 0.38 * frente;
      it.el.style.zIndex = frente > 0.5 ? 4 : 1;
    });
  }
  medir();
  desenhaOrbitas(0);
  window.addEventListener("resize", function () { medir(); desenhaOrbitas(performance.now() / 1000); });

  var visivel = false;
  function quadro(agora) {
    if (!visivel) return;
    desenhaOrbitas(agora / 1000);
    requestAnimationFrame(quadro);
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      var ligar = e[0].isIntersecting;
      if (ligar && !visivel && !reduz) { visivel = true; requestAnimationFrame(quadro); }
      if (!ligar) visivel = false;
    }).observe(sol);
    // O símbolo que voa no fundo sai de cena aqui, para não haver dois símbolos juntos.
    var bloco = document.getElementById("apresenta-hub");
    new IntersectionObserver(function (e) {
      var palco = document.querySelector(".mega3d-stage");
      if (palco) palco.classList.toggle("fora-de-cena", e[0].isIntersecting);
    }).observe(bloco);
  }
})();
