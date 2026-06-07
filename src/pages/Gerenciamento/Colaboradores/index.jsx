import React, { useState, useEffect } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
  FiChevronsLeft,
  FiChevronLeft,
  FiRefreshCw,
  FiChevronRight,
  FiChevronsRight,
} from "react-icons/fi";
import "./Colaboradores.css";
import {
  listarColaboradores,
  deletarColaborador,
} from "../../../services/colaboradorService";
import { useNavigate } from "react-router-dom";

const GerenciamentoColaboradores = () => {
  const [colaboradores, setColaboradores] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ordenacao, setOrdenacao] = useState({
    coluna: "id",
    direcao: "asc",
  });

  const itensPorPagina = 10;
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
    const buscarColaboradores = async () => {
      try {
        const response = await listarColaboradores();
        setColaboradores(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar colaboradores", "erro");
      }
    };
    buscarColaboradores();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletarColaborador(id);

      setColaboradores((colaboradoresAtuais) =>
        colaboradoresAtuais.filter((colaborador) => colaborador.id !== id),
      );

      mostrarMensagem("Colaborador excluido com sucesso", "sucesso");
      setColaboradorSelecionado(null);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir colaborador.";

      mostrarMensagem(mensagemErro, "erro");
      setColaboradorSelecionado(null);
    }
  };

  const colaboradoresFiltrados = colaboradores.filter((colaborador) => {
    const buscaFormatada = busca.toLowerCase();

    return (
      colaborador.nome.toLowerCase().includes(buscaFormatada) ||
      String(colaborador.id).includes(buscaFormatada)
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

  const colaboradoresOrdenados = [...colaboradoresFiltrados].sort((a, b) => {
    let valorA = a[ordenacao.coluna];
    let valorB = b[ordenacao.coluna];

    if (ordenacao.coluna === "id") {
      valorA = Number(valorA);
      valorB = Number(valorB);
    } else if (ordenacao.coluna === "cpf" || ordenacao.coluna === "telefone") {
      valorA = String(valorA).replace(/\D/g, "");
      valorB = String(valorB).replace(/\D/g, "");
    } else {
      valorA = String(valorA).toLowerCase();
      valorB = String(valorB).toLowerCase();
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

  const colaboradoresPaginados = colaboradoresOrdenados.slice(
    indiceInicial,
    indiceFinal,
  );

  const totalPaginas = Math.ceil(
    colaboradoresOrdenados.length / itensPorPagina,
  );
  const inicioExibido =
    colaboradoresOrdenados.length > 0 ? indiceInicial + 1 : 0;
  const fimExibido = Math.min(indiceFinal, colaboradoresOrdenados.length);

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
    <div className="gerenciamento-colaboradores-page">
      <div className="gerenciamento-colaboradores-header">
        <h1>Gerenciamento de Colaboradores</h1>
        <p>Visualize, edite ou remova colaboradores cadastrados</p>
      </div>
      <div className="gerenciamento-colaboradores-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Nome..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
        />
        <button type="button" onClick={() => navigate("/colaboradores")}>
          + Novo Colaborador
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
            {`${inicioExibido} - ${fimExibido} / ${colaboradoresOrdenados.length}`}
          </span>
        </div>
      </div>
      <div className="gerenciamento-colaboradores-card">
        <table className="gerenciamento-colaboradores-table">
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
              <th onClick={() => handleOrdenar("nome")}>
                <span className="sortable-header">
                  Nome
                  {ordenacao.coluna === "nome" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th onClick={() => handleOrdenar("cpf")}>
                <span className="sortable-header">
                  CPF
                  {ordenacao.coluna === "cpf" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th onClick={() => handleOrdenar("cargo")}>
                <span className="sortable-header">
                  Cargo
                  {ordenacao.coluna === "cargo" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th onClick={() => handleOrdenar("telefone")}>
                <span className="sortable-header">
                  Telefone
                  {ordenacao.coluna === "telefone" &&
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
            {colaboradoresPaginados.map((colaborador) => (
              <tr key={colaborador.id}>
                <td>{colaborador.id}</td>
                <td>{colaborador.nome}</td>
                <td>{colaborador.cpf}</td>
                <td>{colaborador.cargo}</td>
                <td>{colaborador.telefone}</td>
                <td>
                  <button
                    type="button"
                    className="action-button edit-button"
                    onClick={() =>
                      navigate(`/colaboradores/editar/${colaborador.id}`)
                    }
                    title="Editar colaborador"
                    aria-label="Editar colaborador"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => setColaboradorSelecionado(colaborador)}
                    title="Excluir colaborador"
                    aria-label="Excluir colaborador"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {colaboradorSelecionado && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Excluir colaborador</h2>
            <p>
              Tem certeza que deseja excluir{" "}
              <strong>{colaboradorSelecionado.nome}</strong>?
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setColaboradorSelecionado(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => handleDelete(colaboradorSelecionado.id)}
              >
                Excluir
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

export default GerenciamentoColaboradores;
