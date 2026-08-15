import Chrome from "@/components/Chrome";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import { Stats, Services, Work, Process, Contact, Footer } from "@/components/Sections";

export default function Home() {
  return (
    <>
      <Chrome />
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Services />
        <Work />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
