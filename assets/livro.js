// Página do livro: o livro 3D gira de leve conforme a rolagem e flutua devagar.
document.addEventListener("DOMContentLoaded", function () {
  var book = document.querySelector(".book3d");
  if (!book || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var cur = 0;
  var start = performance.now();
  function frame(now) {
    var vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, window.scrollY / vh));
    var t = (now - start) / 1000;
    cur += (p - cur) * 0.1;
    var ry = -28 + cur * 40 + Math.sin(t * 0.6) * 3;
    var rx = 6 - cur * 4;
    var y = Math.sin(t * 0.9) * 6;
    book.style.transform = "translateY(" + y + "px) rotateY(" + ry + "deg) rotateX(" + rx + "deg)";
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
});
