"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion, useWebGL } from "@/lib/clientState";
import { ANATOMIES } from "./data";
import { SWATCH } from "./texture";
import Laptop from "./Laptop";
import Poster from "./Poster";
import s from "./anatomy.module.css";

type Props = { collapseRef: React.RefObject<number> };

export default function Anatomy({ collapseRef }: Props) {
  const [index, setIndex] = useState(0);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const stage = useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const anatomy = ANATOMIES[index];
  const note = highlight
    ? anatomy.layers.find((l) => l.id === highlight)?.note
    : anatomy.tagline;

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: "200px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={s.wrap}>
      <div className={s.stage} ref={stage}>
        {webgl === false && <Poster anatomy={anatomy} />}
        {webgl === true && (
          <Canvas
            dpr={[1, 2]}
            frameloop={active ? "always" : "never"}
            camera={{ fov: 32, position: [0, 0, 9] }}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: "high-performance",
              toneMapping: THREE.NeutralToneMapping,
            }}
          >
            <Laptop
              anatomy={anatomy}
              collapseRef={collapseRef}
              highlight={highlight}
              reduced={reduced}
            />
          </Canvas>
        )}
      </div>

      <div className={s.console}>
        <div className={s.switcher} role="group" aria-label="Tipo de produto">
          {ANATOMIES.map((a, i) => (
            <button
              key={a.id}
              type="button"
              className={s.tab}
              aria-pressed={i === index}
              onClick={() => {
                setIndex(i);
                setHighlight(null);
              }}
            >
              {a.label}
            </button>
          ))}
        </div>

        <ol className={s.legend} onMouseLeave={() => setHighlight(null)}>
          {anatomy.layers.map((layer, i) => (
            <li key={layer.id}>
              <button
                type="button"
                className={s.layer}
                data-lit={highlight === layer.id}
                aria-pressed={highlight === layer.id}
                onMouseEnter={() => setHighlight(layer.id)}
                onFocus={() => setHighlight(layer.id)}
                onBlur={() => setHighlight(null)}
                onClick={() => setHighlight(highlight === layer.id ? null : layer.id)}
              >
                <span className={s.num}>{String(i + 1).padStart(2, "0")}</span>
                <span className={s.swatch} style={{ background: SWATCH[layer.ink] }} />
                <span className={s.name}>{layer.label}</span>
                <span className="srOnly">. {layer.note}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <p className={s.note} aria-hidden="true">
        {note}
      </p>
    </div>
  );
}
