import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, ".") },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // testes de RLS precisam do Supabase local; rodam com `npm run test:rls`
    exclude: ["tests/rls/**", "node_modules/**"],
  },
});
