import { CheckIcon, CircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  senha: string;
  // quando informado, mostra também se a confirmação confere
  confirmacao?: string;
  id?: string;
}

// Lista de requisitos marcada enquanto a pessoa digita (mesmas regras do esquema senhaNova).
// Ícone + texto: o estado nunca depende só da cor.
export function RequisitosSenha({ senha, confirmacao, id }: Props) {
  const itens = [
    { texto: "Pelo menos 8 caracteres", ok: senha.length >= 8 },
    { texto: "Pelo menos uma letra", ok: /[A-Za-z]/.test(senha) },
    { texto: "Pelo menos um número", ok: /\d/.test(senha) },
    ...(confirmacao !== undefined
      ? [
          {
            texto: "As duas senhas são iguais",
            ok: senha.length > 0 && senha === confirmacao,
          },
        ]
      : []),
  ];

  const atendidos = itens.filter((i) => i.ok).length;

  return (
    <>
      <ul
        id={id}
        aria-label="Requisitos da senha"
        className="grid gap-1 text-sm sm:grid-cols-2"
      >
        {itens.map(({ texto, ok }) => (
          <li
            key={texto}
            className={cn(
              "flex items-center gap-2",
              ok ? "text-primary" : "text-muted-foreground",
            )}
          >
            {ok ? (
              <CheckIcon className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <CircleIcon className="size-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>
              {texto}
              <span className="sr-only">
                {ok ? ": atendido" : ": pendente"}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {/* resumo curto anunciado a cada mudança (a lista inteira seria lida a cada tecla) */}
      <p aria-live="polite" className="sr-only">
        {senha
          ? `${atendidos} de ${itens.length} requisitos da senha atendidos.`
          : ""}
      </p>
    </>
  );
}
