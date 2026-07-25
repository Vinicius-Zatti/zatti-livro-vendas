document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var mobile = document.querySelector(".nav-mobile");
  if (toggle && mobile) {
    toggle.addEventListener("click", function () {
      mobile.classList.toggle("is-open");
    });
  }

  document.querySelectorAll(".qualify").forEach(function (block) {
    var buttons = block.querySelectorAll("[data-answer]");
    var responses = block.querySelectorAll(".qualify-response");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        var answer = btn.getAttribute("data-answer");
        responses.forEach(function (r) {
          r.hidden = r.getAttribute("data-answer-for") !== answer;
        });
      });
    });
  });

  document.querySelectorAll(".lead-form, .survey-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      var originalText = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Enviando..."; }
      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          if (!response.ok) throw new Error("submit failed");
          var success = document.createElement("div");
          success.className = "form-success";
          success.style.display = "block";
          success.textContent = "Recebido. Vou te chamar no WhatsApp em breve.";
          form.replaceWith(success);
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = originalText; }
          alert("Não consegui enviar agora. Tenta de novo ou chama direto no WhatsApp.");
        });
    });
  });
});
