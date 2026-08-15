/* Anatomia — a estrutura de cada tipo de produto, descrita em camadas.
   Coordenadas normalizadas: x/y de 0 a 1, y=0 no topo da página. */

export type Shape =
  | { t: "fill"; x: number; y: number; w: number; h: number; a?: number; r?: number }
  | { t: "stroke"; x: number; y: number; w: number; h: number; a?: number; r?: number }
  | { t: "dot"; x: number; y: number; d: number; a?: number };

/* A tinta é semântica, não decorativa: "accent" é sempre a camada
   onde o negócio acontece — mídia na landing, checkout na loja,
   ações no SaaS. É a única que recebe vermelho. */
export type Ink = "grid" | "struct" | "content" | "accent" | "ui";

export type Layer = {
  id: string;
  label: string;
  note: string;
  ink: Ink;
  shapes: Shape[];
};

export type Anatomy = {
  id: "landing" | "loja" | "saas";
  label: string;
  tagline: string;
  layers: Layer[];
};

const M = 0.07;
const W = 1 - M * 2;

/* ---------- helpers ---------- */

/** Barras horizontais empilhadas — texto corrido. */
function bars(
  count: number,
  o: { x: number; y: number; w: number; h: number; gap: number; last?: number; a?: number },
): Shape[] {
  return Array.from({ length: count }, (_, i) => ({
    t: "fill" as const,
    x: o.x,
    y: o.y + i * (o.h + o.gap),
    w: i === count - 1 && o.last !== undefined ? o.w * o.last : o.w,
    h: o.h,
    a: o.a,
  }));
}

/** Distribui uma forma em N colunas dentro de uma faixa. */
function across(
  count: number,
  o: { x: number; y: number; w: number; h: number; gap: number },
  make: (x: number, i: number, w: number) => Shape[],
): Shape[] {
  const cw = (o.w - o.gap * (count - 1)) / count;
  return Array.from({ length: count }, (_, i) =>
    make(o.x + i * (cw + o.gap), i, cw),
  ).flat();
}

/** Grade de tiles (cards de produto, galeria). */
function tiles(
  cols: number,
  rows: number,
  o: { x: number; y: number; w: number; h: number; gap: number },
  make: (x: number, y: number, w: number, h: number, i: number) => Shape[],
): Shape[] {
  const cw = (o.w - o.gap * (cols - 1)) / cols;
  const ch = (o.h - o.gap * (rows - 1)) / rows;
  const out: Shape[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push(...make(o.x + c * (cw + o.gap), o.y + r * (ch + o.gap), cw, ch, r * cols + c));
    }
  }
  return out;
}

/** A grade de composição: colunas verticais + baselines. */
function composition(baselines: number[], cols = 12): Layer {
  const colLines: Shape[] = Array.from({ length: cols + 1 }, (_, i) => ({
    t: "fill" as const,
    x: M + (W / cols) * i - 0.0011,
    y: 0.025,
    w: 0.0022,
    h: 0.95,
    a: 0.5,
  }));
  const rules: Shape[] = baselines.map((y) => ({
    t: "fill" as const,
    x: M,
    y,
    w: W,
    h: 0.0022,
    a: 0.75,
  }));
  return {
    id: "grade",
    label: "Grade",
    note: "Doze colunas, um ritmo vertical. Tudo que vem depois se apoia aqui.",
    ink: "grid",
    shapes: [...colLines, ...rules],
  };
}

/* ============================================================
   LANDING PAGE
   ============================================================ */

