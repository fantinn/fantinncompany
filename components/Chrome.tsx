"use client";

import { useEffect } from "react";

/* Observa tudo que entra na tela uma vez e revela. */
export default function Chrome() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-shown", "true");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <div className="gridOverlay shell grid12" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} />
      ))}
    </div>
  );
}
