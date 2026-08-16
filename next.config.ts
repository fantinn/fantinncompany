import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tira o painel de ferramentas do Next da tela em desenvolvimento.
  // Erros de compilação e execução continuam aparecendo.
  devIndicators: false,
};

export default nextConfig;
