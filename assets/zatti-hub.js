// Páginas de venda: abre o formulário em modal, manda o lead ao Formspree (e-mail) e ao Vini
// (WhatsApp de Vinícius + CRM) em paralelo, e só depois segue para o pagamento.
// Pagamento: o Vini cria o Checkout Pro do Mercado Pago (volta para a página de obrigado). Se o
// Vini falhar ou demorar mais de ~3 s, cai no link fixo do Mercado Pago (data-redirect).
// Nenhuma falha bloqueia a venda.
var VINI_URL = "https://vini-production-33a6.up.railway.app";
var VINI_LEADS_URL = VINI_URL + "/site/lead";
var VINI_CHECKOUT_URL = VINI_URL + "/site/checkout";
var CAMPOS_LEAD = ["nome", "whatsapp", "faturamento_atual", "faturamento_desejado", "produto", "negocio", "faturamento", "cmv", "dre", "dependencia", "dificuldade"];

function origemDaVisita() {
  try { return new URLSearchParams(window.location.search).get("origem") || "site"; } catch (e) { return "site"; }
}

// Envia o lead ao Vini. Devolve uma promessa que nunca rejeita: o id do lead, ou null.
function enviarLeadVini(form, produtoPadrao, signal) {
  var dados = new FormData(form);
  var corpo = { origem: origemDaVisita(), pagina: window.location.pathname };
  CAMPOS_LEAD.forEach(function (c) { var v = dados.get(c); if (v) corpo[c] = String(v); });
  if (!corpo.produto) corpo.produto = produtoPadrao || "Site";
  return fetch(VINI_LEADS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
    signal: signal,
  })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) { return (j && j.id) || null; })
    .catch(function () { return null; });
}

// Pede ao Vini o link do Checkout Pro. Devolve o init_point, ou null em até ~3 s.
function criarCheckout(produto, leadId) {
  var controller = "AbortController" in window ? new AbortController() : null;
  var timer = setTimeout(function () { if (controller) controller.abort(); }, 3000);
  return fetch(VINI_CHECKOUT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ produto: produto, lead_id: leadId || undefined }),
    signal: controller ? controller.signal : undefined,
  })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) { clearTimeout(timer); return (j && j.init_point) || null; })
    .catch(function () { clearTimeout(timer); return null; });
}

document.addEventListener("DOMContentLoaded", function () {
  var LEADS_URL = "https://formspree.io/f/mzdnkdbv";

  document.querySelectorAll("[data-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var modal = document.getElementById(btn.getAttribute("data-open"));
      if (modal && modal.showModal) modal.showModal();
    });
  });

  document.querySelectorAll(".lead-modal").forEach(function (modal) {
    modal.querySelector(".modal-close").addEventListener("click", function () { modal.close(); });
    modal.addEventListener("click", function (e) { if (e.target === modal) modal.close(); });
  });

  document.querySelectorAll(".checkout-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      var originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Enviando...";

      var data = new FormData(form);
      data.append("origem", window.location.search || "direto");
      var controller = "AbortController" in window ? new AbortController() : null;
      var timer = setTimeout(function () { if (controller) controller.abort(); }, 2500);
      var signal = controller ? controller.signal : undefined;

      var formspree = fetch(LEADS_URL, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
        signal: signal,
      })
        .then(function (r) { return r.ok; })
        .catch(function () { return false; });
      var vini = enviarLeadVini(form, null, signal);

      Promise.all([formspree, vini]).then(function (res) {
        clearTimeout(timer);
        var ok = res[0] || !!res[1];
        var leadId = res[1];
        var redirect = form.getAttribute("data-redirect");
        var produto = form.getAttribute("data-produto");
        if (redirect) {
          btn.textContent = "Abrindo o pagamento...";
          var checkout = produto ? criarCheckout(produto, leadId) : Promise.resolve(null);
          checkout.then(function (url) { window.location.href = url || redirect; });
          return;
        }
        if (!ok) {
          btn.disabled = false;
          btn.textContent = originalText;
          var erro = form.querySelector(".form-error") || document.createElement("p");
          erro.className = "form-note form-error";
          erro.textContent = "Não consegui enviar agora. Tenta de novo em instantes.";
          form.appendChild(erro);
          return;
        }
        var success = document.createElement("div");
        success.className = "form-success";
        success.textContent = form.getAttribute("data-success");
        form.replaceWith(success);
      });
    });
  });
});
