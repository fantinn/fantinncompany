"use client";

import { useEffect, useRef } from "react";
import { DASH_H, DASH_W, drawDashboard } from "./dashboard";

/* Sem WebGL o lado direito não pode ficar vazio: o mesmo aparelho,
   desenhado de frente num canvas 2D. */
export default function HeroPoster() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const W = 900;
    const H = 640;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    el.width = W * dpr;
    el.height = H * dpr;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // tampa
    const lidW = 780;
    const lidH = 500;
    const lidX = (W - lidW) / 2;
    const lidY = 20;
    const shell = ctx.createLinearGradient(lidX, lidY, lidX + lidW, lidY + lidH);
    shell.addColorStop(0, "#d2d7dc");
    shell.addColorStop(0.5, "#aeb4ba");
    shell.addColorStop(1, "#8f959c");
    ctx.fillStyle = shell;
    ctx.beginPath();
    ctx.roundRect(lidX, lidY, lidW, lidH, 16);
    ctx.fill();

    // tela
    const sx = lidX + 15;
    const sy = lidY + 15;
    const sw = lidW - 30;
    const sh = lidH - 30;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 5);
    ctx.clip();
    ctx.fillStyle = "#0b0b0d";
    ctx.fillRect(sx, sy, sw, sh);
    ctx.translate(sx, sy);
    ctx.scale(sw / DASH_W, sh / DASH_H);
    drawDashboard(ctx);
    ctx.restore();

    // base
    const baseY = lidY + lidH;
    const half = lidW / 2;
    const cx = W / 2;
    const deck = ctx.createLinearGradient(cx - half, baseY, cx + half, baseY + 34);
    deck.addColorStop(0, "#c3c8ce");
    deck.addColorStop(1, "#969ca3");
    ctx.fillStyle = deck;
    ctx.beginPath();
    ctx.moveTo(cx - half, baseY);
    ctx.lineTo(cx + half, baseY);
    ctx.lineTo(cx + half + 40, baseY + 34);
    ctx.lineTo(cx - half - 40, baseY + 34);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#7c828a";
    ctx.beginPath();
    ctx.ellipse(cx, baseY + 34, 58, 8, 0, 0, Math.PI);
    ctx.fill();
  }, []);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Painel de um SaaS desenvolvido pela FANTINCO, com receita, usuários e conversões."
      style={{ width: "100%", height: "auto", maxHeight: "100%", objectFit: "contain" }}
    />
  );
}
