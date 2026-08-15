"use client";

import { useEffect, useRef } from "react";
import Anatomy from "./anatomy/Anatomy";
import s from "./site.module.css";

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const collapse = useRef(0);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const travel = el.offsetHeight - window.innerHeight;
      if (travel <= 0) {
        collapse.current = 0;
        return;
      }
      const p = -el.getBoundingClientRect().top / travel;
      // Fecha antes do fim do trecho para a pilha montada respirar.
      collapse.current = Math.min(1, Math.max(0, p / 0.82));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className={s.hero} ref={section} id="topo">
      <div className={s.heroSticky}>
        <div className={`shell ${s.heroInner}`}>
          <div className={s.heroCopy}>
            <p className="kicker">Soluções digitais</p>
            <h1 className={`display ${s.heroTitle}`}>
              Sua ideia.
              <br />
              Nosso código.
              <br />
              <span className="red">Grandes resultados.</span>
            </h1>
            <hr className="rule" />
            <p className="lede">
              Landing pages, SaaS e lojas online. Ao lado, um projeto de cada tipo
              rodando de verdade — troque o tipo e role a página para percorrer a
              tela.
            </p>
            <div className={s.actions}>
              <a className={s.btn} href="#contato">
                Tirar a ideia do papel
                <span aria-hidden="true">↗</span>
              </a>
              <a className={s.btnGhost} href="#trabalho">
                Ver trabalhos
              </a>
            </div>
          </div>

          <div className={s.heroPiece}>
            <Anatomy collapseRef={collapse} />
          </div>
        </div>
      </div>
    </section>
  );
}
