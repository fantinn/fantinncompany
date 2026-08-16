"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion, useWebGL } from "@/lib/clientState";
import HeroLaptop from "./HeroLaptop";
import HeroPoster from "./HeroPoster";
import s from "./hero.module.css";

const MENU = [
  ["Serviços", "#servicos"],
  ["Portfólio", "#portfolio"],
  ["Sobre", "#sobre"],
  ["Processo", "#processo"],
];

const CODE = `function build() {
  return (
    <section className="hero">
      <h1>Sua ideia.</h1>
      <h1>Nosso código.</h1>
      <h1>Grandes resultados.</h1>
    </section>
  );
}

const deploy = async (project) => {
  const build = await compile(project);
  return ship(build, { region: "sa-east-1" });
};

export default function Page() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return <Hero ready={ready} />;
}`;

const ICONS = {
  code: "M9.4 7.6 5 12l4.4 4.4M14.6 7.6 19 12l-4.4 4.4",
  target: "M12 3v3M12 18v3M3 12h3M18 12h3M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z",
  bolt: "M13 2 5 13.5h5.5L10 22l8-11.5h-5.5L13 2Z",
};

/* Contagem curta ao entrar — o número sobe, não pisca. */
function Count({ to, start, reduced }: { to: number; start: boolean; reduced: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!start || reduced) return;
    let raf = 0;
    const t0 = performance.now();
    const dur = 850;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, start, reduced]);

  return <>{reduced ? to : n}</>;
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [counting, setCounting] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const reduced = useReducedMotion();
  const webgl = useWebGL();

  useEffect(() => {
    const a = requestAnimationFrame(() => setReady(true));
    const b = window.setTimeout(() => setCounting(true), 950);
    return () => {
      cancelAnimationFrame(a);
      window.clearTimeout(b);
    };
  }, []);

  /* O canvas só desenha enquanto o hero está à vista. Fora dela o laço
     do R3F para por completo, em vez de rodar a 60fps sem ninguém ver. */
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [webgl]);

  /* Fecha o menu com Esc e trava a rolagem enquanto ele estiver aberto. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  /* Um único laço cobre ponteiro e rolagem — os dois escrevem variáveis
     CSS no elemento raiz, e cada camada aplica seu próprio fator. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const target = { x: 0, y: 0 };
    const now = { x: 0, y: 0 };
    let raf = 0;
    let running = false;

    const loop = () => {
      now.x += (target.x - now.x) * 0.075;
      now.y += (target.y - now.y) * 0.075;
      pointer.current.x = now.x;
      pointer.current.y = now.y;
      el.style.setProperty("--px", now.x.toFixed(4));
      el.style.setProperty("--py", now.y.toFixed(4));

      if (Math.abs(target.x - now.x) > 0.0005 || Math.abs(target.y - now.y) > 0.0005) {
        raf = requestAnimationFrame(loop);
      } else {
        running = false;
      }
    };

    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width - 0.5;
      target.y = (e.clientY - r.top) / r.height - 0.5;
      kick();
    };

    let sraf = 0;
    const onScroll = () => {
      if (sraf) return;
      sraf = requestAnimationFrame(() => {
        sraf = 0;
        const h = el.offsetHeight || 1;
        const p = Math.min(1, Math.max(0, window.scrollY / h));
        scrollRef.current = p;
        el.style.setProperty("--sp", p.toFixed(4));
        setScrolled(window.scrollY > 40);
      });
    };

    if (fine && !reduced) window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(sraf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  return (
    <section className={s.hero} ref={root} data-ready={ready} id="topo">
      <a className={s.skip} href="#conteudo">
        Pular para o conteúdo
      </a>

      {/* camada 1 — fundo, praticamente imóvel */}
      <div className={s.vignette} aria-hidden="true" />

      {/* camada 2 — código */}
      <div className={s.codeLayer} aria-hidden="true">
        <pre className={s.code}>
          {CODE}
          {"\n"}
          {CODE}
        </pre>
      </div>

      {/* camada 3 — brilho vermelho. O parallax fica no pai e a
          respiração no filho, para os dois não brigarem pelo transform. */}
      <div className={s.glowShift} aria-hidden="true">
        <div className={s.glow} />
      </div>

      {/* fumaça — gradientes em deriva longa, sem custo de download */}
      <div className={s.smoke} aria-hidden="true">
        <span className={s.smokeA} />
        <span className={s.smokeB} />
      </div>

      {/* massiço ao fundo, atrás do aparelho: desfocado, é o que dá
          a distância entre o objeto e o horizonte */}
      <div className={s.cliff} aria-hidden="true">
        <Image
          src="/assets/fantinco/rock-cliff.png"
          alt=""
          fill
          priority
          sizes="70vw"
          style={{ objectFit: "cover", objectPosition: "70% 40%" }}
        />
      </div>

      {/* feixes — entre a rocha do fundo e o aparelho */}
      <div className={s.beams} aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      {/* luz de baixo: assenta o aparelho na cena em vez de deixá-lo
          recortado sobre o fundo */}
      <div className={s.underglow} aria-hidden="true" />

      {/* camada 4 — o objeto */}
      <div className={s.stage} ref={stage} aria-hidden={webgl !== false}>
        {webgl === true ? (
          <Canvas
            dpr={[1, 2]}
            frameloop={onScreen ? "always" : "never"}
            /* Lente mais longa: perspectiva de foto de produto, sem
               esticar a base do aparelho. */
            camera={{ fov: 22, position: [0, 0, 14] }}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: "high-performance",
              toneMapping: THREE.NeutralToneMapping,
            }}
          >
            <Suspense fallback={null}>
              <HeroLaptop pointer={pointer} scrollRef={scrollRef} reduced={reduced} />
            </Suspense>
          </Canvas>
        ) : webgl === false ? (
          <div className={s.poster}>
            <HeroPoster />
          </div>
        ) : null}
      </div>

      {/* rocha em primeiro plano — o aparelho pousa atrás da crista */}
      <div className={s.ridge} aria-hidden="true">
        <Image
          src="/assets/fantinco/rock-ridge.png"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "48% 24%" }}
        />
      </div>

      <header className={s.header}>
        <a className={s.brand} href="#topo">
          <span className={s.brandMark} aria-hidden="true">
            <svg viewBox="0 0 85 100">
              <path d="M0 0 H85 L62 28 H26 V40 H62 L44 66 H26 V100 H0 Z" fill="currentColor" />
            </svg>
          </span>
          <span className={s.brandName}>
            FANTIN<span className={s.brandCo}>CO</span>
          </span>
        </a>

        <nav className={s.menu} aria-label="Principal">
          {MENU.map(([label, href], i) => (
            <a key={href} href={href} style={{ ["--i" as string]: i }}>
              {label}
            </a>
          ))}
        </nav>

        <a className={s.cta} href="#contato">
          Fale comigo <span aria-hidden="true">↗</span>
        </a>

        <button
          type="button"
          className={s.burger}
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={s.srOnly}>{open ? "Fechar menu" : "Abrir menu"}</span>
          <span className={s.burgerBars} data-open={open} aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </header>

      {/* menu em telas estreitas */}
      <div id="menu-mobile" className={s.sheet} data-open={open} hidden={!open}>
        <nav aria-label="Principal (telas estreitas)">
          {MENU.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        <a className={s.sheetCta} href="#contato" onClick={() => setOpen(false)}>
          Fale comigo <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className={s.content} id="conteudo">
        <p className={s.kicker}>
          <span className={s.kickerRule} aria-hidden="true" />
          Desenvolvimento web
        </p>

        <h1 className={s.title}>
          <span className={s.lineWrap}>
            <span className={s.line} style={{ ["--d" as string]: "300ms" }}>
              Sua ideia.
            </span>
          </span>
          <span className={s.lineWrap}>
            <span className={s.line} style={{ ["--d" as string]: "400ms" }}>
              Nosso código.
            </span>
          </span>
          <span className={s.wipe}>Grandes resultados.</span>
        </h1>

        <p className={s.lede}>
          Desenvolvo Landing Pages, SaaS e Lojas Online com performance, design e
          estratégia.
        </p>

        <div className={s.actions}>
          <a className={s.primary} href="#contato">
            Vamos conversar <span aria-hidden="true">↗</span>
          </a>
          <a className={s.secondary} href="#portfolio">
            Ver projetos <span aria-hidden="true">↗</span>
          </a>
        </div>

        <ul className={s.metrics}>
          <li>
            <span className={s.metricIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d={ICONS.code} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className={s.metricValue}>
              +<Count to={50} start={counting} reduced={reduced} />
            </p>
            <p className={s.metricLabel}>Projetos entregues</p>
          </li>
          <li>
            <span className={s.metricIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d={ICONS.target} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className={s.metricValue}>
              <Count to={100} start={counting} reduced={reduced} />%
            </p>
            <p className={s.metricLabel}>Foco em resultados</p>
          </li>
          <li>
            <span className={s.metricIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d={ICONS.bolt} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className={`${s.metricValue} ${s.metricWord}`}>Performance</p>
            <p className={s.metricLabel}>Velocidade que gera conversão</p>
          </li>
        </ul>
      </div>

      <div className={s.scrollHint} data-gone={scrolled} aria-hidden="true">
        <span>Scroll para explorar</span>
        <svg className={s.scrollArrow} viewBox="0 0 24 14" fill="none">
          <path
            d="M2 2 12 12 22 2"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className={s.scrollTrack} />
      </div>
    </section>
  );
}
