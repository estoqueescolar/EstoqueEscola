import { CenaDespensa } from "./cena-despensa";

// Marca do CAPE, a instituição que recebe o sistema.
function MarcaCape() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary font-heading text-sm font-semibold tracking-wide text-primary-foreground">
        CAPE
      </span>
      <span className="leading-tight">
        <span className="block font-heading text-base font-semibold text-primary">Despensa CAPE</span>
        <span className="block text-sm text-muted-foreground">Centro de Apoio Pedagógico Especializado</span>
      </span>
    </div>
  );
}

// Telas de acesso: à esquerda, a despensa em 3D sobre o fundo claro (só em telas grandes), separada
// do formulário por uma linha; à direita, o formulário.
// No celular, só a marca e o formulário.
export default function LayoutAcesso({ children }: LayoutProps<"/">) {
  return (
    <main className="grid min-h-dvh flex-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <section
        aria-label="Apresentação do sistema"
        className="relative flex flex-col border-b px-4 py-5 sm:px-8 lg:my-10 lg:border-r lg:border-b-0 lg:px-12 lg:py-2"
      >
        <MarcaCape />
        <p className="mt-4 text-lg font-semibold tracking-tight text-primary lg:mt-8 lg:max-w-md lg:text-4xl lg:leading-tight">
          Cada alimento no seu tempo.
        </p>
        <div className="hidden min-h-0 flex-1 pt-4 lg:flex lg:flex-col">
          <CenaDespensa />
        </div>
      </section>

      <div className="flex flex-col items-center justify-center px-4 py-10 sm:py-14 lg:px-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}
