// Página de vendas do Zatti Hub: abre o formulário em modal, grava o lead no Formspree
// e só depois segue para o pagamento. Se o Formspree falhar, a venda não é bloqueada.
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
      var timer = setTimeout(function () { if (controller) controller.abort(); }, 5000);

      fetch(LEADS_URL, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
        signal: controller ? controller.signal : undefined,
      })
        .then(function (r) { return r.ok; })
        .catch(function () { return false; })
        .then(function (ok) {
          clearTimeout(timer);
          var redirect = form.getAttribute("data-redirect");
          if (redirect) {
            window.location.href = redirect;
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
