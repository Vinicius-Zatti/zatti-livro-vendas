// Livro grátis (06/11/2026): o formulário da oferta manda o lead ao Vini (que entrega o PDF no WhatsApp e
// registra no CRM) e ao Formspree como reserva, e leva a pessoa à página de obrigado.
// Usa enviarLeadVini de zatti-hub.js. Nunca segura a pessoa mais de ~8 s.
document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("livro-form");
  if (!form) return;
  var FORMSPREE_URL = "https://formspree.io/f/mzdnkdbv";
  var erro = document.getElementById("lf-erro");

  function mostrarErro(texto) { erro.textContent = texto; erro.hidden = false; }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var el = form.elements;
    var nome = el.namedItem("nome").value.trim();
    var whats = el.namedItem("whatsapp").value.replace(/\D/g, "");
    if (nome.length < 2) return mostrarErro("Escreva o seu nome.");
    if (whats.length < 10 || whats.length > 13) return mostrarErro("Confira o WhatsApp com DDD.");
    if (!el.namedItem("faturamento_atual").value) return mostrarErro("Escolha a faixa de faturamento.");
    if (!el.namedItem("dificuldade").value) return mostrarErro("Escolha a sua maior dor hoje.");
    if (!el.namedItem("aceite").checked) return mostrarErro("Marque o aceite para o livro chegar no seu WhatsApp.");
    erro.hidden = true;

    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Enviando...";

    var vini = enviarLeadVini(form, null);
    var fd = new FormData(form);
    fd.append("origem", origemDaVisita());
    var reserva = fetch(FORMSPREE_URL, { method: "POST", body: fd, headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok; })
      .catch(function () { return false; });
    var limite = new Promise(function (r) { setTimeout(function () { r("tempo"); }, 8000); });

    Promise.race([Promise.all([vini, reserva]), limite]).then(function (res) {
      var chegou = res === "tempo" || !!res[0] || res[1];
      if (!chegou) {
        btn.disabled = false;
        btn.textContent = "Quero o livro grátis";
        return mostrarErro("Não consegui enviar agora. Tenta de novo em instantes.");
      }
      var primeiro = nome.split(/\s+/)[0];
      window.location.href = "/livro/obrigado/?nome=" + encodeURIComponent(primeiro);
    });
  });
});
