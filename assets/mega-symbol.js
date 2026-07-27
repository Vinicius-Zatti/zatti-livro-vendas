import { animate, scroll } from "https://cdn.jsdelivr.net/npm/motion@12.42.2/+esm";

var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var hero = document.querySelector(".hero");
var symbol = document.querySelector(".mega-symbol");
var isDesktop = window.matchMedia("(min-width: 900px)").matches;

if (hero && symbol && !reduceMotion && isDesktop) {
  scroll(
    animate(
      symbol,
      {
        rotateY: [-22, 22, -22, 22, -22],
        rotateX: [6, -6, 6, -6, 6],
        y: [0, -30, 0, -30, 0]
      },
      { ease: "linear" }
    ),
    { target: hero, offset: ["start start", "end end"] }
  );
}
