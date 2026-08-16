import Hero from "@/components/hero/Hero";

/* Só a primeira dobra por enquanto. Os componentes das outras seções
   continuam no repositório, fora da página. */
export default function Home() {
  return (
    <main>
      <Hero />
      {/* Espaço para a transição de saída acontecer. Sai quando a próxima
          seção existir. */}
      <div style={{ height: "70vh" }} />
    </main>
  );
}
