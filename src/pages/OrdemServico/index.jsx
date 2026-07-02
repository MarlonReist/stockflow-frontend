import React, { useState, useEffect } from "react";
import {
  FiX,
  FiChevronUp,
  FiChevronDown,
  FiChevronsLeft,
  FiChevronLeft,
  FiRefreshCw,
  FiChevronRight,
  FiChevronsRight,
  FiSearch,
} from "react-icons/fi";
import "./OrdemDeServico.css";
import {
  listarOrdensServico,
  finalizarOrdemServico,
  cancelarOrdemServico,
  deletarOrdemServico,
} from "../../services/ordemServicoService";
import { FiEye, FiEdit2, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const OrdemServico = () => {
  const [ordensServico, setOrdensServico] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [ordemSelecionada, setOrdemSelecionada] = useState(null);
  const [acaoConfirmacao, setAcaoConfirmacao] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ordenacao, setOrdenacao] = useState({
    coluna: "id",
    direcao: "asc",
  });
  const navigate = useNavigate();

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
    const carregarOrdensServico = async () => {
      try {
        const response = await listarOrdensServico();
        setOrdensServico(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar ordens de serviço", "erro");
      }
    };

    carregarOrdensServico();
  }, []);

  const ordensServicoFiltradas = ordensServico.filter((ordem) => {
    const buscaFormatada = busca.toLowerCase();

    return (
      String(ordem.id).includes(buscaFormatada) ||
      String(ordem.clienteNome || "")
        .toLowerCase()
        .includes(buscaFormatada)
    );
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

  const ordensServicoORdenadas = [...ordensServicoFiltradas].sort((a, b) => {
    let valorA = a[ordenacao.coluna];
    let valorB = b[ordenacao.coluna];

    if (ordenacao.coluna === "id") {
      valorA = Number(valorA);
      valorB = Number(valorB);
    } else if (ordenacao.coluna === "dataAbertura") {
      valorA = String(valorA);
      valorB = String(valorB);
    } else if (ordenacao.coluna === "valorTotal") {
      valorA = Number(valorA);
      valorB = Number(valorB);
    } else if (ordenacao.coluna === "dataFechamento") {
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

  const itensPorPagina = 10;
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;

  const ordensPaginadas = ordensServicoORdenadas.slice(
    indiceInicial,
    indiceFinal,
  );

  const totalPaginas = Math.ceil(
    ordensServicoORdenadas.length / itensPorPagina,
  );
  const inicioExibido =
    ordensServicoORdenadas.length > 0 ? indiceInicial + 1 : 0;
  const fimExibido = Math.min(indiceFinal, ordensServicoORdenadas.length);

  const handlePaginaAnterior = () => {
    setPaginaAtual((atual) => Math.max(atual - 1, 1));
  };

  const handlePaginaProxima = () => {
    setPaginaAtual((atual) => Math.min(atual + 1, totalPaginas));
  };

  const handleIrParaInicio = () => {
    setPaginaAtual(1);
  };

  const handleIrParaFim = () => {
    setPaginaAtual(totalPaginas);
  };

  const handleNovaOrdem = () => {
    mostrarMensagem(
      "Cadastro de nova ordem ainda não está disponível.",
      "erro",
    );
  };

  const handleEditarOrdem = (ordem) => {
    if (!ordem) {
      mostrarMensagem("Selecione uma ordem antes de editar.", "erro");
      return;
    }

    navigate(`/os/editar/${ordem.id}`);
  };

  const handleDeletarOrdem = async () => {
    if (!ordemSelecionada) {
      mostrarMensagem("Selecione uma ordem antes de deletar.", "erro");
      return;
    }

    try {
      await deletarOrdemServico(ordemSelecionada.id);
      setOrdensServico((prevOrdens) =>
        prevOrdens.filter((ordem) => ordem.id !== ordemSelecionada.id),
      );
      setOrdemSelecionada(null);
      mostrarMensagem("Ordem deletada com sucesso.", "sucesso");
    } catch (error) {
      mostrarMensagem("Erro ao deletar ordem de serviço.", "erro");
    }
  };

  const handleFinalizarOrdem = async (ordem) => {
    try {
      await finalizarOrdemServico(ordem.id);

      setOrdensServico((ordensAtuais) =>
        ordensAtuais.map((ordemAtual) =>
          ordemAtual.id === ordem.id
            ? { ...ordemAtual, status: "FINALIZADA" }
            : ordemAtual,
        ),
      );

      mostrarMensagem("Ordem finalizada com sucesso.", "sucesso");
      setOrdemSelecionada(null);
      setAcaoConfirmacao("");
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao finalizar ordem.";

      mostrarMensagem(mensagemErro, "erro");
      setAcaoConfirmacao("");
    }
  };

  const handleCancelarOrdem = async (ordem) => {
    try {
      await cancelarOrdemServico(ordem.id);

      setOrdensServico((ordensAtuais) =>
        ordensAtuais.map((ordemAtual) =>
          ordemAtual.id === ordem.id
            ? { ...ordemAtual, status: "CANCELADA" }
            : ordemAtual,
        ),
      );

      mostrarMensagem("Ordem cancelada com sucesso.", "sucesso");
      setOrdemSelecionada(null);
      setAcaoConfirmacao("");
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao cancelar ordem.";

      mostrarMensagem(mensagemErro, "erro");
      setAcaoConfirmacao("");
    }
  };

  return (
    <div className="os-page" onClick={() => setOrdemSelecionada(null)}>
      <div className="os-header">
        <h1>Ordem de Serviço</h1>
        <p>Visualize e gerencie as Ordens de Serviço</p>
      </div>
      <div className="os-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Nome do Cliente..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
        />
        <div className="os-buttons">
          <button
            type="button"
            className="new-item-button"
            onClick={() => navigate("/os/cadastro")}
          >
            Nova
          </button>
          <button
            type="button"
            className="edit-item-button"
            onClick={() => handleEditarOrdem(ordemSelecionada)}
          >
            Editar
          </button>
          <button
            type="button"
            className="delete-item-button"
            onClick={handleDeletarOrdem}
          >
            Deletar
          </button>
        </div>
        <div className="pagination-controls">
          <button
            type="button"
            onClick={handleIrParaInicio}
            disabled={paginaAtual === 1}
            aria-label="Ir para primeira página"
          >
            <FiChevronsLeft />
          </button>
          <button
            type="button"
            onClick={handlePaginaAnterior}
            disabled={paginaAtual === 1}
            aria-label="Página anterior"
          >
            <FiChevronLeft />
          </button>
          <span className="total-itens">
            {inicioExibido}–{fimExibido} de {ordensServicoORdenadas.length}
          </span>
          <button
            type="button"
            onClick={handlePaginaProxima}
            disabled={paginaAtual === totalPaginas || totalPaginas === 0}
            aria-label="Próxima página"
          >
            <FiChevronRight />
          </button>
          <button
            type="button"
            onClick={handleIrParaFim}
            disabled={paginaAtual === totalPaginas || totalPaginas === 0}
            aria-label="Ir para última página"
          >
            <FiChevronsRight />
          </button>
        </div>
      </div>
      <div className="os-card" onClick={(e) => e.stopPropagation()}>
        <table className="os-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Data Abertura</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th>Data Fechamento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {ordensPaginadas.map((ordem) => (
              <tr
                key={ordem.id}
                onClick={() => setOrdemSelecionada(ordem)}
                onDoubleClick={() => handleEditarOrdem(ordem)}
                className={
                  ordemSelecionada?.id === ordem.id ? "selected-row" : ""
                }
              >
                <td>{ordem.id}</td>
                <td>{ordem.clienteNome}</td>
                <td>{ordem.dataAbertura}</td>
                <td>R$ {ordem.valorTotal?.toFixed(2).replace(".", ",")}</td>
                <td>
                  <span
                    className={`os-status ${
                      ordem.status === "ABERTA"
                        ? "os-status-open"
                        : ordem.status === "FINALIZADA"
                          ? "os-status-finished"
                          : ordem.status === "CANCELADA"
                            ? "os-status-canceled"
                            : ""
                    }`}
                  >
                    {ordem.status}
                  </span>
                </td>
                <td>
                  {ordem.dataFechamento
                    ? new Date(ordem.dataFechamento).toLocaleDateString("pt-BR")
                    : "-"}
                </td>
                <td>
                  <button
                    type="button"
                    className="action-button"
                    title="Visualizar ordem"
                    aria-label="Visualizar ordem"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOrdemSelecionada(ordem);
                    }}
                  >
                    <FiEye />
                  </button>

                  <button
                    type="button"
                    className="action-button"
                    title="Editar ordem"
                    aria-label="Editar ordem"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditarOrdem(ordem);
                    }}
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    type="button"
                    className="action-button"
                    title="Finalizar ordem"
                    aria-label="Finalizar ordem"
                    onClick={(e) => {
                      e.stopPropagation();

                      if (ordem.status !== "ABERTA") {
                        mostrarMensagem(
                          "Apenas ordens abertas podem ser finalizadas.",
                          "erro",
                        );
                        return;
                      }

                      setOrdemSelecionada(ordem);
                      setAcaoConfirmacao("finalizar");
                    }}
                  >
                    <FiCheckCircle />
                  </button>

                  <button
                    type="button"
                    className="action-button"
                    title="Cancelar ordem"
                    aria-label="Cancelar ordem"
                    onClick={(e) => {
                      e.stopPropagation();

                      if (ordem.status !== "ABERTA") {
                        mostrarMensagem(
                          "Apenas ordens abertas podem ser canceladas.",
                          "erro",
                        );
                        return;
                      }

                      setOrdemSelecionada(ordem);
                      setAcaoConfirmacao("cancelar");
                    }}
                  >
                    <FiXCircle />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ordemSelecionada && acaoConfirmacao && (
        <div className="modal-overlay" onClick={() => setAcaoConfirmacao("")}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              {acaoConfirmacao === "finalizar"
                ? "Finalizar ordem"
                : "Cancelar ordem"}
            </h2>
            <p>
              Tem certeza que deseja{" "}
              {acaoConfirmacao === "finalizar" ? "finalizar" : "cancelar"} a
              ordem <strong>{ordemSelecionada.id}</strong>?
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setAcaoConfirmacao("");
                  setOrdemSelecionada(null);
                }}
              >
                Voltar
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={() => {
                  if (acaoConfirmacao === "finalizar") {
                    handleFinalizarOrdem(ordemSelecionada);
                    return;
                  }

                  if (acaoConfirmacao === "cancelar") {
                    handleCancelarOrdem(ordemSelecionada);
                  }
                }}
              >
                Confirmar
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

export default OrdemServico;
