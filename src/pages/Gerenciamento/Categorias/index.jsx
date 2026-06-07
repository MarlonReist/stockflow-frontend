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
import "./Categorias.css";
import {
  listarCategorias,
  deletarCategoria,
} from "../../../services/categoriaService";
import { useNavigate } from "react-router-dom";

const GerenciamentoCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
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
    const buscarCategorias = async () => {
      try {
        const response = await listarCategorias();
        setCategorias(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar categorias", "erro");
      }
    };
    buscarCategorias();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletarCategoria(id);

      setCategorias((categoriasAtuais) =>
        categoriasAtuais.filter((categoria) => categoria.id !== id),
      );

      mostrarMensagem("Categoria excluida com sucesso", "sucesso");
      setCategoriaSelecionada(null);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir categoria.";

      mostrarMensagem(mensagemErro, "erro");
      setCategoriaSelecionada(null);
    }
  };

  const categoriasFiltradas = categorias.filter((categoria) => {
    const buscaFormatada = busca.toLowerCase();

    return (
      categoria.nome.toLowerCase().includes(buscaFormatada) ||
      String(categoria.id).includes(buscaFormatada)
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

  const categoriasOrdenadas = [...categoriasFiltradas].sort((a, b) => {
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

  const categoriasPaginadas = categoriasOrdenadas.slice(
    indiceInicial,
    indiceFinal,
  );

  const totalPaginas = Math.ceil(categoriasOrdenadas.length / itensPorPagina);
  const inicioExibido = categoriasOrdenadas.length > 0 ? indiceInicial + 1 : 0;
  const fimExibido = Math.min(indiceFinal, categoriasOrdenadas.length);

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
    <div className="gerenciamento-categorias-page">
      <div className="gerenciamento-categorias-header">
        <h1>Gerenciamento de Categorias</h1>
        <p>Visualize, edite ou remova categorias cadastradas</p>
      </div>
      <div className="gerenciamento-categorias-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Nome..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
        />
        <button type="button" onClick={() => navigate("/categorias")}>
          + Nova Categoria
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
            {`${inicioExibido} - ${fimExibido} / ${categoriasOrdenadas.length}`}
          </span>
        </div>
      </div>
      <div className="gerenciamento-categorias-card">
        <table className="gerenciamento-categorias-table">
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
            {categoriasPaginadas.map((categoria) => (
              <tr key={categoria.id}>
                <td>{categoria.id}</td>
                <td>{categoria.nome}</td>
                <td>
                  <button
                    type="button"
                    className="action-button edit-button"
                    onClick={() => navigate(`/categorias/editar/${categoria.id}`)}
                    title="Editar categoria"
                    aria-label="Editar categoria"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => setCategoriaSelecionada(categoria)}
                    title="Excluir categoria"
                    aria-label="Excluir categoria"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {categoriaSelecionada && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Excluir categoria</h2>
            <p>
              Tem certeza que deseja excluir{" "}
              <strong>{categoriaSelecionada.nome}</strong>?
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setCategoriaSelecionada(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => handleDelete(categoriaSelecionada.id)}
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

export default GerenciamentoCategorias;
