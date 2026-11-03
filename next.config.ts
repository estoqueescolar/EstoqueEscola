import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desligado: todas as telas dependem do usuário logado e de dados que mudam a cada registro,
  // então o cache de componentes não traz ganho e exigiria <Suspense> em toda leitura de sessão.
  // Decisão registrada no README (seção "Decisões").
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
