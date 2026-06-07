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
import "./Fornecedor.css";
import {
  listarFornecedores,
  deletarFornecedor,
} from "../../../services/fornecedorService";
import { useNavigate } from "react-router-dom";

const GerenciamentoFornecedores = () => {
  const [fornecedores, setFornecedores] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
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
    const buscarFornecedores = async () => {
      try {
        const response = await listarFornecedores();
        setFornecedores(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar fornecedores", "erro");
      }
    };
    buscarFornecedores();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletarFornecedor(id);

      setFornecedores((fornecedoresAtuais) =>
        fornecedoresAtuais.filter((fornecedor) => fornecedor.id !== id),
      );

      mostrarMensagem("Fornecedor excluido com sucesso", "sucesso");
      setFornecedorSelecionado(null);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir fornecedor.";

      mostrarMensagem(mensagemErro, "erro");
      setFornecedorSelecionado(null);
    }
  };

  const fornecedoresFiltrados = fornecedores.filter((fornecedor) => {
    const buscaFormatada = busca.toLowerCase();

    return (
      fornecedor.nome.toLowerCase().includes(buscaFormatada) ||
      String(fornecedor.id).includes(buscaFormatada)
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

  const fornecedoresOrdenados = [...fornecedoresFiltrados].sort((a, b) => {
    let valorA = a[ordenacao.coluna];
    let valorB = b[ordenacao.coluna];

    if (ordenacao.coluna === "id") {
      valorA = Number(valorA);
      valorB = Number(valorB);
    } else if (ordenacao.coluna === "cnpj") {
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

  const fornecedoresPaginados = fornecedoresOrdenados.slice(
    indiceInicial,
    indiceFinal,
  );

  const totalPaginas = Math.ceil(fornecedoresOrdenados.length / itensPorPagina);
  const inicioExibido = fornecedoresOrdenados.length > 0 ? indiceInicial + 1 : 0;
  const fimExibido = Math.min(indiceFinal, fornecedoresOrdenados.length);

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
    <div className="gerenciamento-fornecedores-page">
      <div className="gerenciamento-fornecedores-header">
        <h1>Gerenciamento de Fornecedores</h1>
        <p>Visualize, edite ou remova fornecedores cadastrados</p>
      </div>
      <div className="gerenciamento-fornecedores-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Nome..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
        />
        <button type="button" onClick={() => navigate("/fornecedores")}>
          + Novo Fornecedor
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
            {`${inicioExibido} - ${fimExibido} / ${fornecedoresOrdenados.length}`}
          </span>
        </div>
      </div>
      <div className="gerenciamento-fornecedores-card">
        <table className="gerenciamento-fornecedores-table">
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
              <th onClick={() => handleOrdenar("cnpj")}>
                <span className="sortable-header">
                  CNPJ
                  {ordenacao.coluna === "cnpj" &&
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
            {fornecedoresPaginados.map((fornecedor) => (
              <tr key={fornecedor.id}>
                <td>{fornecedor.id}</td>
                <td>{fornecedor.nome}</td>
                <td>{fornecedor.cnpj}</td>
                <td>
                  <button
                    type="button"
                    className="action-button edit-button"
                    onClick={() =>
                      navigate(`/fornecedores/editar/${fornecedor.id}`)
                    }
                    title="Editar fornecedor"
                    aria-label="Editar fornecedor"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => setFornecedorSelecionado(fornecedor)}
                    title="Excluir fornecedor"
                    aria-label="Excluir fornecedor"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {fornecedorSelecionado && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Excluir fornecedor</h2>
            <p>
              Tem certeza que deseja excluir{" "}
              <strong>{fornecedorSelecionado.nome}</strong>?
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setFornecedorSelecionado(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => handleDelete(fornecedorSelecionado.id)}
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

export default GerenciamentoFornecedores;
