import { describe, expect, test } from "vitest";
import {
  diasDaSemana, ehDataValida, inicioDaSemana, montarSemana, nomeDoDia, refeicoesPendentes, somarDias, totalAlunos,
} from "@/lib/regras/cardapio";

describe("semana do cardápio", () => {
  test("início da semana é a segunda-feira", () => {
    expect(inicioDaSemana("2026-11-05")).toBe("2026-11-02"); // quinta
    expect(inicioDaSemana("2026-11-02")).toBe("2026-11-02"); // segunda
  });

  test("sábado e domingo levam à semana seguinte", () => {
    expect(inicioDaSemana("2026-11-07")).toBe("2026-11-09");
    expect(inicioDaSemana("2026-11-08")).toBe("2026-11-09");
  });

  test("dias letivos vão de segunda a sexta, inclusive na virada do mês", () => {
    expect(diasDaSemana("2026-11-30")).toEqual(["2026-11-30", "2026-12-01", "2026-12-02", "2026-12-03", "2026-12-04"]);
  });

  test("soma dias e dá o nome do dia", () => {
    expect(somarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(nomeDoDia("2026-11-03")).toBe("Terça-feira");
  });

  test("valida datas AAAA-MM-DD", () => {
    expect(ehDataValida("2026-02-28")).toBe(true);
    expect(ehDataValida("2026-02-30")).toBe(false);
    expect(ehDataValida("03/11/2026")).toBe(false);
    expect(ehDataValida(undefined)).toBe(false);
  });

  test("monta a grade com refeições vazias como null", () => {
    const semana = montarSemana([{ data: "2026-11-03", tipo_refeicao: "almoco", descricao: "Arroz e feijão" }], "2026-11-02");
    expect(semana).toHaveLength(5);
    expect(semana[1].refeicoes.almoco).toBe("Arroz e feijão");
    expect(semana[1].refeicoes.cafe_da_manha).toBeNull();
    expect(refeicoesPendentes(semana[1])).toBe(3);
    expect(refeicoesPendentes(semana[0])).toBe(4);
  });
});

describe("restrições alimentares", () => {
  test("soma o total de alunos", () => {
    expect(totalAlunos([{ quantidade_alunos: 4 }, { quantidade_alunos: 2 }])).toBe(6);
    expect(totalAlunos([])).toBe(0);
  });

});
