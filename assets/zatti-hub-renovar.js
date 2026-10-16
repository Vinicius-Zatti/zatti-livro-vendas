// Página de renovação do Zatti Hub (15/10/2026). O link traz só o token da conta (?c=...).
// O Vini confere a conta no Zatti Hub e devolve restaurante, vencimento, preço e oferta; o preço
// nunca vem da página. O botão pede ao Vini o pagamento no Mercado Pago.
(function () {
  var VINI_URL = "https://vini-production-33a6.up.railway.app";
  var token = new URLSearchParams(window.location.search).get("c") || "";
  var el = function (id) { return document.getElementById(id); };

  function invalido() {
    el("renovar-carregando").hidden = true;
    el("renovar-invalido").hidden = false;
  }
  function reais(v) { return "R$ " + Number(v).toFixed(2).replace(".", ","); }
  function dataBR(iso) { return iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) + "/" + iso.slice(0, 4) : ""; }

  if (!/^[A-Za-z0-9_-]{24,64}$/.test(token)) return invalido();

  fetch(VINI_URL + "/site/renovacao/consulta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ c: token }),
  })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (conta) {
      if (!conta) return invalido();
      var hoje = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
      var vencida = conta.vence_em && conta.vence_em < hoje;
      el("renovar-restaurante").textContent = conta.restaurante;
      if (conta.vence_em) {
        el("renovar-vence-rotulo").textContent = vencida ? "Venceu em" : "Vence em";
        el("renovar-vence").textContent = dataBR(conta.vence_em);
      } else {
        el("renovar-vence").parentNode.hidden = true;
      }
      if (conta.destaque) {
        el("renovar-destaque").textContent = conta.destaque;
        el("renovar-destaque").hidden = false;
      }
      el("renovar-parcela").textContent = conta.parcelas + "x de " + reais(conta.preco / conta.parcelas);
      el("renovar-total").textContent = reais(conta.preco) + " por 12 meses";
      el("renovar-carregando").hidden = true;
      el("renovar-conta").hidden = false;
    })
    .catch(invalido);

  el("renovar-botao").addEventListener("click", function () {
    var erro = el("renovar-erro");
    erro.hidden = true;
    if (!el("renovar-termos").checked) {
      erro.textContent = "Marque o aceite dos Termos de uso para continuar.";
      erro.hidden = false;
      return;
    }
    var botao = this;
    botao.disabled = true;
    botao.textContent = "Abrindo o pagamento...";
    fetch(VINI_URL + "/site/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produto: "zatti-hub-renovacao", renovacao: token }),
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && j.init_point) { window.location.href = j.init_point; return; }
        throw new Error("sem link");
      })
      .catch(function () {
        botao.disabled = false;
        botao.textContent = "Renovar agora";
        erro.textContent = "Não consegui abrir o pagamento agora. Tente de novo em instantes ou me chame no WhatsApp.";
        erro.hidden = false;
      });
  });
})();
