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
import "./Almoxarifados.css";
import {
  listarAlmoxarifados,
  deletarAlmoxarifado,
} from "../../../services/almoxarifadoService";
import { useNavigate } from "react-router-dom";

const GerenciamentoAlmoxarifados = () => {
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [almoxarifadoSelecionado, setAlmoxarifadoSelecionado] = useState(null);
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
    const buscarAlmoxarifados = async () => {
      try {
        const response = await listarAlmoxarifados();
        setAlmoxarifados(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar almoxarifados", "erro");
      }
    };
    buscarAlmoxarifados();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletarAlmoxarifado(id);

      setAlmoxarifados((almoxarifadosAtuais) =>
        almoxarifadosAtuais.filter((almoxarifado) => almoxarifado.id !== id),
      );

      mostrarMensagem("Almoxarifado excluido com sucesso", "sucesso");
      setAlmoxarifadoSelecionado(null);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir almoxarifado.";

      mostrarMensagem(mensagemErro, "erro");
      setAlmoxarifadoSelecionado(null);
    }
  };

  const almoxarifadosFiltrados = almoxarifados.filter((almoxarifado) => {
    const buscaFormatada = busca.toLowerCase();

    return (
      almoxarifado.nome.toLowerCase().includes(buscaFormatada) ||
      String(almoxarifado.id).includes(buscaFormatada)
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

  const almoxarifadosOrdenados = [...almoxarifadosFiltrados].sort((a, b) => {
    let valorA = a[ordenacao.coluna];
    let valorB = b[ordenacao.coluna];

    if (ordenacao.coluna === "id") {
      valorA = Number(valorA);
      valorB = Number(valorB);
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

  const almoxarifadosPaginados = almoxarifadosOrdenados.slice(
    indiceInicial,
    indiceFinal,
  );

  const totalPaginas = Math.ceil(
    almoxarifadosOrdenados.length / itensPorPagina,
  );
  const inicioExibido =
    almoxarifadosOrdenados.length > 0 ? indiceInicial + 1 : 0;
  const fimExibido = Math.min(indiceFinal, almoxarifadosOrdenados.length);

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
    <div className="gerenciamento-almoxarifados-page">
      <div className="gerenciamento-almoxarifados-header">
        <h1>Gerenciamento de Almoxarifados</h1>
        <p>Visualize, edite ou remova almoxarifados cadastrados</p>
      </div>
      <div className="gerenciamento-almoxarifados-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Nome..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
        />
        <button type="button" onClick={() => navigate("/almoxarifados")}>
          + Novo Almoxarifado
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
            {`${inicioExibido} - ${fimExibido} / ${almoxarifadosOrdenados.length}`}
          </span>
        </div>
      </div>
      <div className="gerenciamento-almoxarifados-card">
        <table className="gerenciamento-almoxarifados-table">
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
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {almoxarifadosPaginados.map((almoxarifado) => (
              <tr key={almoxarifado.id}>
                <td>{almoxarifado.id}</td>
                <td>{almoxarifado.nome}</td>
                <td>
                  <button
                    type="button"
                    className="action-button edit-button"
                    onClick={() =>
                      navigate(`/almoxarifados/editar/${almoxarifado.id}`)
                    }
                    title="Editar almoxarifado"
                    aria-label="Editar almoxarifado"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => setAlmoxarifadoSelecionado(almoxarifado)}
                    title="Excluir almoxarifado"
                    aria-label="Excluir almoxarifado"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {almoxarifadoSelecionado && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Excluir almoxarifado</h2>
            <p>
              Tem certeza que deseja excluir{" "}
              <strong>{almoxarifadoSelecionado.nome}</strong>?
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setAlmoxarifadoSelecionado(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => handleDelete(almoxarifadoSelecionado.id)}
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

export default GerenciamentoAlmoxarifados;
