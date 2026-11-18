// Raio-X da Reforma do Restaurante (18/11/2026): a conta, sem tela. Mesmo arquivo roda no site e no teste
// (scripts/teste-reforma.mjs). Fontes:
// - 2026: CBS 0,9% e IBS 0,1%, tabela ALIQUOTA_REFERENCIA da Calculadora de Tributos da Receita Federal
//   (github.com/ReceitaFederal/calculadora-rtc-regime-regular, versão 1.6.1, licença MIT). É a única
//   alíquota oficial publicada: as de 2027 em diante saíram da calculadora em 28/08/2026 até o Senado fixar.
// - Restaurante: Lei Complementar 214/2025, arts. 273 a 276 (redução de 40%; o que fica com o app e a gorjeta
//   fora da base; bebida alcoólica e item comprado pronto fora da redução).
// 2027 em diante é sempre cenário: a alíquota cheia é a que a pessoa digita (a do contador).
(function (raiz) {
  var ALIQ_2026 = { cbs: 0.9, ibs: 0.1 }; // %
  var REDUCAO_RESTAURANTE = 0.4;

  function numero(v) {
    if (typeof v === "number") return v;
    var t = String(v == null ? "" : v).trim().replace(/[R$\s%]/g, "");
    if (!t) return NaN;
    // "1.234,56" e "38,5" no jeito brasileiro; "38.50" também passa.
    if (t.indexOf(",") >= 0) t = t.replace(/\./g, "").replace(",", ".");
    return Number(t);
  }

  /** Confere a entrada. Devolve o texto do erro (para a tela) ou "" se estiver tudo certo. */
  function conferir(d) {
    if (!(d.preco > 0)) return "Digite o preço de venda do item.";
    if (!(d.custo >= 0)) return "Digite o custo da ficha técnica do item.";
    if (d.custo >= d.preco) return "O custo da ficha ficou maior que o preço. Confira os dois números.";
    if (d.canal === "app" && !(d.comissao >= 0 && d.comissao < 60)) return "Digite quanto o app fica de cada pedido, entre 0 e 60%.";
    if (d.ano !== "2026" && !(d.cheia > 0 && d.cheia <= 40)) return "Digite a alíquota cheia do cenário, entre 0 e 40%.";
    if (d.ano !== "2026" && d.atual !== null && !(d.atual >= 0 && d.atual < 40)) return "Confira quanto você paga hoje de imposto sobre a venda.";
    return "";
  }

  function calcular(d) {
    var total = d.ano === "2026" ? ALIQ_2026.cbs + ALIQ_2026.ibs : d.cheia;
    var reduz = d.tipo === "preparado";
    var aliq = (total * (reduz ? 1 - REDUCAO_RESTAURANTE : 1)) / 100;
    var c = d.canal === "app" ? d.comissao / 100 : 0;
    var base = d.preco * (1 - c); // art. 274: o que fica com o app sai da base, se a nota separar
    var imposto = base * aliq;
    var r = {
      total: total, aliqEfetiva: aliq * 100, reduz: reduz, base: base, imposto: imposto,
      impostoSemSeparar: d.preco * aliq, app: d.preco * c,
      antes: d.preco - d.custo - d.preco * c, // sobra antes de qualquer imposto sobre a venda
      sobra: d.preco - d.custo - d.preco * c - imposto,
      sobraHoje: null, precoMesmaSobra: null,
    };
    if (d.ano !== "2026" && d.atual !== null) {
      var t = d.atual / 100;
      r.sobraHoje = d.preco - d.custo - d.preco * c - d.preco * t;
      // preço P que mantém a sobra de hoje: P(1 - c - (1 - c)aliq) - custo = sobraHoje
      r.precoMesmaSobra = (r.sobraHoje + d.custo) / (1 - c - (1 - c) * aliq);
    }
    return r;
  }

  var ROTULO = {
    regime: { simples: "Simples Nacional", geral: "Lucro Presumido ou Real", naosei: "não sabe o regime" },
    tipo: { preparado: "item feito na cozinha", alcool: "bebida alcoólica", revenda: "item comprado pronto" },
  };
  var brl = function (v) { return "R$ " + v.toFixed(2).replace(".", ","); };

  /** Resumo curto que vai ao Vini como contexto do SDR (máx. 300 caracteres no servidor). */
  function resumo(regime, d) {
    var r = ROTULO.regime[regime] || regime;
    if (regime !== "geral" || !d) return r;
    var canal = d.canal === "app" ? "app (" + String(d.comissao).replace(".", ",") + "%)" : "salão ou balcão";
    var ano = d.ano === "2026" ? "conta de 2026" : "cenário de " + String(d.cheia).replace(".", ",") + "% cheia";
    return (r + "; " + ROTULO.tipo[d.tipo] + " a " + brl(d.preco) + ", ficha " + brl(d.custo) + ", vende no " + canal + "; " + ano).slice(0, 300);
  }

  var api = { ALIQ_2026: ALIQ_2026, REDUCAO_RESTAURANTE: REDUCAO_RESTAURANTE, numero: numero, conferir: conferir, calcular: calcular, resumo: resumo };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else raiz.ReformaCalculo = api;
})(typeof window !== "undefined" ? window : globalThis);
