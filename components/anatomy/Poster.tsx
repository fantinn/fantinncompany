"use client";

import { useEffect, useRef } from "react";
import type { Anatomy } from "./data";
import { drawLayer } from "./texture";

/* Fallback sem WebGL: o mesmo aparelho, desenhado de frente num canvas 2D. */
export default function Poster({ anatomy }: { anatomy: Anatomy }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const W = 760;
    const H = 560;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    el.width = W * dpr;
    el.height = H * dpr;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Tampa
    const lidW = 660;
    const lidH = 424;
    const lidX = (W - lidW) / 2;
    const lidY = 24;
    ctx.fillStyle = "#c2c7cc";
    ctx.beginPath();
    ctx.roundRect(lidX, lidY, lidW, lidH, 14);
    ctx.fill();

    // Tela
    const sx = lidX + 14;
    const sy = lidY + 14;
    const sw = lidW - 28;
    const sh = lidH - 28;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 5);
    ctx.clip();
    ctx.fillStyle = "#050506";
    ctx.fillRect(sx, sy, sw, sh);

    // A tela mostra o topo da página, como uma viewport.
    ctx.translate(sx, sy);
    ctx.globalCompositeOperation = "lighter";
    for (const layer of anatomy.layers) drawLayer(ctx, layer, sw, sw / 0.8);
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();

    // Base, em perspectiva rasa
    const baseY = lidY + lidH;
    const half = lidW / 2;
    const cx = W / 2;
    ctx.fillStyle = "#b3b8be";
    ctx.beginPath();
    ctx.moveTo(cx - half, baseY);
    ctx.lineTo(cx + half, baseY);
    ctx.lineTo(cx + half + 34, baseY + 30);
    ctx.lineTo(cx - half - 34, baseY + 30);
    ctx.closePath();
    ctx.fill();

    // Recorte frontal
    ctx.fillStyle = "#9aa0a7";
    ctx.beginPath();
    ctx.ellipse(cx, baseY + 30, 52, 7, 0, 0, Math.PI);
    ctx.fill();
  }, [anatomy]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={`Anatomia de ${anatomy.label}: ${anatomy.layers.map((l) => l.label).join(", ")}.`}
      style={{ width: "auto", height: "100%", maxWidth: "100%", margin: "0 auto" }}
    />
  );
}
