import { defineConfig, loadEnv } from "vite";

// Testes de RLS e das RPCs contra o Supabase local (npx supabase start + db reset).
export default defineConfig(({ mode }) => ({
  test: {
    environment: "node",
    include: ["tests/rls/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 20000,
    env: loadEnv(mode, process.cwd(), ""),
  },
}));
