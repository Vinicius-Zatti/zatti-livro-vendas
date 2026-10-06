// Quem chega à consultoria vindo do diagnóstico de 5 minutos (?de=diagnostico) já respondeu e já
// tem o resultado: não vê a pesquisa de novo, vê o próximo passo (conversa no WhatsApp). Pedido de
// Vinícius em 06/10/2026. Sem o parâmetro, a página segue igual.
(function () {
  var veio = false;
  try { veio = new URLSearchParams(window.location.search).get("de") === "diagnostico"; } catch (e) { veio = false; }
  if (!veio) return;
  var dados = null;
  try { dados = JSON.parse(window.sessionStorage.getItem("zattiDiagnostico") || "null"); } catch (e) { dados = null; }

  function escapar(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  document.addEventListener("DOMContentLoaded", function () {
    var msg = dados
      ? "Oi, Vinícius! Fiz o diagnóstico de 5 minutos (nota geral " + dados.geral + ", ponto mais fraco " + dados.fraco + ") e quero conversar sobre a consultoria."
      : "Oi, Vinícius! Fiz o diagnóstico de 5 minutos e quero conversar sobre a consultoria.";
    var link = "https://wa.me/5511963898411?text=" + encodeURIComponent(msg);
    var secao = document.getElementById("pesquisa");
    if (secao) {
      secao.innerHTML =
        '<div class="wrap container-narrow">' +
        '<p class="eyebrow">Você já fez o diagnóstico</p>' +
        '<h2 class="h2-section">O próximo passo é uma conversa comigo.</h2>' +
        (dados ? '<p class="lede mt-sm">Seu restaurante ficou com nota geral <b>' + escapar(dados.geral) + '</b> e o ponto mais fraco foi <b>' + escapar(dados.fraco) + "</b>.</p>" : "") +
        '<p class="mt-sm">Não precisa responder mais nada. Em 30 minutos eu olho o seu resultado com você e mostro por onde começar no seu caso.</p>' +
        '<a class="btn mt-md" href="' + link + '" target="_blank" rel="noopener">Falar com o Vinícius no WhatsApp</a>' +
        "</div>";
    }
    document.querySelectorAll('a[href="#pesquisa"]').forEach(function (a) {
      if (a.classList.contains("nav-cta")) return;
      a.textContent = "Falar sobre o meu diagnóstico";
    });
    var micro = document.querySelector(".hero-actions .microcopy");
    if (micro) micro.textContent = "Você já respondeu o diagnóstico. Agora é só conversar.";
  });
})();
