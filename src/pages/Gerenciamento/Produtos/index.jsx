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
import "./Produtos.css";
import {
  listarProdutos,
  deletarProduto,
} from "../../../services/produtoService";
import { useNavigate } from "react-router-dom";

const GerenciamentoProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
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
    const buscarProdutos = async () => {
      try {
        const response = await listarProdutos();
        setProdutos(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar produtos", "erro");
      }
    };
    buscarProdutos();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletarProduto(id);

      setProdutos((produtosAtuais) =>
        produtosAtuais.filter((produto) => produto.id !== id),
      );

      mostrarMensagem("Produto excluido com sucesso", "sucesso");
      setProdutoSelecionado(null);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir produto.";

      mostrarMensagem(mensagemErro, "erro");
      setProdutoSelecionado(null);
    }
  };

  const produtosFiltrados = produtos.filter((produto) => {
    const buscaFormatada = busca.toLowerCase();

    return (
      produto.nome.toLowerCase().includes(buscaFormatada) ||
      String(produto.id).includes(buscaFormatada)
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

  const produtosOrdenados = [...produtosFiltrados].sort((a, b) => {
    let valorA = a[ordenacao.coluna];
    let valorB = b[ordenacao.coluna];

    if (ordenacao.coluna === "id" || ordenacao.coluna === "preco") {
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

  const produtosPaginados = produtosOrdenados.slice(indiceInicial, indiceFinal);

  const totalPaginas = Math.ceil(produtosOrdenados.length / itensPorPagina);
  const inicioExibido = produtosOrdenados.length > 0 ? indiceInicial + 1 : 0;
  const fimExibido = Math.min(indiceFinal, produtosOrdenados.length);

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
    <div className="gerenciamento-produtos-page">
      <div className="gerenciamento-produtos-header">
        <h1>Gerenciamento de Produtos</h1>
        <p>Visualize, edite ou remova produtos cadastrados</p>
      </div>
      <div className="gerenciamento-produtos-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Nome..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
        />
        <button type="button" onClick={() => navigate("/produtos")}>
          + Novo Produto
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
            {`${inicioExibido} - ${fimExibido} / ${produtosOrdenados.length}`}
          </span>
        </div>
      </div>
      <div className="gerenciamento-produtos-card">
        <table className="gerenciamento-produtos-table">
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
              <th onClick={() => handleOrdenar("preco")}>
                <span className="sortable-header">
                  Preço
                  {ordenacao.coluna === "preco" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th onClick={() => handleOrdenar("categoriaNome")}>
                <span className="sortable-header">
                  Categoria
                  {ordenacao.coluna === "categoriaNome" &&
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
            {produtosPaginados.map((produto) => (
              <tr key={produto.id}>
                <td>{produto.id}</td>
                <td>{produto.nome}</td>
                <td>
                  {Number(produto.preco).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td>{produto.categoriaNome}</td>
                <td>
                  <button
                    type="button"
                    className="action-button edit-button"
                    onClick={() => navigate(`/produtos/editar/${produto.id}`)}
                    title="Editar produto"
                    aria-label="Editar produto"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => setProdutoSelecionado(produto)}
                    title="Excluir produto"
                    aria-label="Excluir produto"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {produtoSelecionado && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Excluir produto</h2>
            <p>
              Tem certeza que deseja excluir{" "}
              <strong>{produtoSelecionado.nome}</strong>?
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setProdutoSelecionado(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => handleDelete(produtoSelecionado.id)}
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

export default GerenciamentoProdutos;
