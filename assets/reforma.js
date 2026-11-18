// Raio-X da Reforma do Restaurante (18/11/2026, versão 2). Preço do burger e faturamento entram; depois do
// cadastro sai "hoje você paga X, depois da reforma Y" e a faixa do Simples. O cadastro vira lead no Vini
// (origem reforma). O diagnóstico completo é convite opcional e já abre com o contato preenchido.
(function () {
  var C = window.ReformaCalculo;
  var VINI_LEADS_URL = "https://vini-production-33a6.up.railway.app/site/lead";
  var FORMSPREE_URL = "https://formspree.io/f/mzdnkdbv";
  var PRODUTO = "Raio-X da Reforma (grátis)";
  var el = function (id) { return document.getElementById(id); };
  var regime = "simples";
  var dados = null, conta = null, contato = null;

  // O diagnóstico desta página manda a origem reforma e o resumo da conta (ver diagnostico.js).
  window.zattiDiagnostico = {
    origem: "reforma",
    extra: function () { return { reforma: dados ? C.resumo(dados, conta) : "" }; },
  };

  function usuarioInstagram(v) {
    var u = String(v || "").trim().replace(/^https?:\/\//i, "").replace(/^(?:www\.)?instagram\.com\//i, "").replace(/^@/, "").split(/[/?#]/)[0].toLowerCase();
    return /^[a-z0-9._]{2,30}$/.test(u) ? u : "";
  }

  function lerConta() {
    return { preco: C.numero(el("rf-preco").value), mensal: C.numero(el("rf-mensal").value), regime: regime,
      atual: C.numero(el("rf-atual").value) };
  }

  function atualizarAtual() {
    var d = lerConta();
    el("rf-atual-bloco").hidden = !C.precisaAtual(d);
  }

  function falha(id, texto) { el(id).textContent = texto; el(id).hidden = !texto; }

  // Vini e Formspree (reserva); o resultado nunca espera mais de 2,5 s.
  function enviar(corpo) {
    var vini = fetch(VINI_LEADS_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) })
      .then(function (r) { return !!r && r.ok; }).catch(function () { return false; });
    var fd = new FormData();
    Object.keys(corpo).forEach(function (k) { if (corpo[k]) fd.append(k, corpo[k]); });
    var reserva = fetch(FORMSPREE_URL, { method: "POST", body: fd, headers: { Accept: "application/json" } }).catch(function () { return null; });
    return Promise.race([Promise.all([vini, reserva]), new Promise(function (r) { setTimeout(r, 2500); })]);
  }

  function cartao(rotulo, x, destaque) {
    return '<div class="rf-ad' + (destaque ? " is-destaque" : "") + '"><p class="rf-ad-rotulo">' + rotulo + "</p>" +
      '<p class="rf-ad-valor">' + C.brl(x.burger) + ' <small>por burger</small></p>' +
      '<p class="rf-ad-mes">' + C.brl(x.mes) + " por mês · " + C.pct(x.pct) + "</p></div>";
  }

  function tabela(r) {
    var h = '<table class="rf-faixas"><thead><tr><th>Faixa</th><th>Faturamento por ano</th><th>Paga</th></tr></thead><tbody>';
    C.FAIXAS.forEach(function (f, i) {
      var de = i === 0 ? 0 : C.FAIXAS[i - 1].ate;
      var sua = r.faixa && r.faixa.indice === i;
      // Alíquota efetiva do começo ao fim da faixa (LC 123, Anexo I).
      var paga = i === 0 ? "4,00%" : C.pct(C.faixaSimples(de + 1).efetiva) + " a " + C.pct(C.faixaSimples(f.ate).efetiva);
      h += '<tr' + (sua ? ' class="is-sua"' : "") + "><td>" + (i + 1) + (sua ? " · você" : "") + "</td><td>" +
        (i === 0 ? "até " : "") + (i === 0 ? "" : mil(de) + " a ") + mil(f.ate) + "</td><td>" + paga + (i === 5 ? " + ICMS por fora" : "") + "</td></tr>";
    });
    return h + "</tbody></table>";
  }
  function mil(v) { return v >= 1000000 ? "R$ " + (v / 1000000).toFixed(1).replace(".", ",").replace(",0", "") + " mi" : "R$ " + Math.round(v / 1000) + " mil"; }

  function mostrarRaioX() {
    var d = dados, r = conta, h = '<p class="eyebrow">Seu antes e depois</p>';
    if (r.noSimples) {
      h += '<div class="rf-ad-grade">' + cartao("Hoje, no Simples", r.hoje) + cartao("Depois da reforma, ficando no Simples", r.depois) + "</div>";
      h += '<p class="rf-curto">No Simples a sua guia continua com o mesmo peso: a CBS e o IBS entram no lugar do PIS, da Cofins e do ICMS dentro dela. O desconto de 40% do restaurante não vale no Simples, só fora dele.</p>';
      h += '<div class="rf-ad-grade">' + cartao("Se sair do Simples (cenário, já com o desconto de 40%)", r.fora, true) + "</div>";
      h += '<p class="rf-curto">Você sai do Simples ao passar de R$ 4,8 milhões por ano. ' +
        (r.faltaTeto > 0 ? "Faltam " + C.brl(r.faltaTeto) + " por ano para isso." : "") + "</p>";
      h += '<p class="eyebrow mt-md">Faixas do Simples</p>' + tabela(r);
      if (r.faixa.indice < C.FAIXAS.length - 1) h += '<p class="rf-curto">Você está na faixa ' + r.faixa.numero + ". Faltam " + C.brl(r.faixa.faltaProxima) + " por ano para a próxima, e a alíquota sobe junto.</p>";
    } else {
      h += '<div class="rf-ad-grade">' + cartao(r.acimaDoTeto && d.regime !== "geral" ? "Hoje, fora do Simples" : "Hoje", r.hoje) + cartao("Depois da reforma (cenário)", r.depois, true) + "</div>";
      var dif = r.depois.burger - r.hoje.burger;
      h += '<p class="rf-curto">' + (dif >= 0 ? "São " + C.brl(dif) + " a mais" : "São " + C.brl(-dif) + " a menos") + " de imposto em cada burger, " + C.brl(Math.abs(r.depois.mes - r.hoje.mes)) + " por mês.</p>";
      if (r.acimaDoTeto && d.regime !== "geral") h += '<p class="rf-curto">Com mais de R$ 4,8 milhões por ano o restaurante já não cabe no Simples.</p>';
    }
    h += '<p class="rf-curto">Fora do Simples a conta é sobre o preço cheio. Parte volta como crédito do imposto das suas compras, então o peso real tende a ser menor.</p>';
    h += '<p class="rf-aviso">2027 em diante é cenário: o Senado ainda fixa a alíquota oficial. Em 2026, ano de teste, a nota mostra só 1% (CBS 0,9% e IBS 0,1%).</p>';
    el("rf-raiox-conteudo").innerHTML = h;
    el("rf-entrada").hidden = true;
    el("rf-raiox").hidden = false;
    window.scrollTo(0, 0);
  }

  function preencherContatoDoDiagnostico() {
    var f = el("dg-form");
    if (!f || !contato) return;
    f.elements.namedItem("nome").value = contato.nome;
    f.elements.namedItem("whatsapp").value = contato.whatsapp;
    f.elements.namedItem("negocio").value = contato.negocio;
    f.elements.namedItem("instagram").value = "@" + contato.instagram;
    f.elements.namedItem("aceite").checked = true;
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-regime]").forEach(function (b) {
      b.addEventListener("click", function () {
        regime = b.getAttribute("data-regime");
        document.querySelectorAll("[data-regime]").forEach(function (o) { o.classList.toggle("is-active", o === b); });
        atualizarAtual();
      });
    });
    el("rf-mensal").addEventListener("input", atualizarAtual);

    el("rf-form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var d = lerConta();
      var erro = C.conferir(d);
      falha("rf-erro", erro);
      if (erro) return;
      dados = d; conta = C.calcular(d);
      if (contato) { mostrarRaioX(); return; }
      el("rf-form").hidden = true;
      el("rf-cadastro").hidden = false;
      el("rf-nome").focus();
    });

    el("rf-cadastro").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var c = { nome: el("rf-nome").value.trim(), whatsapp: el("rf-whatsapp").value.replace(/\D/g, ""), negocio: el("rf-negocio").value.trim(), instagram: usuarioInstagram(el("rf-instagram").value) };
      var erro = c.nome.length < 2 ? "Escreva o seu nome." : c.whatsapp.length < 10 || c.whatsapp.length > 13 ? "Confira o WhatsApp com DDD."
        : c.negocio.length < 2 ? "Escreva o nome do restaurante." : !c.instagram ? "Escreva o @ do Instagram do restaurante."
        : !el("rf-aceite").checked ? "Marque o aceite para eu poder te chamar no WhatsApp." : "";
      falha("rf-erro-cadastro", erro);
      if (erro) return;
      var btn = el("rf-cadastro").querySelector("button[type=submit]");
      btn.disabled = true; btn.textContent = "Calculando...";
      contato = c;
      enviar({ nome: c.nome, whatsapp: c.whatsapp, negocio: c.negocio, instagram: c.instagram, produto: PRODUTO, origem: "reforma",
        pagina: window.location.pathname, faturamento_atual: C.faixaDiagnostico(dados.mensal), aceite: "sim", reforma: C.resumo(dados, conta) })
        .then(function () { preencherContatoDoDiagnostico(); mostrarRaioX(); });
    });

    el("rf-refazer").addEventListener("click", function () {
      el("rf-raiox").hidden = true; el("rf-entrada").hidden = false; el("rf-cadastro").hidden = true; el("rf-form").hidden = false; window.scrollTo(0, 0);
    });
    // O botão do diagnóstico (dg-comecar) é ligado pelo diagnostico.js; aqui só some a parte da reforma.
    el("dg-comecar").addEventListener("click", function () { el("rf-raiox").hidden = true; });
  });
})();
