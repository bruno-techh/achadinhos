const POR_PAGINA = 50;
const estado = { ofertas: [], filtradas: [], pagina: 1 };

const el = {
  busca: document.querySelector('#busca'),
  loja: document.querySelector('#loja'),
  grade: document.querySelector('#grade'),
  resumo: document.querySelector('#resumo'),
  atualizacao: document.querySelector('#atualizacao'),
  paginacao: document.querySelector('#paginacao'),
  estado: document.querySelector('#estado'),
};

const nomesLojas = {
  amazon: 'Amazon', shopee: 'Shopee', aliexpress: 'AliExpress',
  'mercado-livre': 'Mercado Livre', mercadolivre: 'Mercado Livre',
};

function texto(valor) { return String(valor ?? '').trim(); }
function numero(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
  const limpo = texto(valor).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.');
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}
function dinheiro(valor) {
  const n = numero(valor);
  return n === null ? '' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function urlSegura(valor) {
  try { const u = new URL(texto(valor)); return ['http:', 'https:'].includes(u.protocol) ? u.href : ''; }
  catch { return ''; }
}
function campo(oferta, ...nomes) {
  for (const nome of nomes) if (oferta[nome] !== undefined && oferta[nome] !== null && texto(oferta[nome])) return oferta[nome];
  return '';
}
function normalizar(o, indice) {
  const loja = texto(campo(o, 'loja', 'store')).toLowerCase().replace(/\s+/g, '-');
  return {
    id: texto(campo(o, 'produto_id', 'id', 'asin', 'itemId')) || `item-${indice}`,
    loja,
    titulo: texto(campo(o, 'titulo', 'title', 'nome')) || 'Oferta sem título',
    imagem: urlSegura(campo(o, 'imagem', 'image', 'imageUrl', 'foto')),
    precoAtual: campo(o, 'preco_atual', 'precoAtual', 'preco', 'price'),
    precoAntigo: campo(o, 'preco_antigo', 'precoAntigo', 'precoDe', 'oldPrice'),
    desconto: texto(campo(o, 'desconto', 'discount')),
    cupom: texto(campo(o, 'cupom', 'coupon', 'cupomCodigo')),
    link: urlSegura(campo(o, 'link_afiliado', 'link', 'url', 'promotionLink')),
    criadoEm: texto(campo(o, 'criado_em', 'createdAt', 'data')),
  };
}

function elemento(tag, classe, conteudo) {
  const n = document.createElement(tag);
  if (classe) n.className = classe;
  if (conteudo !== undefined) n.textContent = conteudo;
  return n;
}

function criarCard(o) {
  const card = elemento('article', 'card');
  const imagemBox = elemento('div', 'image-box');
  const img = document.createElement('img');
  img.alt = o.titulo; img.loading = 'lazy'; img.decoding = 'async';
  img.src = o.imagem || 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#eeeeee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#777" font-family="Arial" font-size="30">Sem imagem</text></svg>');
  img.onerror = () => { img.onerror = null; img.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#eeeeee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#777" font-family="Arial" font-size="30">Imagem indisponível</text></svg>'); };
  imagemBox.append(img);
  card.append(imagemBox, elemento('span', 'store', nomesLojas[o.loja] || o.loja || 'Oferta'));
  if (o.desconto) card.append(elemento('span', 'discount', o.desconto.includes('%') ? o.desconto : `-${o.desconto}%`));
  const content = elemento('div', 'content');
  content.append(elemento('h2', 'title', o.titulo));
  if (dinheiro(o.precoAntigo)) content.append(elemento('p', 'old-price', `De: ${dinheiro(o.precoAntigo)}`));
  if (dinheiro(o.precoAtual)) content.append(elemento('p', 'price', dinheiro(o.precoAtual)));
  if (o.cupom) content.append(elemento('p', 'coupon', `🎟️ Cupom: ${o.cupom}`));
  const buy = elemento('div', 'buy');
  const link = document.createElement('a'); link.textContent = 'Ver oferta'; link.target = '_blank'; link.rel = 'noopener sponsored';
  if (o.link) link.href = o.link; else { link.removeAttribute('href'); link.textContent = 'Link indisponível'; }
  buy.append(link); content.append(buy); card.append(content);
  return card;
}

function filtrar() {
  const termo = texto(el.busca.value).toLocaleLowerCase('pt-BR');
  const loja = el.loja.value;
  estado.filtradas = estado.ofertas.filter(o => (!termo || o.titulo.toLocaleLowerCase('pt-BR').includes(termo)) && (loja === 'todas' || o.loja === loja));
  estado.pagina = 1; renderizar();
}

function renderizar() {
  const total = estado.filtradas.length;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  estado.pagina = Math.min(estado.pagina, paginas);
  const inicio = (estado.pagina - 1) * POR_PAGINA;
  const itens = estado.filtradas.slice(inicio, inicio + POR_PAGINA);
  el.grade.replaceChildren(...itens.map(criarCard));
  el.resumo.textContent = `${total} oferta${total === 1 ? '' : 's'} encontrada${total === 1 ? '' : 's'}`;
  el.estado.hidden = total > 0;
  el.estado.textContent = 'Nenhuma oferta encontrada com esses filtros.';
  renderizarPaginacao(paginas);
}

function renderizarPaginacao(total) {
  el.paginacao.replaceChildren();
  if (total <= 1) return;
  const botao = (rotulo, pagina, desativado = false, atual = false) => {
    const b = elemento('button', '', rotulo); b.disabled = desativado;
    if (atual) b.setAttribute('aria-current', 'page');
    b.addEventListener('click', () => { estado.pagina = pagina; renderizar(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    return b;
  };
  el.paginacao.append(botao('←', estado.pagina - 1, estado.pagina === 1));
  const de = Math.max(1, estado.pagina - 2), ate = Math.min(total, de + 4);
  for (let p = de; p <= ate; p++) el.paginacao.append(botao(String(p), p, false, p === estado.pagina));
  el.paginacao.append(botao('→', estado.pagina + 1, estado.pagina === total));
}

async function iniciar() {
  try {
    const resposta = await fetch('./ofertas.json', { cache: 'no-store' });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    const dados = await resposta.json();
    const lista = Array.isArray(dados) ? dados : (Array.isArray(dados.ofertas) ? dados.ofertas : []);
    estado.ofertas = lista.map(normalizar).filter(o => o.titulo && o.link);
    estado.filtradas = [...estado.ofertas];
    const datas = estado.ofertas.map(o => new Date(o.criadoEm)).filter(d => !Number.isNaN(d.getTime()));
    if (datas.length) el.atualizacao.textContent = `Atualizado em ${new Date(Math.max(...datas)).toLocaleString('pt-BR')}`;
    renderizar();
  } catch (erro) {
    el.resumo.textContent = 'Não foi possível carregar as ofertas.';
    el.estado.hidden = false;
    el.estado.textContent = 'Confira se o arquivo ofertas.json foi enviado para a mesma pasta do site.';
    console.error(erro);
  }
}

el.busca.addEventListener('input', filtrar);
el.loja.addEventListener('change', filtrar);
iniciar();
