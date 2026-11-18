// Raio-X da Reforma do Restaurante (18/11/2026). A conta vem primeiro e aparece na hora; o próximo passo é o
// diagnóstico completo (as mesmas 20 telas de /diagnostico/, pelo mesmo diagnostico.js), que entrega o livro e
// manda o lead ao Vini com origem "reforma" e o resumo do que a pessoa digitou aqui.
(function () {
  var C = window.ReformaCalculo;
  var el = function (id) { return document.getElementById(id); };
  var regime = "";
  var dados = null;

  window.zattiDiagnostico = {
    origem: "reforma",
    extra: function () { return { reforma: C.resumo(regime || "naosei", dados) }; },
  };

  var brl = function (v) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); };
  var pct = function (v) { return v.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + "%"; };
  var linha = function (rotulo, valor, forte) {
    return '<div class="rf-linha' + (forte ? " is-forte" : "") + '"><span>' + rotulo + "</span><b>" + valor + "</b></div>";
  };
  var aviso = function (texto) { return '<p class="rf-aviso">' + texto + "</p>"; };

  function visiveis() {
    el("rf-geral").hidden = regime !== "geral";
    el("rf-app").hidden = el("rf-canal").value !== "app";
    el("rf-cenario").hidden = el("rf-ano").value !== "cenario";
    el("rf-calcular").hidden = !regime;
  }

  function lerItem() {
    var atual = el("rf-atual").value.trim();
    return {
      tipo: el("rf-tipo").value, preco: C.numero(el("rf-preco").value), custo: C.numero(el("rf-custo").value),
      canal: el("rf-canal").value, comissao: C.numero(el("rf-comissao").value),
      ano: el("rf-ano").value === "2026" ? "2026" : "cenario", cheia: C.numero(el("rf-cheia").value),
      atual: atual ? C.numero(atual) : null,
    };
  }

  function htmlGeral(d) {
    var x = C.calcular(d);
    var h = '<p class="eyebrow">Seu Raio-X da Reforma</p><div class="dg-cartao">';
    h += "<p>IBS + CBS sobre este item " + (d.ano === "2026" ? "em 2026" : "no cenário que você digitou") + ":</p>";
    h += '<p class="rf-numero">' + brl(x.imposto) + "</p>";
    h += '<p class="microcopy">Alíquota aplicada: ' + pct(x.aliqEfetiva) +
      (x.reduz ? " (já com a redução de 40% do restaurante)" : " (sem a redução: este tipo de item fica fora dela)") + "</p>";
    h += linha("Preço", brl(d.preco)) + linha("Custo da ficha", brl(d.custo));
    if (d.canal === "app") h += linha("Fica com o app", brl(x.app));
    h += linha("Base do imposto", brl(x.base));
    var desc = d.canal === "app" ? "ficha, app" : "ficha";
    if (d.ano === "2026") {
      h += linha("Sobra depois de " + desc + ", antes dos impostos de hoje", brl(x.antes), true);
    } else {
      h += linha("Sobra depois de " + desc + " e imposto novo", brl(x.sobra), true);
      if (x.precoMesmaSobra) h += linha("Sobra hoje, com " + pct(d.atual) + " de imposto", brl(x.sobraHoje)) +
        linha("Preço para manter a sobra de hoje", brl(x.precoMesmaSobra), true);
    }
    h += "</div>";
    if (d.ano === "2026") h += aviso("2026 é ano de teste: o IBS e a CBS aparecem na nota e a lei prevê abater esse valor do PIS e da Cofins. O peso de verdade começa em 2027. Confirme com o seu contador como fica no seu caso.");
    else h += aviso("Cenário, não conta oficial: a Receita ainda não publicou as alíquotas de 2027 em diante (o Senado é quem fixa). A redução de 40% do restaurante já está na lei.");
    if (d.canal === "app") h += aviso("Se a nota não separar o valor que fica com o app, o imposto sobe para " + brl(x.impostoSemSeparar) + ". A lei só tira esse valor da base quando ele aparece separado.");
    if (!x.reduz) h += aviso("Bebida alcoólica e item comprado pronto não têm a redução de 40%. No combo, o burger e a lata pagam diferente.");
    return h;
  }

  function htmlSimples() {
    var h = '<p class="eyebrow">Seu Raio-X da Reforma</p><div class="dg-cartao"><h2 class="dg-pergunta">No Simples, o que muda para você</h2>';
    h += aviso("Para quem é do Simples eu não mostro número estimado. A calculadora oficial da Receita é do regime geral, e a sua conta depende da sua faixa no Simples. Prefiro não chutar.");
    h += '<ul class="rf-lista">' +
      "<li>Você continua pagando tudo na guia única do Simples (DAS). O IBS e a CBS entram nela no lugar dos impostos antigos.</li>" +
      "<li>A lei abre uma escolha: pagar o IBS e a CBS por fora do Simples. A vantagem disso costuma ser dar crédito a quem compra de você, e em refeição a lei não deixa o cliente tomar esse crédito (LC 214/2025, art. 276). Pese com o seu contador antes de mudar.</li>" +
      "<li>Se o seu fornecedor mudar de regime, o preço de compra pode mudar. Fique de olho na cotação.</li>" +
      "<li>Se um dia sair do Simples: comida feita na sua cozinha paga 40% menos que a alíquota cheia; cerveja e lata revendida pagam cheio.</li>" +
      "</ul></div>";
    return h;
  }

  function htmlNaoSei() {
    return '<p class="eyebrow">Seu Raio-X da Reforma</p><div class="dg-cartao"><h2 class="dg-pergunta">Primeiro, descubra o seu regime</h2>' +
      "<p>Pergunte ao seu contador se a empresa é do Simples Nacional ou do Lucro Presumido ou Real. Está também no cartão do CNPJ e na guia que você paga todo mês: se a guia é o DAS, é Simples.</p>" +
      "<p>Com a resposta, volte aqui e faça a conta do seu item.</p></div>";
  }

  function mostrarRaioX() {
    var html = regime === "geral" ? htmlGeral(dados) : regime === "simples" ? htmlSimples() : htmlNaoSei();
    el("rf-raiox-conteudo").innerHTML = html;
    el("rf-resumo-final").innerHTML = html.replace('<p class="eyebrow">Seu Raio-X da Reforma</p>', "");
    el("rf-entrada").hidden = true;
    el("rf-raiox").hidden = false;
    window.scrollTo(0, 0);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-regime]").forEach(function (b) {
      b.addEventListener("click", function () {
        regime = b.getAttribute("data-regime");
        document.querySelectorAll("[data-regime]").forEach(function (o) { o.classList.toggle("is-active", o === b); });
        visiveis();
      });
    });
    ["rf-canal", "rf-ano"].forEach(function (id) { el(id).addEventListener("change", visiveis); });
    visiveis();

    el("rf-form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var erro = el("rf-erro");
      if (!regime) { erro.textContent = "Escolha como a sua empresa paga imposto hoje."; erro.hidden = false; return; }
      dados = null;
      if (regime === "geral") {
        var d = lerItem();
        var falha = C.conferir(d);
        if (falha) { erro.textContent = falha; erro.hidden = false; return; }
        dados = d;
      }
      erro.hidden = true;
      mostrarRaioX();
    });

    el("rf-refazer").addEventListener("click", function () { el("rf-raiox").hidden = true; el("rf-entrada").hidden = false; window.scrollTo(0, 0); });
    // O botão do diagnóstico (dg-comecar) é ligado pelo diagnostico.js; aqui só some a parte da reforma.
    el("dg-comecar").addEventListener("click", function () { el("rf-raiox").hidden = true; });
  });
})();
