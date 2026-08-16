import * as THREE from "three";

/* O SaaS que aparece na tela do notebook. Desenhado em canvas 2D porque
   é conteúdo estático — uma textura sai muito mais barata que renderizar
   uma UI de verdade dentro da cena. */

const W = 1600;
const H = 1000;

const INK = "#0b0b0d";
const PANEL = "#111114";
const LINE = "#1e1f24";
const TEXT = "#f2f3f5";
const MUTED = "#7d818a";
const RED = "#ec1b2e";

function round(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/* Série pseudo-aleatória estável — mesma forma a cada carregamento. */
function series(n: number, seed: number): number[] {
  const out: number[] = [];
  let v = seed;
  for (let i = 0; i < n; i++) {
    v = (v * 9301 + 49297) % 233280;
    out.push(v / 233280);
  }
  return out;
}

function sparkline(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
) {
  const pts = series(26, seed);
  ctx.beginPath();
  pts.forEach((p, i) => {
    // Tendência de alta com ruído — um gráfico que sobe.
    const t = i / (pts.length - 1);
    const val = 0.25 + t * 0.55 + (p - 0.5) * 0.22;
    const px = x + t * w;
    const py = y + h - val * h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.strokeStyle = RED;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.stroke();

  // Preenchimento suave sob a linha
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "rgba(236,27,46,0.22)");
  g.addColorStop(1, "rgba(236,27,46,0)");
  ctx.fillStyle = g;
  ctx.fill();
}

function bars(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
) {
  const pts = series(16, seed);
  const bw = w / (pts.length * 1.6);
  pts.forEach((p, i) => {
    const t = i / (pts.length - 1);
    const val = 0.3 + t * 0.45 + (p - 0.5) * 0.3;
    const bh = Math.max(4, val * h);
    ctx.fillStyle = i > pts.length - 5 ? RED : "#33353c";
    round(ctx, x + i * (w / pts.length), y + h - bh, bw, bh, 2);
    ctx.fill();
  });
}

function card(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  delta: string,
  draw: (cx: number, cy: number, cw: number, ch: number) => void,
) {
  ctx.fillStyle = PANEL;
  round(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = MUTED;
  ctx.font = "500 19px Arial, sans-serif";
  ctx.fillText(label, x + 22, y + 34);

  ctx.fillStyle = RED;
  ctx.font = "600 17px Arial, sans-serif";
  const dw = ctx.measureText(delta).width;
  ctx.fillText(delta, x + w - dw - 22, y + 34);

  ctx.fillStyle = TEXT;
  ctx.font = "700 40px Arial, sans-serif";
  ctx.fillText(value, x + 22, y + 88);

  draw(x + 22, y + 104, w - 44, h - 126);
}

export const DASH_W = W;
export const DASH_H = H;

/* Desenha a interface no contexto dado, em coordenadas de 1600x1000.
   Serve tanto à textura 3D quanto ao fallback 2D. */
export function drawDashboard(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  /* ---------- barra lateral ---------- */
  const sw = 118;
  ctx.fillStyle = "#0e0e11";
  ctx.fillRect(0, 0, sw, H);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sw, 0);
  ctx.lineTo(sw, H);
  ctx.stroke();

  // marca
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.arc(sw / 2, 56, 21, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0b0b0d";
  ctx.font = "900 24px Arial Black, Arial, sans-serif";
  ctx.fillText("F", sw / 2 - 8, 65);

  // itens do menu
  for (let i = 0; i < 6; i++) {
    const y = 140 + i * 62;
    const on = i === 2;
    if (on) {
      ctx.fillStyle = "rgba(236,27,46,0.14)";
      round(ctx, 14, y - 20, sw - 28, 44, 8);
      ctx.fill();
      ctx.fillStyle = RED;
      ctx.fillRect(14, y - 20, 3, 44);
    }
    ctx.strokeStyle = on ? RED : "#3a3d44";
    ctx.lineWidth = 2;
    round(ctx, sw / 2 - 11, y - 11, 22, 22, 4);
    ctx.stroke();
  }

  /* ---------- topo ---------- */
  ctx.fillStyle = TEXT;
  ctx.font = "800 22px Arial, sans-serif";
  ctx.fillText("FANTIN", sw + 40, 52);
  const fw = ctx.measureText("FANTIN").width;
  ctx.fillStyle = RED;
  ctx.fillText("CO", sw + 40 + fw, 52);

  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sw, 84);
  ctx.lineTo(W, 84);
  ctx.stroke();

  ctx.fillStyle = MUTED;
  ctx.font = "500 18px Arial, sans-serif";
  ["Painel", "Clientes", "Vendas", "Relatórios"].forEach((t, i) => {
    ctx.fillText(t, W - 620 + i * 132, 52);
  });

  /* ---------- coluna central ---------- */
  const cx = sw + 40;
  ctx.fillStyle = TEXT;
  ctx.font = "800 62px Arial, sans-serif";
  ctx.fillText("SaaS.", cx, 250);
  ctx.font = "400 44px Arial, sans-serif";
  ctx.fillText("inteligente para", cx, 312);
  ctx.fillText("seu negócio.", cx, 366);

  ctx.fillStyle = MUTED;
  ctx.font = "400 22px Arial, sans-serif";
  ctx.fillText("Plataforma completa para gerar dados,", cx, 428);
  ctx.fillText("escalar e vender mais.", cx, 460);

  // chamada
  ctx.fillStyle = RED;
  round(ctx, cx, 500, 268, 62, 6);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 20px Arial, sans-serif";
  ctx.fillText("COMEÇAR AGORA", cx + 34, 538);
  ctx.font = "700 20px Arial, sans-serif";
  ctx.fillText("↗", cx + 224, 538);

  /* ---------- cartões ---------- */
  const colX = W - 560;
  const cw = 500;
  card(ctx, colX, 140, cw, 238, "Receita", "R$ 68.540", "+24,5%", (x, y, w, h) =>
    sparkline(ctx, x, y, w, h, 4021),
  );
  card(ctx, colX, 400, cw, 238, "Usuários", "1.240", "+18,6%", (x, y, w, h) =>
    bars(ctx, x, y, w, h, 9137),
  );
  card(ctx, colX, 660, cw, 238, "Conversões", "3.420", "+52,1%", (x, y, w, h) =>
    sparkline(ctx, x, y, w, h, 1553),
  );

  /* ---------- rodapé da coluna central ---------- */
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, 640);
  ctx.lineTo(cx + 500, 640);
  ctx.stroke();

  const stats: [string, string][] = [
    ["Sessões", "12.8k"],
    ["Ticket", "R$ 412"],
    ["Churn", "1,2%"],
  ];
  stats.forEach(([k, v], i) => {
    const x = cx + i * 172;
    ctx.fillStyle = MUTED;
    ctx.font = "500 17px Arial, sans-serif";
    ctx.fillText(k, x, 686);
    ctx.fillStyle = TEXT;
    ctx.font = "700 30px Arial, sans-serif";
    ctx.fillText(v, x, 726);
  });

  // faixa de atividade
  ctx.fillStyle = PANEL;
  round(ctx, cx, 764, 500, 134, 10);
  ctx.fill();
  ctx.strokeStyle = LINE;
  ctx.stroke();
  bars(ctx, cx + 22, 786, 456, 92, 6611);
}

let cached: THREE.CanvasTexture | null = null;

export function dashboardTexture(): THREE.CanvasTexture {
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  drawDashboard(canvas.getContext("2d")!);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cached = tex;
  return tex;
}