const landing: Anatomy = {
  id: "landing",
  label: "Landing page",
  tagline: "Uma página, um argumento, uma ação.",
  layers: [
    composition([0.035, 0.105, 0.385, 0.475, 0.7, 0.855, 0.965]),
    {
      id: "estrutura",
      label: "Estrutura",
      note: "As seções e a ordem em que o argumento é apresentado.",
      ink: "struct",
      shapes: [
        { t: "fill", x: M, y: 0.04, w: W, h: 0.055, a: 0.22 },
        { t: "fill", x: M, y: 0.115, w: W, h: 0.255, a: 0.3 },
        { t: "fill", x: M, y: 0.395, w: W, h: 0.07, a: 0.18 },
        { t: "fill", x: M, y: 0.485, w: W, h: 0.2, a: 0.26 },
        { t: "fill", x: M, y: 0.71, w: W, h: 0.13, a: 0.34 },
        { t: "fill", x: M, y: 0.865, w: W, h: 0.09, a: 0.2 },
      ],
    },
    {
      id: "conteudo",
      label: "Conteúdo",
      note: "A promessa, a prova e a objeção respondida — nessa ordem.",
      ink: "content",
      shapes: [
        { t: "fill", x: 0.1, y: 0.155, w: 0.46, h: 0.038 },
        { t: "fill", x: 0.1, y: 0.203, w: 0.36, h: 0.038 },
        ...bars(3, { x: 0.1, y: 0.262, w: 0.31, h: 0.011, gap: 0.014, last: 0.62, a: 0.65 }),
        ...across(4, { x: 0.11, y: 0.418, w: 0.78, h: 0.024, gap: 0.03 }, (x, _i, w) => [
          { t: "fill", x, y: 0.418, w: w * 0.7, h: 0.024, a: 0.45 },
        ]),
        ...across(3, { x: 0.1, y: 0.53, w: 0.8, h: 0.1, gap: 0.04 }, (x, _i, w) => [
          { t: "fill", x, y: 0.552, w: w * 0.68, h: 0.022 },
          ...bars(3, { x, y: 0.59, w, h: 0.01, gap: 0.013, last: 0.55, a: 0.6 }),
        ]),
        { t: "fill", x: 0.26, y: 0.742, w: 0.48, h: 0.032 },
        ...bars(2, { x: 0.32, y: 0.788, w: 0.36, h: 0.011, gap: 0.014, last: 0.7, a: 0.6 }),
      ],
    },
    {
      id: "midia",
      label: "Mídia",
      note: "O que o cliente vê antes de ler. Imagem, vídeo, produto real.",
      ink: "accent",
      shapes: [
        { t: "fill", x: 0.6, y: 0.145, w: 0.29, h: 0.2, a: 0.85 },
        { t: "stroke", x: 0.6, y: 0.145, w: 0.29, h: 0.2, a: 0.5 },
        { t: "dot", x: 0.745, y: 0.245, d: 0.045, a: 0.55 },
        ...across(3, { x: 0.1, y: 0.505, w: 0.8, h: 0.035, gap: 0.04 }, (x) => [
          { t: "fill", x, y: 0.505, w: 0.038, h: 0.03, a: 0.9 },
        ]),
        { t: "fill", x: 0.1, y: 0.885, w: 0.07, h: 0.026, a: 0.8 },
      ],
    },
    {
      id: "interface",
      label: "Interface",
      note: "Navegação, botões, estados. O que responde ao toque.",
      ink: "ui",
      shapes: [
        ...across(3, { x: 0.55, y: 0.055, w: 0.22, h: 0.014, gap: 0.02 }, (x, _i, w) => [
          { t: "fill", x, y: 0.058, w, h: 0.012, a: 0.55 },
        ]),
        { t: "fill", x: 0.8, y: 0.05, w: 0.12, h: 0.028, a: 0.9 },
        { t: "fill", x: 0.1, y: 0.305, w: 0.16, h: 0.034, a: 0.95 },
        { t: "stroke", x: 0.275, y: 0.305, w: 0.13, h: 0.034, a: 0.7 },
        { t: "fill", x: 0.42, y: 0.792, w: 0.16, h: 0.034, a: 0.95 },
        ...across(4, { x: 0.55, y: 0.9, w: 0.34, h: 0.01, gap: 0.02 }, (x, _i, w) => [
          { t: "fill", x, y: 0.9, w, h: 0.009, a: 0.45 },
        ]),
      ],
    },
  ],
};

/* ============================================================
   LOJA ONLINE
   ============================================================ */

