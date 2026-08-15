import type { Metadata } from "next";
import { Archivo, Instrument_Sans } from "next/font/google";
import "./globals.css";

const display = Archivo({
  subsets: ["latin"],
  variable: "--f-display",
  display: "swap",
  axes: ["wdth"],
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--f-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FANTINCO — Landing pages, SaaS e lojas online",
  description:
    "Desenvolvemos soluções digitais que impulsionam negócios. Design. Código. Resultado.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
