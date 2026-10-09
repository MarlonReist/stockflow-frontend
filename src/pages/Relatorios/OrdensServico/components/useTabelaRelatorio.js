import { useEffect, useMemo, useState } from "react";

const comparar = (valorA, valorB) => {
  if (typeof valorA === "number" || typeof valorB === "number") return Number(valorA || 0) - Number(valorB || 0);
  return String(valorA ?? "").localeCompare(String(valorB ?? ""), "pt-BR", { numeric: true, sensitivity: "base" });
};

export const useTabelaRelatorio = (dados = [], campoInicial, direcaoInicial = "asc", itensPorPagina = 10) => {
  const [ordenacao, setOrdenacao] = useState({ campo: campoInicial, direcao: direcaoInicial });
  const [paginaAtual, setPaginaAtual] = useState(1);

  const dadosOrdenados = useMemo(() => [...dados].sort((a, b) => {
    const resultado = comparar(a[ordenacao.campo], b[ordenacao.campo]);
    return ordenacao.direcao === "asc" ? resultado : -resultado;
  }), [dados, ordenacao]);

  const totalPaginas = Math.ceil(dadosOrdenados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const dadosPaginados = dadosOrdenados.slice(inicio, inicio + itensPorPagina);

  useEffect(() => { setPaginaAtual(1); }, [dados, ordenacao]);
  useEffect(() => {
    if (totalPaginas > 0 && paginaAtual > totalPaginas) setPaginaAtual(totalPaginas);
  }, [paginaAtual, totalPaginas]);

  const ordenarPor = (campo) => setOrdenacao((atual) => atual.campo === campo
    ? { campo, direcao: atual.direcao === "asc" ? "desc" : "asc" }
    : { campo, direcao: "asc" });

  return { dadosOrdenados, dadosPaginados, ordenacao, ordenarPor, paginaAtual, setPaginaAtual, totalPaginas, inicio, totalItens: dadosOrdenados.length };
};
