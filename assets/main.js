document.addEventListener("DOMContentLoaded", function () {
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var revealTargets = document.querySelectorAll(".reveal, .reveal-stagger");
    if (revealTargets.length && "IntersectionObserver" in window) {
      document.documentElement.classList.add("js-ready");
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );
      revealTargets.forEach(function (el) { io.observe(el); });
      // Safety net: if the observer never fires (backgrounded tab, odd browser
      // edge case), force everything visible after 2.5s so content is never
      // permanently stuck hidden.
      setTimeout(function () {
        revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
      }, 2500);
    }
  }

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
