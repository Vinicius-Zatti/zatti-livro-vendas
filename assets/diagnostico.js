// Diagnóstico de 5 minutos (versão rápida do Mapeia, 06/10/2026). O dono responde sozinho, deixa
// nome e WhatsApp e vê a nota por pilar. As respostas vão ao Vini (alerta + CRM), que recalcula as
// notas do lado dele, e ao Formspree como reserva. A tabela de pilares é a mesma de
// src/zatti/diagnostico.js do Vini; mudou lá, muda aqui.
(function () {
  var VINI_LEADS_URL = "https://vini-production-33a6.up.railway.app/site/lead";
  var FORMSPREE_URL = "https://formspree.io/f/mzdnkdbv";
  var WHATSAPP = "5511963898411";

  var PERFIL = [
    { campo: "tipo", texto: "Que tipo de negócio você tem?", opcoes: ["Hamburgueria", "Pizzaria", "Restaurante", "Bar", "Outro"] },
    { campo: "faturamento_atual", texto: "Quanto o restaurante fatura por mês, em média?", opcoes: ["Até 50 mil", "50 a 100 mil", "100 a 150 mil", "150 a 300 mil", "Acima de 300 mil"] },
    { campo: "unidades", texto: "Quantas unidades você tem?", opcoes: ["1", "2 a 3", "4 ou mais"] },
  ];

  var PILARES = [
    { chave: "financeiro", plano: ["Separe a conta do restaurante da sua e defina uma retirada fixa por mês.", "Lance toda entrada e saída numa planilha ou sistema, toda semana, sem deixar acumular.", "Feche o mês com um resultado simples: faturamento, custos, despesas e quanto sobrou."],
      nome: "Controle financeiro", perguntas: [0, 1, 2],
      fraco: "Sem saber quanto sobra no fim do mês, cada decisão vira aposta. É o primeiro ponto que eu arrumo em qualquer restaurante, porque sem ele o resto não se sustenta." },
    { chave: "cmv", plano: ["Conte o estoque toda semana, sempre no mesmo dia.", "Monte a ficha técnica dos pratos que mais vendem, com o custo de cada ingrediente.", "Defina o ponto de reposição de cada item e cote com pelo menos 3 fornecedores antes de comprar."],
      nome: "CMV", perguntas: [3, 4, 5, 6],
      fraco: "O CMV é onde o dinheiro escapa sem fazer barulho: compra sem contagem, preço sem cotação e prato sem ficha técnica. Quem passa a contar o estoque e cotar toda semana costuma baixar o CMV em pelo menos 5 pontos em 60 dias." },
    { chave: "processos", plano: ["Escreva o checklist de abertura e fechamento e defina quem confere.", "Padronize o recebimento de mercadoria: peso, validade e nota, sempre.", "Monte um roteiro de treino para quem entra, para não depender de quem está no turno."],
      nome: "Processos", perguntas: [7, 8, 9],
      fraco: "Quando cada um faz do seu jeito, a qualidade depende de quem está no turno. Processo simples e conferido é o que deixa a operação igual todo dia, com ou sem você." },
    { chave: "dados", plano: ["Calcule a margem de cada prato a partir da ficha técnica.", "Cruze margem com volume de vendas para saber o que destacar, o que reajustar e o que tirar do cardápio.", "Acompanhe toda semana três números: vendas, despesas e quanto sobrou."],
      nome: "Decisões com dados", perguntas: [10, 11, 12],
      fraco: "Preço e cardápio decididos no feeling deixam lucro na mesa. Saber quanto cada prato realmente dá de lucro muda o que você destaca, o que você corta e quanto você cobra." },
    { chave: "dono", plano: ["Liste tudo o que hoje só você resolve.", "Transforme o que se repete em processo escrito e passe para alguém do time.", "Defina os números que você acompanha de longe, para controlar sem precisar estar lá."],
      nome: "Dependência do dono", perguntas: [13, 14, 15],
      fraco: "Se o restaurante para quando você sai, você não tem um negócio, tem um emprego que não te deixa tirar folga. Dá para mudar isso com rotina e pessoas certas, sem perder o controle." },
  ];

  // Opções da pior para a melhor: o índice é a pontuação (0 a 3).
  var PERGUNTAS = [
    ["Você sabe quanto sobrou de lucro no mês passado?", ["Não sei", "Tenho uma ideia", "Sei aproximado pelo extrato", "Sei exato pelo fechamento do mês"]],
    ["O dinheiro do restaurante e o seu estão separados?", ["Tudo junto", "Em parte", "Separados, mas tiro quando preciso", "Separados, com retirada fixa"]],
    ["Como você controla contas a pagar e a receber?", ["De cabeça", "Caderno", "Planilha quando dá", "Planilha ou sistema atualizado toda semana"]],
    ["Você sabe o seu CMV do mês?", ["Não sei o que é", "Sei o que é, mas não calculo", "Calculo de vez em quando", "Calculo todo mês contando o estoque"]],
    ["Seus pratos têm ficha técnica?", ["Não", "Alguns", "A maioria, mas desatualizada", "Todos, atualizada"]],
    ["Como você decide quanto comprar?", ["Quando avisam que acabou", "Já tenho mais ou menos a quantidade que preciso para a semana", "Pela contagem de estoque da semana", "Pela contagem da semana com ponto de reposição de cada item"]],
    ["Como você escolhe de quem comprar?", ["Compro de quem já conheço, sem comparar", "Comparo quando o preço sobe", "Cotação nos itens principais", "Cotação toda semana com vários fornecedores"]],
    ["A abertura e o fechamento seguem um checklist?", ["Não", "Cada um faz do seu jeito", "Tem, mas ninguém segue", "Tem e é conferido"]],
    ["Com que frequência você conta o estoque?", ["Nunca", "Quando lembro", "Todo mês", "Toda semana ou mais"]],
    ["Quando entra um funcionário novo, como ele aprende?", ["Vendo os outros", "Eu explico na hora", "Tem um roteiro falado", "Tem material e período de treino"]],
    ["Você sabe quais 5 pratos dão mais lucro (e não os que mais vendem)?", ["Não", "Acho que sei", "Sei os que mais vendem", "Sei pelo lucro de cada prato"]],
    ["Como você define o preço do cardápio?", ["Pela concorrência", "Multiplico o custo por 3", "Ficha técnica com margem de lucro", "Ficha técnica com margem de lucro e o desempenho de cada prato nas vendas"]],
    ["Quais números do restaurante você acompanha?", ["Só o saldo da conta", "As vendas do dia", "Vendas e despesas, uma vez por mês", "Vendas, despesas e quanto sobrou, toda semana"]],
    ["Quantos dias você fica fora sem a operação desandar?", ["Nenhum", "1 dia", "Uma semana", "Mais de uma semana"]],
    ["Quem resolve os problemas do dia a dia quando você não está?", ["Ninguém, me ligam", "Me ligam quase sempre", "Alguém resolve o simples", "Alguém resolve e depois me conta"]],
    ["Quanto da sua semana vai para apagar incêndio?", ["Quase toda", "Mais da metade", "Um pouco", "Quase nada"]],
  ];

  function pilarDa(i) {
    for (var p = 0; p < PILARES.length; p++) if (PILARES[p].perguntas.indexOf(i) >= 0) return PILARES[p];
    return null;
  }

  var etapas = PERFIL.map(function (p) { return { tipo: "perfil", p: p }; })
    .concat(PERGUNTAS.map(function (q, i) { return { tipo: "pergunta", i: i }; }));
  var perfil = {};
  var respostas = [];
  var atual = 0;
  var ultimoPonteiro = null;
  document.addEventListener("pointerdown", function (ev) { ultimoPonteiro = { x: ev.clientX, y: ev.clientY }; }, true);
  var el = function (id) { return document.getElementById(id); };

  function mostrar(id) {
    ["dg-inicio", "dg-quiz", "dg-contato", "dg-resultado"].forEach(function (t) { el(t).hidden = t !== id; });
    window.scrollTo(0, 0);
  }

  function renderEtapa() {
    var e = etapas[atual];
    var titulo, opcoes, rotulo, escolhida;
    if (e.tipo === "perfil") {
      titulo = e.p.texto; opcoes = e.p.opcoes; rotulo = "Sobre o seu restaurante"; escolhida = perfil[e.p.campo];
    } else {
      titulo = PERGUNTAS[e.i][0]; opcoes = PERGUNTAS[e.i][1]; rotulo = pilarDa(e.i).nome; escolhida = respostas[e.i];
      escolhida = escolhida === undefined ? undefined : opcoes[escolhida];
    }
    // O perfil não conta como pergunta: o diagnóstico tem 16 (pedido de Vinícius, 06/10).
    el("dg-progresso-texto").textContent = e.tipo === "perfil"
      ? "Antes de começar: " + (atual + 1) + " de " + PERFIL.length
      : "Pergunta " + (e.i + 1) + " de " + PERGUNTAS.length;
    el("dg-progresso-barra").style.width = Math.round((atual / etapas.length) * 100) + "%";
    el("dg-pilar").textContent = rotulo;
    el("dg-pergunta").textContent = titulo;
    var lista = el("dg-opcoes");
    lista.innerHTML = "";
    // O navegador dispara "mousemove" artificial quando o conteúdo muda embaixo do cursor: o destaque
    // só volta quando o mouse sai mais de 10 px do ponto onde estava ao trocar de pergunta.
    lista.classList.add("dg-sem-hover");
    var origem = ultimoPonteiro;
    lista.onmousemove = function (ev) {
      if (!origem) { origem = { x: ev.clientX, y: ev.clientY }; return; }
      if (Math.abs(ev.clientX - origem.x) + Math.abs(ev.clientY - origem.y) > 10) { lista.classList.remove("dg-sem-hover"); lista.onmousemove = null; }
    };
    opcoes.forEach(function (texto, idx) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "dg-opcao" + (texto === escolhida ? " is-active" : "");
      b.textContent = texto;
      b.addEventListener("click", function () { escolher(idx, texto); });
      lista.appendChild(b);
    });
    el("dg-voltar").hidden = atual === 0;
    // No celular o toque deixava a opção da tela seguinte com foco/destaque: tira o foco ao trocar.
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }

  function escolher(idx, texto) {
    var e = etapas[atual];
    if (e.tipo === "perfil") perfil[e.p.campo] = texto; else respostas[e.i] = idx;
    if (atual < etapas.length - 1) { atual++; renderEtapa(); } else { mostrar("dg-contato"); }
  }

  function calcular() {
    var notas = PILARES.map(function (p) {
      var soma = p.perguntas.reduce(function (s, i) { return s + respostas[i]; }, 0);
      return { pilar: p, nota: Math.round((soma / (p.perguntas.length * 3)) * 100) };
    });
    var fraco = notas.slice().sort(function (a, b) { return a.nota - b.nota; })[0];
    // Nota geral: média dos 5 pilares (cada pilar pesa igual, como no radar).
    var geral = Math.round(notas.reduce(function (t, n) { return t + n.nota; }, 0) / notas.length);
    return { notas: notas, fraco: fraco, geral: geral };
  }

  function origem() {
    try { return new URLSearchParams(window.location.search).get("origem") || "site"; } catch (e) { return "site"; }
  }

  // Envia ao Vini e ao Formspree; nunca segura o resultado mais de ~2,5 s.
  function enviar(contato, d) {
    var corpo = {
      nome: contato.nome, whatsapp: contato.whatsapp, negocio: contato.negocio || undefined,
      produto: "Diagnóstico 5 minutos", origem: origem(), pagina: window.location.pathname,
      tipo: perfil.tipo, faturamento_atual: perfil.faturamento_atual, unidades: perfil.unidades,
      respostas: respostas.join(""),
    };
    var vini = fetch(VINI_LEADS_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) })
      .catch(function () { return null; });
    var fd = new FormData();
    Object.keys(corpo).forEach(function (k) { if (corpo[k]) fd.append(k, corpo[k]); });
    fd.append("notas", d.notas.map(function (n) { return n.pilar.nome + " " + n.nota; }).join(", "));
    var reserva = fetch(FORMSPREE_URL, { method: "POST", body: fd, headers: { Accept: "application/json" } })
      .catch(function () { return null; });
    var limite = new Promise(function (r) { setTimeout(r, 2500); });
    return Promise.race([Promise.all([vini, reserva]), limite]);
  }

  function radar(notas) {
    var n = notas.length, cx = 160, cy = 150, raio = 110;
    var ponto = function (i, fator) {
      var a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      return [cx + Math.cos(a) * raio * fator, cy + Math.sin(a) * raio * fator];
    };
    var svg = '<svg viewBox="0 0 320 300" role="img" aria-label="Radar das notas por pilar">';
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      svg += '<polygon class="dg-grade" points="' + notas.map(function (_, i) { return ponto(i, f).join(","); }).join(" ") + '"/>';
    });
    notas.forEach(function (nt, i) {
      var p = ponto(i, 1), r = ponto(i, 1.22);
      svg += '<line class="dg-grade" x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '"/>';
      svg += '<text class="dg-eixo" x="' + r[0] + '" y="' + r[1] + '" text-anchor="middle" dominant-baseline="middle">' + nt.pilar.nome.replace("Decisões com dados", "Dados").replace("Dependência do dono", "Dono").replace("Controle financeiro", "Financeiro") + "</text>";
    });
    svg += '<polygon class="dg-area" points="' + notas.map(function (nt, i) { return ponto(i, Math.max(nt.nota, 4) / 100).join(","); }).join(" ") + '"/>';
    return svg + "</svg>";
  }

  function barras(d) {
    return d.notas.map(function (nt) {
      var fraco = nt === d.fraco ? " is-fraco" : "";
      return '<div class="dg-barra' + fraco + '"><span class="dg-barra-nome">' + nt.pilar.nome + '</span>' +
        '<span class="dg-barra-trilho"><span style="width:' + Math.max(nt.nota, 2) + '%"></span></span>' +
        '<span class="dg-barra-nota">' + nt.nota + "</span></div>";
    }).join("");
  }

  function renderResultado(d) {
    el("dg-geral").textContent = d.geral;
    el("dg-radar").innerHTML = radar(d.notas);
    el("dg-barras").innerHTML = barras(d);
    el("dg-fraco-nome").textContent = d.fraco.pilar.nome + " (" + d.fraco.nota + " de 100)";
    el("dg-fraco-texto").textContent = d.fraco.pilar.fraco;
    el("dg-plano").innerHTML = d.fraco.pilar.plano.map(function (t) { return "<li>" + t + "</li>"; }).join("");
    var msg = "Oi, Vinícius! Fiz o diagnóstico de 5 minutos e meu ponto mais fraco deu " + d.fraco.pilar.nome + " (" + d.fraco.nota + "). Quero entender o que fazer.";
    el("dg-whatsapp").href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
    // A página da consultoria usa isto para não pedir outro questionário (ver consultoria-diagnostico.js).
    try { window.sessionStorage.setItem("zattiDiagnostico", JSON.stringify({ geral: d.geral, fraco: d.fraco.pilar.nome + " (" + d.fraco.nota + ")" })); } catch (e) { /* sem armazenamento: a consultoria mostra o texto genérico */ }
  }

  // Exemplo da tela inicial (números fictícios, para a pessoa ver o que vai receber).
  function renderExemplo() {
    var nomes = [58, 35, 50, 42, 27];
    var notas = PILARES.map(function (p, i) { return { pilar: p, nota: nomes[i] }; });
    var d = { notas: notas, fraco: notas[4] };
    el("dg-exemplo-radar").innerHTML = radar(notas);
    el("dg-exemplo-barras").innerHTML = barras(d);
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderExemplo();
    el("dg-comecar").addEventListener("click", function () { atual = 0; renderEtapa(); mostrar("dg-quiz"); });
    el("dg-voltar").addEventListener("click", function () { if (atual > 0) { atual--; renderEtapa(); } });
    el("dg-contato-voltar").addEventListener("click", function () { atual = etapas.length - 1; renderEtapa(); mostrar("dg-quiz"); });
    el("dg-form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var f = ev.target;
      var campo = function (n) { return f.elements.namedItem(n).value; };
      var contato = { nome: campo("nome").trim(), whatsapp: campo("whatsapp").replace(/\D/g, ""), negocio: campo("negocio").trim() };
      var erro = el("dg-erro");
      if (contato.nome.length < 2) { erro.textContent = "Escreva o seu nome."; erro.hidden = false; return; }
      if (contato.whatsapp.length < 10 || contato.whatsapp.length > 13) { erro.textContent = "Confira o WhatsApp com DDD."; erro.hidden = false; return; }
      erro.hidden = true;
      var btn = f.querySelector("button[type=submit]");
      btn.disabled = true; btn.textContent = "Calculando...";
      var d = calcular();
      enviar(contato, d).then(function () { renderResultado(d); mostrar("dg-resultado"); });
    });
  });
})();
