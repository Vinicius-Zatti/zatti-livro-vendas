// Raio-X da Reforma do Restaurante (18/11/2026, versão 2 pedida por Vinícius): preço do burger e faturamento
// entram; sai "hoje você paga X, depois da reforma Y" e a faixa do Simples. Roda no site e no teste.
// Fontes:
// - Simples Nacional, comércio (restaurante): LC 123/2006, Anexo I. Alíquota efetiva = (RBT12 x nominal - dedução) / RBT12.
//   Com a reforma as alíquotas das faixas continuam as mesmas; CBS e IBS entram na partilha da mesma guia (LC 214/2025).
// - Fora do Simples, depois da reforma: cenário de 27,91% (IBS 18,7% + CBS 9,21%), estimativa usada pelo Comitê Gestor
//   na Resolução CGIBS 14/2026 só para projetar arrecadação. A alíquota oficial ainda será fixada pelo Senado.
//   Restaurante paga 40% menos (LC 214/2025, art. 275): 27,91% x 0,6 = 16,746%.
// - 2026: CBS 0,9% e IBS 0,1%, ano de teste (Calculadora da Receita, v1.6.1).
(function (raiz) {
  var FAIXAS = [ // limite anual, alíquota nominal %, parcela a deduzir R$
    { ate: 180000, nominal: 4.0, deduz: 0 },
    { ate: 360000, nominal: 7.3, deduz: 5940 },
    { ate: 720000, nominal: 9.5, deduz: 13860 },
    { ate: 1800000, nominal: 10.7, deduz: 22500 },
    { ate: 3600000, nominal: 14.3, deduz: 87300 },
    { ate: 4800000, nominal: 19.0, deduz: 378000 },
  ];
  var TETO_SIMPLES = 4800000;
  var CENARIO_CHEIA = 27.91;
  var REDUCAO_RESTAURANTE = 0.4;
  var CENARIO_RESTAURANTE = CENARIO_CHEIA * (1 - REDUCAO_RESTAURANTE); // 16,746%

  function numero(v) {
    if (typeof v === "number") return v;
    var t = String(v == null ? "" : v).trim().replace(/[R$\s%]/g, "");
    if (!t) return NaN;
    if (t.indexOf(",") >= 0) t = t.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, ""); // "80.000" é oitenta mil
    return Number(t);
  }

  /** Faixa do Simples e alíquota efetiva para o faturamento de 12 meses. null acima do teto. */
  function faixaSimples(anual) {
    for (var i = 0; i < FAIXAS.length; i++) {
      if (anual <= FAIXAS[i].ate) {
        var f = FAIXAS[i];
        var efetiva = i === 0 ? f.nominal : (anual * f.nominal / 100 - f.deduz) / anual * 100;
        return { indice: i, numero: i + 1, efetiva: efetiva, nominal: f.nominal, ate: f.ate, de: i === 0 ? 0 : FAIXAS[i - 1].ate, faltaProxima: f.ate - anual };
      }
    }
    return null;
  }

  // Fora do Simples (por escolha ou acima do teto) a conta de hoje depende do imposto que a pessoa paga.
  function precisaAtual(d) { return d.regime === "geral" || d.mensal * 12 > TETO_SIMPLES; }

  function conferir(d) {
    if (!(d.preco > 0 && d.preco < 1000)) return "Digite o preço do seu burger.";
    if (!(d.mensal >= 1000)) return "Digite quanto o restaurante fatura por mês.";
    if (precisaAtual(d) && !(d.atual > 0 && d.atual < 40)) return "Digite quanto você paga hoje sobre a venda (PIS, Cofins e ICMS ou ISS). Seu contador sabe.";
    return "";
  }

  /** { hoje, depois: { simples, fora }, faixa, ... } em % e em R$ por burger e por mês. */
  function calcular(d) {
    var anual = d.mensal * 12;
    var f = faixaSimples(anual);
    var noSimples = d.regime !== "geral" && !!f;
    var hojePct = noSimples ? f.efetiva : d.atual;
    var r = {
      anual: anual, faixa: f, noSimples: noSimples, acimaDoTeto: !f,
      hoje: { pct: hojePct, burger: d.preco * hojePct / 100, mes: d.mensal * hojePct / 100 },
      fora: { pct: CENARIO_RESTAURANTE, burger: d.preco * CENARIO_RESTAURANTE / 100, mes: d.mensal * CENARIO_RESTAURANTE / 100 },
      faltaTeto: TETO_SIMPLES - anual,
    };
    r.depois = noSimples ? { pct: hojePct, burger: r.hoje.burger, mes: r.hoje.mes } : r.fora;
    return r;
  }

  /** Faixa do diagnóstico (mesmas opções de /diagnostico/) a partir do faturamento mensal. */
  function faixaDiagnostico(mensal) {
    return mensal <= 50000 ? "Até 50 mil" : mensal <= 100000 ? "50 a 100 mil" : mensal <= 150000 ? "100 a 150 mil" : mensal <= 300000 ? "150 a 300 mil" : "Acima de 300 mil";
  }

  var brl = function (v) { return "R$ " + v.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
  var pct = function (v) { return v.toFixed(2).replace(".", ",") + "%"; };

  /** Resumo curto que vai ao Vini como contexto do SDR (máx. 300 caracteres no servidor). */
  function resumo(d, r) {
    var reg = r.noSimples ? "Simples, faixa " + r.faixa.numero : d.regime === "geral" ? "Lucro Presumido ou Real" : "acima do teto do Simples";
    return ("burger " + brl(d.preco) + "; fatura " + brl(d.mensal) + "/mês; " + reg + "; hoje " + pct(r.hoje.pct) + " (" + brl(r.hoje.burger) + " por burger); depois " + pct(r.depois.pct) + " (" + brl(r.depois.burger) + ")").slice(0, 300);
  }

  var api = { FAIXAS: FAIXAS, TETO_SIMPLES: TETO_SIMPLES, CENARIO_CHEIA: CENARIO_CHEIA, CENARIO_RESTAURANTE: CENARIO_RESTAURANTE,
    numero: numero, precisaAtual: precisaAtual, faixaSimples: faixaSimples, conferir: conferir, calcular: calcular, faixaDiagnostico: faixaDiagnostico, resumo: resumo, brl: brl, pct: pct };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else raiz.ReformaCalculo = api;
})(typeof window !== "undefined" ? window : globalThis);
