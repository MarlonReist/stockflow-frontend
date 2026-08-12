import React, { useEffect, useMemo, useState } from "react";
import { FiPrinter } from "react-icons/fi";
import {
  gerarPdfHistoricoMovimentacoes,
  listarHistoricoMovimentacoes,
} from "../../../services/historicoService";
import "./HistoricoMovimentacoes.css";

const itensPorPagina = 10;

const HistoricoMovimentacoes = () => {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [filtros, setFiltros] = useState({
    busca: "",
    origem: "",
    tipo: "",
    dataInicial: "",
    dataFinal: "",
  });
  const [ordenacao, setOrdenacao] = useState({
    campo: "dataMovimentacao",
    direcao: "desc",
  });
  const [paginaAtual, setPaginaAtual] = useState(1);

  const mostrarMensagem = (texto, tipo) => {
    const id = `${Date.now()}-${Math.random()}`;

    setMensagens((mensagensAtuais) => [
      ...mensagensAtuais,
      { id, texto, tipo },
    ]);

    setTimeout(() => {
      setMensagens((mensagensAtuais) =>
        mensagensAtuais.filter((mensagem) => mensagem.id !== id),
      );
    }, 3000);
  };

  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        const response = await listarHistoricoMovimentacoes();
        setMovimentacoes(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar histórico de movimentações.", "erro");
      }
    };

    carregarHistorico();
  }, []);

  const formatarData = (data) => {
    if (!data) {
      return "-";
    }

    return data.split("-").reverse().join("/");
  };

  const getOrigemMovimentacao = (movimentacao) => {
    if (movimentacao.entradaEstoqueId) {
      return {
        origem: "Entrada",
        idOrigem: movimentacao.entradaEstoqueId,
      };
    }

    if (movimentacao.saidaEstoqueId) {
      return {
        origem: "Saída",
        idOrigem: movimentacao.saidaEstoqueId,
      };
    }

    if (movimentacao.transferenciaAlmoxarifadoId) {
      return {
        origem: "Transferência",
        idOrigem: movimentacao.transferenciaAlmoxarifadoId,
      };
    }

    if (movimentacao.ordemDeServicoId) {
      return {
        origem: "Ordem de Serviço",
        idOrigem: movimentacao.ordemDeServicoId,
      };
    }

    return {
      origem: "-",
      idOrigem: "-",
    };
  };

  const handleChangeFiltro = (event) => {
    const { name, value } = event.target;

    setFiltros((filtrosAtuais) => ({
      ...filtrosAtuais,
      [name]: value,
    }));
    setPaginaAtual(1);
  };

  const handleLimparFiltros = () => {
    setFiltros({
      busca: "",
      origem: "",
      tipo: "",
      dataInicial: "",
      dataFinal: "",
    });
    setPaginaAtual(1);
  };

  const handleImprimir = async () => {
    try {
      const response = await gerarPdfHistoricoMovimentacoes(filtros);
      const pdfUrl = URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      const janelaPdf = window.open(pdfUrl, "_blank");

      if (!janelaPdf) {
        mostrarMensagem("Permita pop-ups para abrir o relatÃ³rio.", "erro");
      }

      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } catch (error) {
      mostrarMensagem("Erro ao gerar relatÃ³rio em PDF.", "erro");
    }
  };

  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoes.filter((movimentacao) => {
      const origem = getOrigemMovimentacao(movimentacao);
      const buscaFormatada = filtros.busca.trim().toLowerCase();
      const tipoFormatado = movimentacao.tipo?.toLowerCase() || "";
      const produtoFormatado = movimentacao.produtoNome?.toLowerCase() || "";
      const almoxarifadoFormatado =
        movimentacao.almoxarifadoNome?.toLowerCase() || "";

      const passouNaBusca =
        !buscaFormatada ||
        produtoFormatado.includes(buscaFormatada) ||
        almoxarifadoFormatado.includes(buscaFormatada) ||
        tipoFormatado.includes(buscaFormatada) ||
        origem.origem.toLowerCase().includes(buscaFormatada) ||
        String(origem.idOrigem).includes(buscaFormatada);

      const passouNaOrigem =
        !filtros.origem || origem.origem === filtros.origem;

      const passouNoTipo =
        !filtros.tipo || movimentacao.tipo === filtros.tipo;

      const passouNaDataInicial =
        !filtros.dataInicial ||
        movimentacao.dataMovimentacao >= filtros.dataInicial;

      const passouNaDataFinal =
        !filtros.dataFinal || movimentacao.dataMovimentacao <= filtros.dataFinal;

      return (
        passouNaBusca &&
        passouNaOrigem &&
        passouNoTipo &&
        passouNaDataInicial &&
        passouNaDataFinal
      );
    });
  }, [movimentacoes, filtros]);

  const getValorOrdenacao = (movimentacao, campo) => {
    const origem = getOrigemMovimentacao(movimentacao);

    const valores = {
      dataMovimentacao: movimentacao.dataMovimentacao,
      tipo: movimentacao.tipo,
      produtoNome: movimentacao.produtoNome,
      almoxarifadoNome: movimentacao.almoxarifadoNome,
      quantidade: movimentacao.quantidade,
      origem: origem.origem,
      idOrigem: origem.idOrigem,
    };

    return valores[campo] ?? "";
  };

  const movimentacoesOrdenadas = useMemo(() => {
    return [...movimentacoesFiltradas].sort((movimentacaoA, movimentacaoB) => {
      const valorA = getValorOrdenacao(movimentacaoA, ordenacao.campo);
      const valorB = getValorOrdenacao(movimentacaoB, ordenacao.campo);

      if (typeof valorA === "number" && typeof valorB === "number") {
        return ordenacao.direcao === "asc"
          ? valorA - valorB
          : valorB - valorA;
      }

      return ordenacao.direcao === "asc"
        ? String(valorA).localeCompare(String(valorB), "pt-BR")
        : String(valorB).localeCompare(String(valorA), "pt-BR");
    });
  }, [movimentacoesFiltradas, ordenacao]);

  const handleOrdenar = (campo) => {
    setOrdenacao((ordenacaoAtual) => {
      if (ordenacaoAtual.campo === campo) {
        return {
          campo,
          direcao: ordenacaoAtual.direcao === "asc" ? "desc" : "asc",
        };
      }

      return {
        campo,
        direcao: "asc",
      };
    });

    setPaginaAtual(1);
  };

  const getIndicadorOrdenacao = (campo) => {
    if (ordenacao.campo !== campo) {
      return "";
    }

    return ordenacao.direcao === "asc" ? " ↑" : " ↓";
  };

  const totalPaginas = Math.max(
    1,
    Math.ceil(movimentacoesOrdenadas.length / itensPorPagina),
  );

  const movimentacoesPaginadas = movimentacoesOrdenadas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina,
  );

  const irParaPaginaAnterior = () => {
    setPaginaAtual((pagina) => Math.max(1, pagina - 1));
  };

  const irParaProximaPagina = () => {
    setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1));
  };

  return (
    <div className="historico-page">
      <div className="historico-header">
        <div>
          <h1>Histórico de Movimentações</h1>
          <p>Consulte todas as alterações realizadas no estoque</p>
        </div>

        <button
          type="button"
          className="historico-print-button"
          onClick={handleImprimir}
        >
          <FiPrinter />
          Imprimir
        </button>
      </div>

      <div className="historico-card">
        <div className="historico-filters">
          <div className="historico-filter-group historico-filter-search">
            <label htmlFor="busca">Busca</label>
            <input
              id="busca"
              name="busca"
              type="text"
              placeholder="Produto, almoxarifado, origem ou ID..."
              value={filtros.busca}
              onChange={handleChangeFiltro}
            />
          </div>

          <div className="historico-filter-group">
            <label htmlFor="origem">Origem</label>
            <select
              id="origem"
              name="origem"
              value={filtros.origem}
              onChange={handleChangeFiltro}
            >
              <option value="">Todas</option>
              <option value="Entrada">Entrada</option>
              <option value="Saída">Saída</option>
              <option value="Transferência">Transferência</option>
              <option value="Ordem de Serviço">Ordem de Serviço</option>
            </select>
          </div>

          <div className="historico-filter-group">
            <label htmlFor="tipo">Tipo</label>
            <select
              id="tipo"
              name="tipo"
              value={filtros.tipo}
              onChange={handleChangeFiltro}
            >
              <option value="">Todos</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </select>
          </div>

          <div className="historico-filter-group">
            <label htmlFor="dataInicial">Data inicial</label>
            <input
              id="dataInicial"
              name="dataInicial"
              type="date"
              value={filtros.dataInicial}
              onChange={handleChangeFiltro}
            />
          </div>

          <div className="historico-filter-group">
            <label htmlFor="dataFinal">Data final</label>
            <input
              id="dataFinal"
              name="dataFinal"
              type="date"
              value={filtros.dataFinal}
              onChange={handleChangeFiltro}
            />
          </div>

          <button
            type="button"
            className="historico-clear-button"
            onClick={handleLimparFiltros}
          >
            Limpar
          </button>
        </div>

        <div className="historico-table-wrapper">
          <table className="historico-table">
            <thead>
              <tr>
                <th>
                  <button
                    type="button"
                    onClick={() => handleOrdenar("dataMovimentacao")}
                  >
                    Data{getIndicadorOrdenacao("dataMovimentacao")}
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => handleOrdenar("tipo")}>
                    Tipo{getIndicadorOrdenacao("tipo")}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    onClick={() => handleOrdenar("produtoNome")}
                  >
                    Produto{getIndicadorOrdenacao("produtoNome")}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    onClick={() => handleOrdenar("almoxarifadoNome")}
                  >
                    Almoxarifado{getIndicadorOrdenacao("almoxarifadoNome")}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    onClick={() => handleOrdenar("quantidade")}
                  >
                    Quantidade{getIndicadorOrdenacao("quantidade")}
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => handleOrdenar("origem")}>
                    Origem{getIndicadorOrdenacao("origem")}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    onClick={() => handleOrdenar("idOrigem")}
                  >
                    ID Origem{getIndicadorOrdenacao("idOrigem")}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {movimentacoesPaginadas.length > 0 ? (
                movimentacoesPaginadas.map((movimentacao) => {
                  const origem = getOrigemMovimentacao(movimentacao);

                  return (
                    <tr key={movimentacao.id}>
                      <td>{formatarData(movimentacao.dataMovimentacao)}</td>
                      <td>{movimentacao.tipo}</td>
                      <td>{movimentacao.produtoNome}</td>
                      <td>{movimentacao.almoxarifadoNome}</td>
                      <td>{movimentacao.quantidade}</td>
                      <td>{origem.origem}</td>
                      <td>{origem.idOrigem}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state-cell">
                    Nenhuma movimentação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="historico-pagination">
          <span>
            Mostrando {movimentacoesPaginadas.length} de{" "}
            {movimentacoesFiltradas.length} movimentações
          </span>

          <div className="historico-pagination-controls">
            <button
              type="button"
              disabled={paginaAtual === 1}
              onClick={irParaPaginaAnterior}
            >
              Anterior
            </button>
            <span>
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              type="button"
              disabled={paginaAtual === totalPaginas}
              onClick={irParaProximaPagina}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      <div className="toast-container">
        {mensagens.map((mensagem) => (
          <div
            key={mensagem.id}
            className={`form-message form-message-${mensagem.tipo}`}
          >
            {mensagem.texto}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoricoMovimentacoes;
