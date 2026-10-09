import React from "react";
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import "./TabelaRelatorio.css";

export const CabecalhoOrdenavel = ({ campo, ordenacao, ordenarPor, children }) => (
  <th><button type="button" className="relatorio-ordenar" onClick={() => ordenarPor(campo)}>{children}{ordenacao.campo === campo && (ordenacao.direcao === "asc" ? <FiChevronUp /> : <FiChevronDown />)}</button></th>
);

export const PaginacaoRelatorio = ({ paginaAtual, setPaginaAtual, totalPaginas, inicio, totalItens, itensPorPagina = 10 }) => (
  <div className="relatorio-paginacao no-print">
    <span>{totalItens ? `${inicio + 1}–${Math.min(inicio + itensPorPagina, totalItens)} de ${totalItens}` : "0 resultados"}</span>
    <div>
      <button type="button" aria-label="Primeira página" onClick={() => setPaginaAtual(1)} disabled={paginaAtual === 1}><FiChevronsLeft /></button>
      <button type="button" aria-label="Página anterior" onClick={() => setPaginaAtual((atual) => Math.max(1, atual - 1))} disabled={paginaAtual === 1}><FiChevronLeft /></button>
      <span>Página {totalPaginas ? paginaAtual : 0} de {totalPaginas}</span>
      <button type="button" aria-label="Próxima página" onClick={() => setPaginaAtual((atual) => Math.min(totalPaginas, atual + 1))} disabled={!totalPaginas || paginaAtual === totalPaginas}><FiChevronRight /></button>
      <button type="button" aria-label="Última página" onClick={() => setPaginaAtual(totalPaginas)} disabled={!totalPaginas || paginaAtual === totalPaginas}><FiChevronsRight /></button>
    </div>
  </div>
);
