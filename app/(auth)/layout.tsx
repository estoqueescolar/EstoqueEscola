import { CenaDespensa } from "./cena-despensa";

// Marca do CAPE, a instituição que recebe o sistema.
function MarcaCape() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white font-heading text-sm font-semibold tracking-wide text-primary">
        CAPE
      </span>
      <span className="leading-tight">
        <span className="block font-heading text-base font-semibold">Despensa CAPE</span>
        <span className="block text-sm">Centro de Apoio Pedagógico Especializado</span>
      </span>
    </div>
  );
}

// Telas de acesso: à esquerda, a despensa em 3D (só em telas grandes); à direita, o formulário.
// No celular, só a marca e o formulário.
export default function LayoutAcesso({ children }: LayoutProps<"/">) {
  return (
    <main className="grid min-h-dvh flex-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <section
        aria-labelledby="titulo-apresentacao"
        className="relative flex flex-col overflow-hidden bg-[radial-gradient(120%_90%_at_30%_10%,#3C7F5F_0%,#2F6B4F_45%,#22513B_100%)] px-4 py-5 text-primary-foreground sm:px-8 lg:m-3 lg:rounded-3xl lg:px-10 lg:py-9 [&_:focus-visible]:outline-white"
      >
        <MarcaCape />
        <h2 id="titulo-apresentacao" className="mt-4 text-lg font-semibold tracking-tight lg:mt-8 lg:max-w-md lg:text-4xl lg:leading-tight">
          Cada alimento no seu tempo.
        </h2>
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
