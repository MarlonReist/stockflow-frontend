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
import "./Clientes.css";
import {
  listarClientes,
  deletarCliente,
} from "../../../services/clientesService";
import { useNavigate } from "react-router-dom";

const GerenciamentoClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
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
    const buscarClientes = async () => {
      try {
        const response = await listarClientes();
        setClientes(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar clientes", "erro");
      }
    };
    buscarClientes();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletarCliente(id);

      setClientes((clientesAtuais) =>
        clientesAtuais.filter((cliente) => cliente.id !== id),
      );

      mostrarMensagem("Cliente excluido com sucesso", "sucesso");
      setClienteSelecionado(null);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir cliente.";

      mostrarMensagem(mensagemErro, "erro");
      setClienteSelecionado(null);
    }
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    const buscaFormatada = busca.toLowerCase();

    return (
      cliente.nome.toLowerCase().includes(buscaFormatada) ||
      String(cliente.id).includes(buscaFormatada)
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

  const clientesOrdenados = [...clientesFiltrados].sort((a, b) => {
    let valorA =
      ordenacao.coluna === "documento"
        ? a.tipoPessoa === "JURIDICA"
          ? a.cnpj
          : a.cpf
        : a[ordenacao.coluna];

    let valorB =
      ordenacao.coluna === "documento"
        ? b.tipoPessoa === "JURIDICA"
          ? b.cnpj
          : b.cpf
        : b[ordenacao.coluna];

    if (ordenacao.coluna === "id") {
      valorA = Number(valorA);
      valorB = Number(valorB);
    } else if (
      ordenacao.coluna === "documento" ||
      ordenacao.coluna === "telefone"
    ) {
      valorA = String(valorA ?? "").replace(/\D/g, "");
      valorB = String(valorB ?? "").replace(/\D/g, "");
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

  const clientesPaginados = clientesOrdenados.slice(indiceInicial, indiceFinal);

  const totalPaginas = Math.ceil(clientesOrdenados.length / itensPorPagina);
  const inicioExibido = clientesOrdenados.length > 0 ? indiceInicial + 1 : 0;
  const fimExibido = Math.min(indiceFinal, clientesOrdenados.length);

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
    <div className="gerenciamento-clientes-page gerenciamento-base-page">
      <div className="gerenciamento-clientes-header gerenciamento-base-header">
        <h1>Gerenciamento de Clientes</h1>
        <p>Visualize, edite ou remova clientes cadastrados</p>
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
      <div className="gerenciamento-clientes-actions gerenciamento-base-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Nome..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
        />
        <button type="button" onClick={() => navigate("/clientes")}>
          + Novo Cliente
        </button>
        <div className="pagination-controls">
          <button
            className="first"
            title="Primeira página"
            aria-label="Primeira página"
            onClick={handlePrimeiraPagina}
            disabled={paginaAtual === 1}
          >
            <FiChevronsLeft />
          </button>
          <button
            className="previous"
            title="Página anterior"
            aria-label="Página anterior"
            onClick={handlePaginaAnterior}
            disabled={paginaAtual === 1}
          >
            <FiChevronLeft />
          </button>
          <button
            className="refresh"
            onClick={handleRecarregar}
            title="Recarregar"
            aria-label="Recarregar"
          >
            <FiRefreshCw />
          </button>
          <button
            className="next"
            title="Próxima página"
            aria-label="Próxima página"
            onClick={handleProximaPagina}
            disabled={totalPaginas === 0 || paginaAtual === totalPaginas}
          >
            <FiChevronRight />
          </button>
          <button
            className="last"
            title="Última página"
            aria-label="Última página"
            onClick={handleUltimaPagina}
            disabled={totalPaginas === 0 || paginaAtual === totalPaginas}
          >
            <FiChevronsRight />
          </button>
          <span className="total-itens">
            {`${inicioExibido} - ${fimExibido} / ${clientesOrdenados.length}`}
          </span>
        </div>
      </div>
      <div
        className="gerenciamento-clientes-card gerenciamento-base-table-wrapper"
        role="region"
        aria-label="Lista de clientes"
        tabIndex={0}
      >
        <table className="gerenciamento-clientes-table gerenciamento-base-table">
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
                  Nome/Razão Social
                  {ordenacao.coluna === "nome" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th onClick={() => handleOrdenar("documento")}>
                <span className="sortable-header">
                  CPF/CNPJ
                  {ordenacao.coluna === "documento" &&
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
              <th onClick={() => handleOrdenar("email")}>
                <span className="sortable-header">
                  Email
                  {ordenacao.coluna === "email" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th onClick={() => handleOrdenar("endereco")}>
                <span className="sortable-header">
                  Endereço
                  {ordenacao.coluna === "endereco" &&
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
            {clientesPaginados.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>
                  <div className="cliente-identificacao">
                    <span>{cliente.nome}</span>
                    <span
                      className="cliente-tipo"
                      title={
                        cliente.tipoPessoa === "JURIDICA"
                          ? "Pessoa Jurídica"
                          : "Pessoa Física"
                      }
                    >
                      {cliente.tipoPessoa === "JURIDICA" ? "PJ" : "PF"}
                    </span>
                  </div>
                </td>
                <td>
                  {cliente.tipoPessoa === "JURIDICA"
                    ? cliente.cnpj
                    : cliente.cpf}
                </td>
                <td>{cliente.telefone}</td>
                <td>{cliente.email}</td>
                <td>
                  <div className="endereco-cell">{cliente.endereco}</div>
                </td>
                <td>
                  <button
                    type="button"
                    className="action-button edit-button"
                    onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                    title="Editar cliente"
                    aria-label="Editar cliente"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => setClienteSelecionado(cliente)}
                    title="Excluir cliente"
                    aria-label="Excluir cliente"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {clienteSelecionado && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Excluir cliente</h2>
            <p>
              Tem certeza que deseja excluir{" "}
              <strong>{clienteSelecionado.nome}</strong>?
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setClienteSelecionado(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => handleDelete(clienteSelecionado.id)}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciamentoClientes;