const loja: Anatomy = {
  id: "loja",
  label: "Loja online",
  tagline: "Do primeiro clique ao pagamento aprovado.",
  layers: [
    composition([0.035, 0.1, 0.155, 0.66, 0.78, 0.9]),
    {
      id: "estrutura",
      label: "Estrutura",
      note: "Topo, filtros, vitrine, rodapé. O esqueleto que não muda.",
      ink: "struct",
      shapes: [
        { t: "fill", x: M, y: 0.04, w: W, h: 0.05, a: 0.24 },
        { t: "fill", x: M, y: 0.105, w: W, h: 0.04, a: 0.16 },
        { t: "fill", x: M, y: 0.165, w: 0.17, h: 0.48, a: 0.22 },
        { t: "fill", x: 0.26, y: 0.165, w: 0.67, h: 0.48, a: 0.14 },
        { t: "fill", x: M, y: 0.675, w: W, h: 0.09, a: 0.28 },
        { t: "fill", x: M, y: 0.79, w: W, h: 0.16, a: 0.18 },
      ],
    },
    {
      id: "catalogo",
      label: "Catálogo",
      note: "Produto, preço, variação, estoque. O dado que move a venda.",
      ink: "content",
      shapes: [
        ...tiles(3, 2, { x: 0.26, y: 0.175, w: 0.67, h: 0.46, gap: 0.025 }, (x, y, w, h) => [
          { t: "stroke", x, y, w, h, a: 0.35 },
          { t: "fill", x: x + 0.012, y: y + h - 0.062, w: w * 0.72, h: 0.016 },
          { t: "fill", x: x + 0.012, y: y + h - 0.036, w: w * 0.34, h: 0.014, a: 0.65 },
        ]),
        ...bars(5, { x: 0.085, y: 0.195, w: 0.13, h: 0.012, gap: 0.026, last: 0.6, a: 0.6 }),
        { t: "fill", x: 0.085, y: 0.17, w: 0.09, h: 0.014 },
        ...across(3, { x: 0.1, y: 0.7, w: 0.5, h: 0.04, gap: 0.04 }, (x, _i, w) => [
          { t: "fill", x, y: 0.7, w: w * 0.5, h: 0.026 },
          { t: "fill", x, y: 0.734, w: w * 0.85, h: 0.011, a: 0.55 },
        ]),
      ],
    },
    {
      id: "checkout",
      label: "Checkout",
      note: "Carrinho, frete, pagamento. Onde a loja ganha ou perde dinheiro.",
      ink: "accent",
      shapes: [
        { t: "fill", x: 0.56, y: 0.19, w: 0.35, h: 0.4, a: 0.92 },
        { t: "stroke", x: 0.56, y: 0.19, w: 0.35, h: 0.4, a: 0.6 },
        { t: "fill", x: 0.578, y: 0.208, w: 0.13, h: 0.016, a: 0.5 },
        ...tiles(1, 3, { x: 0.578, y: 0.24, w: 0.314, h: 0.15, gap: 0.014 }, (x, y, w, h) => [
          { t: "fill", x, y, w: h * 0.75, h, a: 0.45 },
          { t: "fill", x: x + h, y: y + h * 0.2, w: w * 0.45, h: 0.012, a: 0.5 },
          { t: "fill", x: x + h, y: y + h * 0.55, w: w * 0.22, h: 0.011, a: 0.4 },
        ]),
        { t: "fill", x: 0.578, y: 0.42, w: 0.314, h: 0.002, a: 0.5 },
        { t: "fill", x: 0.578, y: 0.44, w: 0.1, h: 0.014, a: 0.45 },
        { t: "fill", x: 0.79, y: 0.44, w: 0.1, h: 0.018, a: 0.6 },
        { t: "fill", x: 0.578, y: 0.52, w: 0.314, h: 0.045, a: 1 },
        { t: "fill", x: 0.87, y: 0.052, w: 0.03, h: 0.026, a: 0.9 },
      ],
    },
    {
      id: "interface",
      label: "Interface",
      note: "Busca, filtro, badge, estado de carregamento.",
      ink: "ui",
      shapes: [
        { t: "stroke", x: 0.28, y: 0.048, w: 0.3, h: 0.03, a: 0.65 },
        { t: "dot", x: 0.3, y: 0.063, d: 0.012, a: 0.7 },
        ...across(5, { x: 0.1, y: 0.115, w: 0.5, h: 0.02, gap: 0.015 }, (x, _i, w) => [
          { t: "stroke", x, y: 0.113, w, h: 0.022, a: 0.5 },
        ]),
        ...bars(5, { x: 0.085, y: 0.196, w: 0.011, h: 0.011, gap: 0.027, a: 0.75 }),
        ...tiles(3, 2, { x: 0.26, y: 0.175, w: 0.67, h: 0.46, gap: 0.025 }, (x, y, w, h) => [
          { t: "fill", x: x + w - 0.055, y: y + 0.012, w: 0.043, h: 0.016, a: 0.8 },
          { t: "fill", x: x + 0.012, y: y + h - 0.014, w: 0.05, h: 0.009, a: 0.4 },
        ]),
        { t: "dot", x: 0.905, y: 0.063, d: 0.014, a: 0.9 },
        ...across(4, { x: 0.55, y: 0.86, w: 0.34, h: 0.01, gap: 0.02 }, (x, _i, w) => [
          { t: "fill", x, y: 0.86, w, h: 0.009, a: 0.4 },
        ]),
      ],
    },
  ],
};

/* ============================================================
   SAAS
   ============================================================ */

