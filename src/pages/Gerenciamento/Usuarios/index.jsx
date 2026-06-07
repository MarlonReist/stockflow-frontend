import React, { useState, useEffect } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiPower,
  FiChevronUp,
  FiChevronDown,
  FiChevronsLeft,
  FiChevronLeft,
  FiRefreshCw,
  FiChevronRight,
  FiChevronsRight,
} from "react-icons/fi";
import "./Usuarios.css";
import {
  listarUsuarios,
  deletarUsuario,
  ativarUsuario,
  desativarUsuario,
} from "../../../services/usuarioService";
import { useNavigate } from "react-router-dom";

const GerenciamentoUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
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
    const buscarUsuarios = async () => {
      try {
        const response = await listarUsuarios();
        setUsuarios(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar usuÃ¡rios", "erro");
      }
    };
    buscarUsuarios();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletarUsuario(id);

      setUsuarios((usuariosAtuais) =>
        usuariosAtuais.filter((usuario) => usuario.id !== id),
      );

      mostrarMensagem("UsuÃ¡rio excluido com sucesso", "sucesso");
      setUsuarioSelecionado(null);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir usuÃ¡rios.";

      mostrarMensagem(mensagemErro, "erro");
      setUsuarioSelecionado(null);
    }
  };

  const handleToggleStatus = async (usuario) => {
    try {
      if (usuario.ativo) {
        await desativarUsuario(usuario.id);
      } else {
        await ativarUsuario(usuario.id);
      }

      setUsuarios((usuariosAtuais) =>
        usuariosAtuais.map((usuarioAtual) =>
          usuarioAtual.id === usuario.id
            ? { ...usuarioAtual, ativo: !usuarioAtual.ativo }
            : usuarioAtual,
        ),
      );

      const acao = usuario.ativo ? "desativado" : "ativado";
      mostrarMensagem(`UsuÃ¡rio ${acao} com sucesso`, "sucesso");
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao alterar status do usuÃ¡rio.";

      mostrarMensagem(mensagemErro, "erro");
    }
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const buscaFormatada = busca.toLowerCase();

    return (
      usuario.login.toLowerCase().includes(buscaFormatada) ||
      String(usuario.id).includes(buscaFormatada)
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

  const usuariosOrdenados = [...usuariosFiltrados].sort((a, b) => {
    let valorA = a[ordenacao.coluna];
    let valorB = b[ordenacao.coluna];

    if (ordenacao.coluna === "id") {
      valorA = Number(valorA);
      valorB = Number(valorB);
    } else if (ordenacao.coluna === "ativo") {
      valorA = valorA ? 1 : 0;
      valorB = valorB ? 1 : 0;
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

  const usuariosPaginados = usuariosOrdenados.slice(indiceInicial, indiceFinal);

  const totalPaginas = Math.ceil(usuariosOrdenados.length / itensPorPagina);
  const inicioExibido = usuariosOrdenados.length > 0 ? indiceInicial + 1 : 0;
  const fimExibido = Math.min(indiceFinal, usuariosOrdenados.length);

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
    <div className="gerenciamento-usuarios-page">
      <div className="gerenciamento-usuarios-header">
        <h1>Gerenciamento de UsuÃ¡rios</h1>
        <p>Visualize, edite ou remova usuÃ¡rios cadastrados</p>
      </div>
      <div className="gerenciamento-usuarios-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Login..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
        />
        <button type="button" onClick={() => navigate("/usuarios")}>
          + Novo UsuÃ¡rio
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
            {`${inicioExibido} - ${fimExibido} / ${usuariosOrdenados.length}`}
          </span>
        </div>
      </div>
      <div className="gerenciamento-usuarios-card">
        <table className="gerenciamento-usuarios-table">
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
              <th onClick={() => handleOrdenar("login")}>
                <span className="sortable-header">
                  Login
                  {ordenacao.coluna === "login" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th onClick={() => handleOrdenar("perfil")}>
                <span className="sortable-header">
                  Perfil
                  {ordenacao.coluna === "perfil" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th onClick={() => handleOrdenar("ativo")}>
                <span className="sortable-header">
                  Status
                  {ordenacao.coluna === "ativo" &&
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
            {usuariosPaginados.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.login}</td>
                <td>{usuario.perfil}</td>
                <td>
                  <span
                    className={`user-status ${
                      usuario.ativo
                        ? "user-status-active"
                        : "user-status-inactive"
                    }`}
                  >
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="action-button edit-button"
                    onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                    title="Editar usuÃ¡rio"
                    aria-label="Editar usuÃ¡rio"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => setUsuarioSelecionado(usuario)}
                    title="Excluir usuÃ¡rio"
                    aria-label="Excluir usuÃ¡rio"
                  >
                    <FiTrash2 />
                  </button>
                  <button
                    type="button"
                    className={`action-button power-button ${
                      usuario.ativo
                        ? "power-button-deactivate"
                        : "power-button-activate"
                    }`}
                    onClick={() => handleToggleStatus(usuario)}
                    title={usuario.ativo ? "Desativar usuÃ¡rio" : "Ativar usuÃ¡rio"}
                    aria-label={usuario.ativo ? "Desativar usuÃ¡rio" : "Ativar usuÃ¡rio"}
                  >
                    <FiPower />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {usuarioSelecionado && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Excluir usuÃ¡rio</h2>
            <p>
              Tem certeza que deseja excluir{" "}
              <strong>{usuarioSelecionado.login}</strong>?
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setUsuarioSelecionado(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => handleDelete(usuarioSelecionado.id)}
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

export default GerenciamentoUsuarios;
