import s from "./site.module.css";

/* Projetos de exemplo — trocar por trabalhos reais antes de publicar. */
const WORK = [
  {
    year: "2025",
    name: "Corveta Café",
    kind: "Loja online",
    what: "Catálogo de 240 SKUs com assinatura recorrente e checkout em três passos.",
  },
  {
    year: "2025",
    name: "Meridiano",
    kind: "SaaS",
    what: "Painel de operação para 40 franquias, com permissões por unidade.",
  },
  {
    year: "2024",
    name: "Pauta",
    kind: "Landing page",
    what: "Captação para lançamento de curso, com teste A/B na chamada principal.",
  },
  {
    year: "2024",
    name: "Oficina Norte",
    kind: "Loja online",
    what: "Peças sob medida com orçamento montado dentro do carrinho.",
  },
];

const STATS = [
  { value: "+50", label: "Projetos entregues" },
  { value: "+30", label: "Clientes satisfeitos" },
  { value: "100%", label: "Foco em resultados" },
];

const PROCESS = [
  {
    when: "Semana 1",
    title: "Diagnóstico",
    body: "Uma conversa de uma hora e um documento curto: quem compra, o que trava a venda hoje, o que precisa existir no dia do lançamento.",
  },
  {
    when: "Semanas 2–3",
    title: "Design",
    body: "Grade, hierarquia e telas principais. Você recebe protótipos navegáveis, não imagens soltas. Duas rodadas de ajuste já estão no prazo.",
  },
  {
    when: "Semanas 4–6",
    title: "Código",
    body: "Front-end, integrações, painel de conteúdo. Um link de teste é atualizado a cada dois dias — você acompanha em vez de esperar.",
  },
  {
    when: "Semana 7",
    title: "Resultado",
    body: "Publicação, medição, treino de uso e trinta dias de ajuste fino incluídos. Você sai com acesso a tudo.",
  },
];

const SERVICES = [
  {
    id: "landing",
    label: "Landing pages",
    headline: "Páginas que geram resultados",
    body: "Design estratégico e focado em conversão para o seu negócio vender mais.",
    items: ["Copy e estrutura", "Medição e teste A/B", "Painel para editar textos", "Formulários e integrações"],
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18" />
        <path d="M7 13h7" />
        <path d="M7 16.5h4" />
      </>
    ),
  },
  {
    id: "saas",
    label: "SaaS",
    headline: "Sistemas que escalam com você",
    body: "Soluções personalizadas para otimizar processos e aumentar sua produtividade.",
    items: ["Contas e permissões", "Painel e relatórios", "Cobrança recorrente", "Base para o time crescer"],
    icon: (
      <>
        <path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Z" />
        <path d="m3 12 9 4.5L21 12" />
        <path d="m3 16.5 9 4.5 9-4.5" />
      </>
    ),
  },
  {
    id: "loja",
    label: "Lojas online",
    headline: "Lojas completas e otimizadas",
    body: "Mais performance, melhor experiência e aumento real nas suas vendas.",
    items: ["Catálogo e variações", "Checkout e frete", "Pagamento e antifraude", "Relatórios de venda"],
    icon: (
      <>
        <path d="M5 8h14l-1.2 12H6.2L5 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>
    ),
  },
];

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function Stats() {
  return (
    <section className={`section dark ${s.statsSection}`}>
      <div className={`shell ${s.stats}`}>
        {STATS.map((stat, i) => (
          <div key={stat.label} data-reveal style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}>
            <p className={`display ${s.statValue}`}>{stat.value}</p>
            <p className="kicker">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Services() {
  return (
    <section className="section" id="servicos">
      <div className="shell">
        <header className={s.head} data-reveal>
          <p className="kicker">Serviços</p>
          <h2 className={`display ${s.h2}`}>
            Três anatomias, <span className="red">uma disciplina.</span>
          </h2>
          <hr className="rule" />
        </header>

        <div className={s.cards}>
          {SERVICES.map((sv, i) => (
            <article
              key={sv.id}
              className={s.card}
              data-reveal
              style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
            >
              <span className={s.cardIcon}>
                <Icon>{sv.icon}</Icon>
              </span>
              <p className="kicker">{sv.label}</p>
              <h3 className={`display ${s.cardTitle}`}>{sv.headline}</h3>
              <p className={s.cardBody}>{sv.body}</p>
              <ul className={s.cardList}>
                {sv.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Work() {
  return (
    <section className="section dark" id="trabalho">
      <div className="shell">
        <header className={s.head} data-reveal>
          <p className="kicker">Trabalho</p>
          <h2 className={`display ${s.h2}`}>
            Quatro projetos, <span className="red">quatro anatomias.</span>
          </h2>
          <hr className="rule" />
        </header>

        <ul className={s.table}>
          {WORK.map((w, i) => (
            <li key={w.name} data-reveal style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}>
              <a className={s.row} href="#contato">
                <span className={`kicker ${s.rowYear}`}>{w.year}</span>
                <span className={`display ${s.rowName}`}>{w.name}</span>
                <span className={`kicker ${s.rowKind}`}>{w.kind}</span>
                <span className={s.rowWhat}>{w.what}</span>
                <span className={s.rowArrow} aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section className="section" id="processo">
      <div className="shell">
        <header className={s.head} data-reveal>
          <p className="kicker">Processo</p>
          <h2 className={`display ${s.h2}`}>
            Sete semanas, <span className="red">sem surpresa no meio.</span>
          </h2>
          <hr className="rule" />
        </header>

        <ol className={s.steps}>
          {PROCESS.map((p, i) => (
            <li key={p.title} data-reveal style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}>
              <p className={`kicker ${s.stepWhen}`}>{p.when}</p>
              <h3 className={`display ${s.stepTitle}`}>{p.title}</h3>
              <p className={s.stepBody}>{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section className="section dark" id="contato">
      <div className="shell">
        <div className={s.contact} data-reveal>
          <p className="kicker">Contato</p>
          <h2 className={`display ${s.contactTitle}`}>
            Vamos tirar <span className="red">sua ideia</span> do papel?
          </h2>
          {/* Trocar pelo e-mail real. O Linktree veio do material da marca. */}
          <a className={s.mail} href="mailto:contato@fantinco.com.br">
            contato@fantinco.com.br
          </a>
          <ul className={s.facts}>
            <li>Resposta em até um dia útil.</li>
            <li>Orçamento fechado antes de começar.</li>
            <li>
              <a className={s.factLink} href="https://linktr.ee/fantinco">
                linktr.ee/fantinco ↗
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className={`dark ${s.footer}`}>
      <div className={`shell ${s.footerInner}`}>
        <span className="kicker">Design · Código · Resultado</span>
        <a className="kicker" href="#topo">
          Voltar ao topo ↑
        </a>
      </div>
    </footer>
  );
}
