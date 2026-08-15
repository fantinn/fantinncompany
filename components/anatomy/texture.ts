import * as THREE from "three";
import type { Ink, Layer, Shape } from "./data";

/* Desenhado como luz sobre preto: as camadas somam, não cobrem. */
export const INK: Record<Ink, string> = {
  grid: "#2e3138",
  struct: "#565a63",
  content: "#a8acb4",
  accent: "#c41626",
  ui: "#e8e9ec",
};

/* Cores das amostras na legenda, que ficam sobre fundo claro. */
export const SWATCH: Record<Ink, string> = {
  grid: "#b9bcc2",
  struct: "#85888f",
  content: "#4a4d55",
  accent: "#ec1b2e",
  ui: "#0d0d0d",
};

const TEX_W = 900;
const TEX_H = 1125;

const cache = new Map<string, THREE.CanvasTexture>();

function drawShape(
  ctx: CanvasRenderingContext2D,
  s: Shape,
  color: string,
  W: number,
  H: number,
) {
  ctx.globalAlpha = s.a ?? 1;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  if (s.t === "dot") {
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, (s.d * W) / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const x = s.x * W;
  const y = s.y * H;
  const w = s.w * W;
  const h = s.h * H;

  if (s.t === "fill") {
    ctx.fillRect(x, y, w, h);
  } else {
    const lw = Math.max(1, W / 360);
    ctx.lineWidth = lw;
    ctx.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw);
  }
}

/* Marcas de registro: separadas quando a pilha está aberta,
   sobrepostas em quase-preto quando ela fecha. */
function drawRegistration(ctx: CanvasRenderingContext2D, _color: string, W: number, H: number) {
  const marks: [number, number][] = [
    [0.033, 0.021],
    [0.967, 0.021],
    [0.033, 0.979],
    [0.967, 0.979],
  ];
  const r = W / 100;
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = "#ec1b2e";
  ctx.lineWidth = Math.max(1, W / 450);
  for (const [nx, ny] of marks) {
    const x = nx * W;
    const y = ny * H;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.moveTo(x - r * 1.9, y);
    ctx.lineTo(x + r * 1.9, y);
    ctx.moveTo(x, y - r * 1.9);
    ctx.lineTo(x, y + r * 1.9);
    ctx.stroke();
  }
}

export function drawLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  W: number,
  H: number,
  registration = true,
) {
  const color = INK[layer.ink];
  for (const s of layer.shapes) drawShape(ctx, s, color, W, H);
  if (registration) drawRegistration(ctx, color, W, H);
  ctx.globalAlpha = 1;
}

let deck: THREE.CanvasTexture | null = null;

/* Teclado, grelhas de som e trackpad. O fundo fica transparente para o
   alumínio da base aparecer em volta, como num MacBook. */
export function deckTexture(): THREE.CanvasTexture {
  if (deck) return deck;

  const W = 1240;
  const H = 900;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const round = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  };

  // Grelhas de som: colunas de furos dos dois lados do teclado.
  ctx.fillStyle = "#1e2023";
  const holeR = 3.2;
  const step = 13;
  for (const x0 of [34, W - 34 - 88]) {
    for (let gx = 0; gx < 7; gx++) {
      for (let gy = 0; gy < 30; gy++) {
        ctx.beginPath();
        ctx.arc(x0 + gx * step, 60 + gy * step, holeR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Poço do teclado
  const kx = 168;
  const ky = 40;
  const kw = W - kx * 2;
  const kh = 430;
  ctx.fillStyle = "#0e0e10";
  round(kx - 14, ky - 14, kw + 28, kh + 28, 12);

  // Seis fileiras: função (mais baixa) e cinco normais.
  const gap = 6;
  const cols = 14;
  const keyW = (kw - gap * (cols - 1)) / cols;
  const fnH = 34;
  const rowH = (kh - fnH - gap * 5) / 5;

  ctx.fillStyle = "#26272c";
  for (let c = 0; c < cols; c++) {
    round(kx + c * (keyW + gap), ky, keyW, fnH, 4);
  }

  for (let r = 0; r < 5; r++) {
    const y = ky + fnH + gap + r * (rowH + gap);
    if (r === 4) {
      round(kx, y, keyW * 2.2 + gap, rowH, 6);
      round(kx + keyW * 2.2 + gap * 2, y, keyW * 6.4 + gap * 5, rowH, 6);
      round(kx + keyW * 8.6 + gap * 8, y, keyW * 5.4 + gap * 4, rowH, 6);
      continue;
    }
    for (let c = 0; c < cols; c++) {
      round(kx + c * (keyW + gap), y, keyW, rowH, 6);
    }
  }

  // Trackpad — só um contorno finíssimo, como no original.
  const tpW = 470;
  const tpH = 320;
  const tpX = (W - tpW) / 2;
  const tpY = 520;
  ctx.fillStyle = "rgba(24,26,29,0.35)";
  round(tpX, tpY, tpW, tpH, 14);
  ctx.strokeStyle = "rgba(18,19,22,0.75)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(tpX, tpY, tpW, tpH, 14);
  ctx.stroke();

  deck = new THREE.CanvasTexture(canvas);
  deck.colorSpace = THREE.SRGBColorSpace;
  deck.anisotropy = 8;
  return deck;
}

let glare: THREE.CanvasTexture | null = null;

/* Reflexo diagonal no vidro da tela. */
export function glareTexture(): THREE.CanvasTexture {
  if (glare) return glare;

  const W = 512;
  const H = 320;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const g = ctx.createLinearGradient(0, H, W * 0.75, 0);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.42, "rgba(255,255,255,0)");
  g.addColorStop(0.52, "rgba(255,255,255,0.10)");
  g.addColorStop(0.62, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  glare = new THREE.CanvasTexture(canvas);
  glare.colorSpace = THREE.SRGBColorSpace;
  return glare;
}

export function layerTexture(anatomyId: string, layer: Layer): THREE.CanvasTexture {
  const key = `${anatomyId}:${layer.id}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext("2d")!;

  // Preto é o neutro do blending aditivo: onde não há traço, nada é somado.
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  drawLayer(ctx, layer, TEX_W, TEX_H);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}
