import React, { useState, useEffect } from "react";
import {
  FiBox,
  FiTrash2,
  FiCheckCircle,
  FiSlash,
  FiX,
  FiChevronUp,
  FiChevronDown,
  FiChevronsLeft,
  FiChevronLeft,
  FiRefreshCw,
  FiChevronRight,
  FiChevronsRight,
} from "react-icons/fi";
import "./Itens.css";
import {
  listarSaidas,
  deletarSaida,
  finalizarSaida,
  cancelarSaida,
} from "../../../services/saidaEstoqueService";
import { useNavigate } from "react-router-dom";

const ItensSaida = () => {
  const [saidas, setSaidas] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [buscaData, setBuscaData] = useState("");
  const [saidaSelecionada, setSaidaSelecionada] = useState(null);
  const [acaoConfirmacao, setAcaoConfirmacao] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ordenacao, setOrdenacao] = useState({
    coluna: "id",
    direcao: "asc",
  });

  const itensPorPagina = 10;
  const navigate = useNavigate();

  const formatarMoeda = (valor) => {
    const valorNumerico = Number(valor) || 0;

    return valorNumerico.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

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
    const buscarSaidas = async () => {
      try {
        const response = await listarSaidas();
        setSaidas(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar saídas", "erro");
      }
    };
    buscarSaidas();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletarSaida(id);
      setSaidas((saidasAtuais) =>
        saidasAtuais.filter((saida) => saida.id !== id),
      );

      mostrarMensagem("Saída excluída com sucesso", "sucesso");
      setSaidaSelecionada(null);
      setAcaoConfirmacao("");
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir saída.";

      mostrarMensagem(mensagemErro, "erro");
      setSaidaSelecionada(null);
      setAcaoConfirmacao("");
    }
  };

  const handleFinalizar = async (saida) => {
    try {
      await finalizarSaida(saida.id);
      setSaidas((saidasAtuais) =>
        saidasAtuais.map((saidaAtual) =>
          saidaAtual.id === saida.id
            ? { ...saidaAtual, status: "FINALIZADA" }
            : saidaAtual,
        ),
      );
      mostrarMensagem("Saída finalizada com sucesso", "sucesso");
      setSaidaSelecionada(null);
      setAcaoConfirmacao("");
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao finalizar saída.";
      mostrarMensagem(mensagemErro, "erro");
      setSaidaSelecionada(null);
      setAcaoConfirmacao("");
    }
  };

  const handleCancelar = async (saida) => {
    try {
      await cancelarSaida(saida.id);
      setSaidas((saidasAtuais) =>
        saidasAtuais.map((saidaAtual) =>
          saidaAtual.id === saida.id
            ? { ...saidaAtual, status: "CANCELADA" }
            : saidaAtual,
        ),
      );
      mostrarMensagem("Saída cancelada com sucesso", "sucesso");
      setSaidaSelecionada(null);
      setAcaoConfirmacao("");
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao cancelar saída.";
      mostrarMensagem(mensagemErro, "erro");
      setSaidaSelecionada(null);
      setAcaoConfirmacao("");
    }
  };

  const saidasFiltradas = saidas.filter((saida) => {
    const buscaFormatada = busca.toLowerCase();

    const matchBusca =
      saida.almoxarifadoNome.toLowerCase().includes(buscaFormatada) ||
      String(saida.id).includes(buscaFormatada);

    const matchData = buscaData === "" || saida.dataSaida === buscaData;
    return matchBusca && matchData;
  });

  const handleOrdenar = (coluna) => {
    setOrdenacao((ordenacaoAtual) => {
      if (ordenacaoAtual.coluna === coluna) {
        return {
          coluna,
          direcao: ordenacaoAtual.direcao === "asc" ? "desc" : "asc",
        };
      }

      return {
        coluna,
        direcao: "asc",
      };
    });
  };

  const saidasOrdenadas = [...saidasFiltradas].sort((a, b) => {
    let valorA = a[ordenacao.coluna];
    let valorB = b[ordenacao.coluna];

    if (ordenacao.coluna === "id" || ordenacao.coluna === "valorTotal") {
      valorA = Number(valorA);
      valorB = Number(valorB);
    } else if (ordenacao.coluna === "dataSaida") {
      valorA = String(valorA);
      valorB = String(valorB);
    } else {
      valorA = String(valorA ?? "").toLowerCase();
      valorB = String(valorB ?? "").toLowerCase();
    }

    if (valorA < valorB) {
      return ordenacao.direcao === "asc" ? -1 : 1;
    }

    if (valorA > valorB) {
      return ordenacao.direcao === "asc" ? 1 : -1;
    }

    return 0;
  });

  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;

  const saidasPaginadas = saidasOrdenadas.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(saidasOrdenadas.length / itensPorPagina);
  const inicioExibido = saidasOrdenadas.length > 0 ? indiceInicial + 1 : 0;
  const fimExibido = Math.min(indiceFinal, saidasOrdenadas.length);

  const handlePrimeiraPagina = () => {
    setPaginaAtual(1);
  };

  const handlePaginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const handleRecarregar = () => {
    setBusca("");
    setBuscaData("");
    setPaginaAtual(1);
  };

  const handleProximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const handleUltimaPagina = () => {
    setPaginaAtual(totalPaginas);
  };

  return (
    <div className="gerenciamento-itens-page">
      <div className="gerenciamento-itens-header">
        <h1>Itens da Saída</h1>
        <p>Gerencie os itens das saídas cadastradas</p>
      </div>
      <div className="gerenciamento-itens-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Almoxarifado..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
        />
        <div className="date-filter-group">
          <input
            type="date"
            placeholder="Buscar por data"
            value={buscaData}
            onChange={(e) => {
              setBuscaData(e.target.value);
              setPaginaAtual(1);
            }}
          />
          <button
            type="button"
            className="clear-date-button"
            onClick={() => {
              setBuscaData("");
              setPaginaAtual(1);
            }}
          >
            <FiX />
          </button>
        </div>
        <button type="button" onClick={() => navigate("/saida/cadastro")}>
          + Nova Saída
        </button>
        <div className="pagination-controls">
          <button
            className="first"
            onClick={handlePrimeiraPagina}
            disabled={paginaAtual === 1}
          >
            <FiChevronsLeft />
          </button>
          <button
            className="previous"
            onClick={handlePaginaAnterior}
            disabled={paginaAtual === 1}
          >
            <FiChevronLeft />
          </button>
          <button className="refresh" onClick={handleRecarregar}>
            <FiRefreshCw />
          </button>
          <button
            className="next"
            onClick={handleProximaPagina}
            disabled={totalPaginas === 0 || paginaAtual === totalPaginas}
          >
            <FiChevronRight />
          </button>
          <button
            className="last"
            onClick={handleUltimaPagina}
            disabled={totalPaginas === 0 || paginaAtual === totalPaginas}
          >
            <FiChevronsRight />
          </button>
          <span className="total-itens">
            {`${inicioExibido} - ${fimExibido} / ${saidasOrdenadas.length}`}
          </span>
        </div>
      </div>
      <div className="gerenciamento-itens-card">
        <table className="gerenciamento-itens-table">
          <thead>
            <tr>
              <th onClick={() => handleOrdenar("id")}>
                <span className="sortable-header">
                  ID
                  {ordenacao.coluna === "id" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th onClick={() => handleOrdenar("almoxarifadoNome")}>
                <span className="sortable-header">
                  Almoxarifado
                  {ordenacao.coluna === "almoxarifadoNome" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th onClick={() => handleOrdenar("dataSaida")}>
                <span className="sortable-header">
                  Data
                  {ordenacao.coluna === "dataSaida" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th onClick={() => handleOrdenar("valorTotal")}>
                <span className="sortable-header">
                  Valor Total
                  {ordenacao.coluna === "valorTotal" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th onClick={() => handleOrdenar("status")}>
                <span className="sortable-header">
                  Status
                  {ordenacao.coluna === "status" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {saidasPaginadas.map((saida) => (
              <tr key={saida.id}>
                <td>{saida.id}</td>
                <td>{saida.almoxarifadoNome}</td>
                <td>{saida.dataSaida}</td>
                <td className="saida-total-value">
                  {formatarMoeda(saida.valorTotal)}
                </td>
                <td>
                  <span
                    className={`saida-status ${saida.status === "ABERTA" ? "saida-status-open" : saida.status === "FINALIZADA" ? "saida-status-finished" : "saida-status-canceled"}`}
                  >
                    {saida.status === "ABERTA"
                      ? "Aberta"
                      : saida.status === "FINALIZADA"
                        ? "Finalizada"
                        : "Cancelada"}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="action-button edit-button"
                    onClick={() => navigate(`/saida/itens/${saida.id}`)}
                    title="Gerenciar itens da saída"
                    aria-label="Gerenciar itens da saída"
                  >
                    <FiBox />
                  </button>
                  <button
                    type="button"
                    className="action-button finish-button"
                    onClick={() => {
                      setSaidaSelecionada(saida);
                      setAcaoConfirmacao("finalizar");
                    }}
                    title="Finalizar saída"
                    aria-label="Finalizar saída"
                  >
                    <FiCheckCircle />
                  </button>
                  <button
                    type="button"
                    className="action-button finish-cancel"
                    onClick={() => {
                      setSaidaSelecionada(saida);
                      setAcaoConfirmacao("cancelar");
                    }}
                    title="Cancelar saída"
                    aria-label="Cancelar saída"
                  >
                    <FiSlash />
                  </button>

                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => {
                      setSaidaSelecionada(saida);
                      setAcaoConfirmacao("excluir");
                    }}
                    title="Excluir saída"
                    aria-label="Excluir saída"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {saidaSelecionada && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            {acaoConfirmacao === "finalizar" ? (
              <h2>Finalizar saída</h2>
            ) : acaoConfirmacao === "cancelar" ? (
              <h2>Cancelar saída</h2>
            ) : (
              <h2>Excluir saída</h2>
            )}
            {acaoConfirmacao === "finalizar" ? (
              <p>
                Tem certeza que deseja finalizar{" "}
                <strong>{saidaSelecionada.id}</strong>?
              </p>
            ) : acaoConfirmacao === "cancelar" ? (
              <p>
                Tem certeza que deseja cancelar{" "}
                <strong>{saidaSelecionada.id}</strong>?
              </p>
            ) : (
              <p>
                Tem certeza que deseja excluir{" "}
                <strong>{saidaSelecionada.id}</strong>?
              </p>
            )}

            <div className="confirm-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setSaidaSelecionada(null);
                  setAcaoConfirmacao("");
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => {
                  acaoConfirmacao === "finalizar"
                    ? handleFinalizar(saidaSelecionada)
                    : acaoConfirmacao === "cancelar"
                      ? handleCancelar(saidaSelecionada)
                      : handleDelete(saidaSelecionada.id);
                }}
              >
                {acaoConfirmacao === "finalizar"
                  ? "Finalizar"
                  : acaoConfirmacao === "cancelar"
                    ? "Cancelar"
                    : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
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

export default ItensSaida;
