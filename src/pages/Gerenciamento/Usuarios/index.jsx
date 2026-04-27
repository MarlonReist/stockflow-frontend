import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiPower } from "react-icons/fi";
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
        console.log(response.data);
        setUsuarios(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar usuários", "erro");
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

      mostrarMensagem("Usuário excluido com sucesso", "sucesso");
      setUsuarioSelecionado(null);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir usuários.";

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
      mostrarMensagem(`Usuário ${acao} com sucesso`, "sucesso");
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao alterar status do usuário.";

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

  return (
    <div className="gerenciamento-usuarios-page">
      <div className="gerenciamento-usuarios-header">
        <h1>Gerenciamento de Usuários</h1>
        <p>Visualize, edite ou remova usuários cadastrados</p>
      </div>
      <div className="gerenciamento-usuarios-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Login..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <button type="button" onClick={() => navigate("/usuarios")}>
          + Novo Usuário
        </button>
      </div>
      <div className="gerenciamento-usuarios-card">
        <table className="gerenciamento-usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Login</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((usuario) => (
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
                    title="Editar usuário"
                    aria-label="Editar usuário"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => setUsuarioSelecionado(usuario)}
                    title="Excluir usuário"
                    aria-label="Excluir usuário"
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
                    title={usuario.ativo ? "Desativar usuário" : "Ativar usuário"}
                    aria-label={usuario.ativo ? "Desativar usuário" : "Ativar usuário"}
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
            <h2>Excluir usuário</h2>
            <p>
              Tem certeza que deseja excluir 
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
