import React, { useEffect, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronsLeft,
  FiChevronsRight,
  FiEdit2,
  FiPower,
  FiRefreshCw,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  ativarTipoOrdemServico,
  desativarTipoOrdemServico,
  listarTiposOrdemServico,
} from "../../../services/tipoOrdemServicoService";
import "./TiposOrdemServico.css";

const TiposOrdemServico = () => {
  const [tipos, setTipos] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ordenacao, setOrdenacao] = useState({
    coluna: "id",
    direcao: "asc",
  });

  const navigate = useNavigate();
  const itensPorPagina = 10;

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

  const carregarTipos = async () => {
    try {
      const response = await listarTiposOrdemServico();
      setTipos(response.data);
    } catch (error) {
      mostrarMensagem(
        error.response?.data?.message ||
          "Erro ao carregar tipos de ordem de serviço.",
        "erro",
      );
    }
  };

  useEffect(() => {
    carregarTipos();
  }, []);

  const handleAlterarSituacao = async (tipo) => {
    try {
      const response = tipo.ativo
        ? await desativarTipoOrdemServico(tipo.id)
        : await ativarTipoOrdemServico(tipo.id);

      setTipos((tiposAtuais) =>
        tiposAtuais.map((tipoAtual) =>
          tipoAtual.id === tipo.id ? response.data : tipoAtual,
        ),
      );

      mostrarMensagem(
        tipo.ativo
          ? "Tipo desativado com sucesso."
          : "Tipo ativado com sucesso.",
        "sucesso",
      );
    } catch (error) {
      mostrarMensagem(
        error.response?.data?.message || "Erro ao alterar situação do tipo.",
        "erro",
      );
    }
  };

  const tiposFiltrados = tipos.filter((tipo) => {
    const buscaFormatada = busca.toLowerCase();
    const situacao = tipo.ativo ? "ativo" : "inativo";
    const correspondeSituacao =
      buscaFormatada === "ativo"
        ? tipo.ativo
        : buscaFormatada === "inativo"
          ? !tipo.ativo
          : situacao.includes(buscaFormatada);

    return (
      String(tipo.id).includes(buscaFormatada) ||
      String(tipo.nome || "")
        .toLowerCase()
        .includes(buscaFormatada) ||
      correspondeSituacao
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

      return { coluna, direcao: "asc" };
    });
  };

  const tiposOrdenados = [...tiposFiltrados].sort((a, b) => {
    let valorA = a[ordenacao.coluna];
    let valorB = b[ordenacao.coluna];

    if (ordenacao.coluna === "id") {
      valorA = Number(valorA);
      valorB = Number(valorB);
    } else if (ordenacao.coluna === "ativo") {
      valorA = Number(Boolean(valorA));
      valorB = Number(Boolean(valorB));
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
  const tiposPaginados = tiposOrdenados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(tiposOrdenados.length / itensPorPagina);
  const inicioExibido = tiposOrdenados.length > 0 ? indiceInicial + 1 : 0;
  const fimExibido = Math.min(indiceFinal, tiposOrdenados.length);

  const renderIconeOrdenacao = (coluna) => {
    if (ordenacao.coluna !== coluna) {
      return null;
    }

    return ordenacao.direcao === "asc" ? <FiChevronUp /> : <FiChevronDown />;
  };

  const handleRecarregar = async () => {
    setBusca("");
    setPaginaAtual(1);
    await carregarTipos();
  };

  return (
    <div className="gerenciamento-tipos-os-page gerenciamento-base-page">
      <div className="gerenciamento-tipos-os-header gerenciamento-base-header">
        <h1>Tipos de Ordem de Serviço</h1>
        <p>Cadastre, edite, ative ou desative os tipos disponíveis</p>
      </div>

      <div className="toast-container" role="status" aria-live="polite">
        {mensagens.map((mensagem) => (
          <div
            key={mensagem.id}
            className={`form-message form-message-${mensagem.tipo}`}
          >
            {mensagem.texto}
          </div>
        ))}
      </div>

      <div className="gerenciamento-tipos-os-actions gerenciamento-base-actions">
        <input
          type="text"
          placeholder="Buscar por ID, Nome ou Situação..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
        />

        <button type="button" onClick={() => navigate("/tipos-os")}>
          + Novo Tipo
        </button>

        <div className="pagination-controls">
          <button
            type="button"
            title="Primeira página"
            aria-label="Primeira página"
            onClick={() => setPaginaAtual(1)}
            disabled={paginaAtual === 1}
          >
            <FiChevronsLeft />
          </button>

          <button
            type="button"
            title="Página anterior"
            aria-label="Página anterior"
            onClick={() =>
              setPaginaAtual((paginaAtual) => Math.max(paginaAtual - 1, 1))
            }
            disabled={paginaAtual === 1}
          >
            <FiChevronLeft />
          </button>

          <button
            type="button"
            title="Recarregar"
            aria-label="Recarregar"
            onClick={handleRecarregar}
          >
            <FiRefreshCw />
          </button>

          <button
            type="button"
            title="Próxima página"
            aria-label="Próxima página"
            onClick={() =>
              setPaginaAtual((paginaAtual) =>
                Math.min(paginaAtual + 1, totalPaginas),
              )
            }
            disabled={totalPaginas === 0 || paginaAtual === totalPaginas}
          >
            <FiChevronRight />
          </button>

          <button
            type="button"
            title="Última página"
            aria-label="Última página"
            onClick={() => setPaginaAtual(totalPaginas)}
            disabled={totalPaginas === 0 || paginaAtual === totalPaginas}
          >
            <FiChevronsRight />
          </button>

          <span className="total-itens">
            {`${inicioExibido} - ${fimExibido} / ${tiposOrdenados.length}`}
          </span>
        </div>
      </div>

      <div
        className="gerenciamento-tipos-os-card gerenciamento-base-table-wrapper"
        role="region"
        aria-label="Lista de tipos de ordem de serviço"
        tabIndex={0}
      >
        <table className="gerenciamento-tipos-os-table gerenciamento-base-table">
          <thead>
            <tr>
              <th onClick={() => handleOrdenar("id")}>
                <span className="sortable-header">
                  ID
                  {renderIconeOrdenacao("id")}
                </span>
              </th>

              <th onClick={() => handleOrdenar("nome")}>
                <span className="sortable-header">
                  Nome
                  {renderIconeOrdenacao("nome")}
                </span>
              </th>

              <th onClick={() => handleOrdenar("ativo")}>
                <span className="sortable-header">
                  Situação
                  {renderIconeOrdenacao("ativo")}
                </span>
              </th>

              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {tiposPaginados.map((tipo) => (
              <tr key={tipo.id}>
                <td>{tipo.id}</td>
                <td>{tipo.nome}</td>
                <td>
                  <span
                    className={`tipo-status ${
                      tipo.ativo ? "tipo-status-active" : "tipo-status-inactive"
                    }`}
                  >
                    {tipo.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>

                <td>
                  <button
                    type="button"
                    className="action-button edit-button"
                    title="Editar tipo"
                    aria-label="Editar tipo"
                    onClick={() => navigate(`/tipos-os/editar/${tipo.id}`)}
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    type="button"
                    className={`action-button ${
                      tipo.ativo ? "deactivate-button" : "activate-button"
                    }`}
                    title={tipo.ativo ? "Desativar tipo" : "Ativar tipo"}
                    aria-label={tipo.ativo ? "Desativar tipo" : "Ativar tipo"}
                    onClick={() => handleAlterarSituacao(tipo)}
                  >
                    <FiPower />
                  </button>
                </td>
              </tr>
            ))}

            {tiposPaginados.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-state-cell">
                  Nenhum tipo encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TiposOrdemServico;
