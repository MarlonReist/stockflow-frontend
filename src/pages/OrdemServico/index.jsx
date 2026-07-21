import React, { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiEdit2,
  FiEye,
  FiRefreshCw,
  FiXCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  cancelarOrdemServico,
  deletarOrdemServico,
  finalizarOrdemServico,
  listarOrdensServico,
} from "../../services/ordemServicoService";
import "./OrdemDeServico.css";

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

  const carregarOrdensServico = async () => {
    try {
      const response = await listarOrdensServico();
      setOrdensServico(response.data);
    } catch (error) {
      mostrarMensagem("Erro ao carregar ordens de serviço.", "erro");
    }
  };

  useEffect(() => {
    carregarOrdensServico();
  }, []);

  const formatarData = (data) => {
    if (!data) {
      return "-";
    }

    return String(data).split("-").reverse().join("/");
  };

  const formatarValor = (valor) => {
    const valorNumerico = Number(valor || 0);
    return `R$ ${valorNumerico.toFixed(2).replace(".", ",")}`;
  };

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

  const ordensServicoOrdenadas = [...ordensServicoFiltradas].sort((a, b) => {
    let valorA = a[ordenacao.coluna];
    let valorB = b[ordenacao.coluna];

    if (ordenacao.coluna === "id" || ordenacao.coluna === "valorTotal") {
      valorA = Number(valorA || 0);
      valorB = Number(valorB || 0);
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
  const ordensPaginadas = ordensServicoOrdenadas.slice(
    indiceInicial,
    indiceFinal,
  );
  const totalPaginas = Math.ceil(
    ordensServicoOrdenadas.length / itensPorPagina,
  );
  const inicioExibido =
    ordensServicoOrdenadas.length > 0 ? indiceInicial + 1 : 0;
  const fimExibido = Math.min(indiceFinal, ordensServicoOrdenadas.length);

  const handlePaginaAnterior = () => {
    setPaginaAtual((atual) => Math.max(atual - 1, 1));
  };

  const handleRecarregar = async () => {
    setBusca("");
    setPaginaAtual(1);
    setOrdemSelecionada(null);
    await carregarOrdensServico();
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

  const handleEditarOrdem = (ordem) => {
    if (!ordem) {
      mostrarMensagem("Selecione uma ordem antes de editar.", "erro");
      return;
    }

    navigate(`/os/editar/${ordem.id}`);
  };

  const atualizarOrdemNaLista = (ordemAtualizada) => {
    setOrdensServico((ordensAtuais) =>
      ordensAtuais.map((ordemAtual) =>
        ordemAtual.id === ordemAtualizada.id ? ordemAtualizada : ordemAtual,
      ),
    );
  };

  const handleDeletarOrdem = async () => {
    if (!ordemSelecionada) {
      mostrarMensagem("Selecione uma ordem antes de deletar.", "erro");
      return;
    }

    try {
      await deletarOrdemServico(ordemSelecionada.id);
      setOrdensServico((ordensAtuais) =>
        ordensAtuais.filter((ordem) => ordem.id !== ordemSelecionada.id),
      );
      setOrdemSelecionada(null);
      mostrarMensagem("Ordem deletada com sucesso.", "sucesso");
    } catch (error) {
      mostrarMensagem("Erro ao deletar ordem de serviço.", "erro");
    }
  };

  const handleFinalizarOrdem = async (ordem) => {
    try {
      const response = await finalizarOrdemServico(ordem.id);

      if (response.data?.id) {
        atualizarOrdemNaLista(response.data);
      } else {
        await carregarOrdensServico();
      }

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
      const response = await cancelarOrdemServico(ordem.id);

      if (response.data?.id) {
        atualizarOrdemNaLista(response.data);
      } else {
        await carregarOrdensServico();
      }

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
          <button
            type="button"
            onClick={handleRecarregar}
            aria-label="Recarregar listagem"
          >
            <FiRefreshCw />
          </button>
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
          <span className="total-itens">
            {`${inicioExibido} - ${fimExibido} / ${ordensServicoOrdenadas.length}`}
          </span>
        </div>
      </div>

      <div className="os-card" onClick={(e) => e.stopPropagation()}>
        <table className="os-table">
          <thead>
            <tr>
              <th onClick={() => handleOrdenar("id")}>ID</th>
              <th onClick={() => handleOrdenar("clienteNome")}>Cliente</th>
              <th onClick={() => handleOrdenar("dataAbertura")}>
                Data Abertura
              </th>
              <th onClick={() => handleOrdenar("valorTotal")}>Valor Total</th>
              <th onClick={() => handleOrdenar("status")}>Status</th>
              <th onClick={() => handleOrdenar("dataFechamento")}>
                Data Fechamento
              </th>
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
                <td>{formatarData(ordem.dataAbertura)}</td>
                <td>{formatarValor(ordem.valorTotal)}</td>
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
                <td>{formatarData(ordem.dataFechamento)}</td>
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
