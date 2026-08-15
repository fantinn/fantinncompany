"use client";

import { useState } from "react";
import Logo from "./Logo";
import s from "./site.module.css";

export default function Nav() {
  const [grid, setGrid] = useState(false);

  const toggleGrid = () => {
    const next = !grid;
    setGrid(next);
    document.documentElement.dataset.grid = next ? "on" : "off";
  };

  return (
    <header className={s.nav}>
      <div className={`shell ${s.navInner}`}>
        <a href="#topo" className={s.mark}>
          <Logo className={s.markLogo} />
          <span>
            FANTIN<span className={s.markCo}>CO</span>
          </span>
        </a>

        <nav className={s.navLinks} aria-label="Seções">
          <a href="#trabalho">Trabalho</a>
          <a href="#processo">Processo</a>
          <a href="#servicos">Serviços</a>
        </nav>

        <div className={s.navEnd}>
          <button
            type="button"
            className={s.gridToggle}
            aria-pressed={grid}
            onClick={toggleGrid}
          >
            Grade
          </button>
          <a className={s.btnSmall} href="#contato">
            Começar
          </a>
        </div>
      </div>
    </header>
  );
}