const saas: Anatomy = {
  id: "saas",
  label: "SaaS",
  tagline: "Um produto que as pessoas abrem toda segunda de manhã.",
  layers: [
    composition([0.035, 0.11, 0.25, 0.53, 0.88], 12),
    {
      id: "shell",
      label: "Shell",
      note: "Barra lateral, topo, área de trabalho. A moldura constante.",
      ink: "struct",
      shapes: [
        { t: "fill", x: M, y: 0.04, w: 0.155, h: 0.915, a: 0.26 },
        { t: "fill", x: 0.24, y: 0.04, w: 0.69, h: 0.055, a: 0.22 },
        { t: "fill", x: 0.24, y: 0.115, w: 0.69, h: 0.84, a: 0.1 },
      ],
    },
    {
      id: "dados",
      label: "Dados",
      note: "Métricas, tabelas, séries. A razão pela qual alguém volta.",
      ink: "content",
      shapes: [
        ...across(4, { x: 0.255, y: 0.135, w: 0.66, h: 0.09, gap: 0.018 }, (x, _i, w) => [
          { t: "stroke", x, y: 0.135, w, h: 0.09, a: 0.4 },
          { t: "fill", x: x + 0.012, y: 0.15, w: w * 0.45, h: 0.011, a: 0.55 },
          { t: "fill", x: x + 0.012, y: 0.176, w: w * 0.6, h: 0.028 },
        ]),
        { t: "stroke", x: 0.255, y: 0.26, w: 0.42, h: 0.24, a: 0.4 },
        ...across(11, { x: 0.272, y: 0.29, w: 0.388, h: 0.2, gap: 0.008 }, (x, i, w) => [
          {
            t: "fill",
            x,
            y: 0.475 - [0.06, 0.1, 0.08, 0.14, 0.12, 0.17, 0.13, 0.19, 0.16, 0.2, 0.18][i],
            w,
            h: [0.06, 0.1, 0.08, 0.14, 0.12, 0.17, 0.13, 0.19, 0.16, 0.2, 0.18][i],
            a: 0.8,
          },
        ]),
        { t: "stroke", x: 0.69, y: 0.26, w: 0.225, h: 0.24, a: 0.4 },
        { t: "dot", x: 0.8, y: 0.375, d: 0.13, a: 0.55 },
        { t: "stroke", x: 0.255, y: 0.54, w: 0.66, h: 0.33, a: 0.4 },
        ...bars(7, { x: 0.27, y: 0.565, w: 0.63, h: 0.013, gap: 0.031, a: 0.45 }),
      ],
    },
    {
      id: "acoes",
      label: "Ações",
      note: "Formulários, modais, confirmações. O que o usuário faz aqui.",
      ink: "accent",
      shapes: [
        { t: "fill", x: 0.38, y: 0.34, w: 0.36, h: 0.3, a: 0.94 },
        { t: "stroke", x: 0.38, y: 0.34, w: 0.36, h: 0.3, a: 0.6 },
        { t: "fill", x: 0.398, y: 0.36, w: 0.15, h: 0.018, a: 0.55 },
        ...bars(3, { x: 0.398, y: 0.4, w: 0.324, h: 0.032, gap: 0.024, a: 0.4 }),
        { t: "fill", x: 0.6, y: 0.585, w: 0.12, h: 0.034, a: 1 },
        { t: "stroke", x: 0.47, y: 0.585, w: 0.11, h: 0.034, a: 0.6 },
        { t: "fill", x: 0.79, y: 0.055, w: 0.11, h: 0.028, a: 0.95 },
      ],
    },
    {
      id: "interface",
      label: "Interface",
      note: "Navegação, permissões, estados vazios, atalhos.",
      ink: "ui",
      shapes: [
        { t: "fill", x: 0.085, y: 0.055, w: 0.055, h: 0.022, a: 0.9 },
        ...bars(6, { x: 0.085, y: 0.115, w: 0.11, h: 0.014, gap: 0.028, last: 0.6, a: 0.55 }),
        ...bars(3, { x: 0.085, y: 0.34, w: 0.09, h: 0.012, gap: 0.026, last: 0.7, a: 0.35 }),
        { t: "fill", x: 0.085, y: 0.9, w: 0.115, h: 0.03, a: 0.4 },
        ...across(3, { x: 0.255, y: 0.055, w: 0.2, h: 0.014, gap: 0.018 }, (x, _i, w) => [
          { t: "fill", x, y: 0.058, w, h: 0.012, a: 0.6 },
        ]),
        { t: "dot", x: 0.915, y: 0.068, d: 0.026, a: 0.85 },
        ...bars(7, { x: 0.27, y: 0.565, w: 0.014, h: 0.013, gap: 0.031, a: 0.6 }),
        { t: "fill", x: 0.255, y: 0.53, w: 0.09, h: 0.003, a: 0.9 },
      ],
    },
  ],
};

export const ANATOMIES: Anatomy[] = [landing, loja, saas];
export const PAGE_RATIO = 0.8; // largura / altura
