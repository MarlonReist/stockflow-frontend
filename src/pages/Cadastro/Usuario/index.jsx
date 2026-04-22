import React, { useState } from "react";
import "./Usuario.css";
import { cadastrarUsuario } from "../../../services/usuarioService";
import { FiEye, FiEyeOff } from "react-icons/fi";

const usuarioInicial = {
  login: "",
  senha: "",
  perfil: "",
};

const Usuario = () => {
  const [usuario, setUsuario] = useState({ ...usuarioInicial });
  const [mensagens, setMensagens] = useState([]);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario({ ...usuario, [name]: value });
  };

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

  const validarUsuario = () => {
    const erros = [];

    if (!usuario.login.trim()) {
      erros.push("Login é obrigatório");
    }
    if (!usuario.senha.trim()) {
      erros.push("Senha é obrigatório");
    }
    if (!usuario.perfil.trim()) {
      erros.push("Perfil é obrigatório");
    }
    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarUsuario();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });
      return;
    }

    try {
      await cadastrarUsuario(usuario);
      mostrarMensagem("Usuário cadastrado com sucesso", "sucesso");
      handleClear();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao cadastrar usuário.";

      mostrarMensagem(mensagemErro, "erro");

      return;
    }
  };

  const handleClear = () => {
    setUsuario({ ...usuarioInicial });
  };

  return (
    <div className="usuario-page">
      <div className="usuario-header">
        <h1>Cadastro de Usuários</h1>
        <p>Adicione novos usuários ao sistema</p>
      </div>
      <div className="usuario-card">
        <form className="usuario-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Login</label>
            <input
              type="text"
              name="login"
              placeholder="Digite o login do usuário"
              value={usuario.login}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <div className="password-field">
              <input
                type={mostrarSenha ? "text" : "password"}
                name="senha"
                placeholder="Digite a senha"
                value={usuario.senha}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Perfil</label>
            <select
              name="perfil"
              value={usuario.perfil}
              onChange={handleChange}
            >
              <option value="">Selecione um perfil</option>
              <option value="ADMIN">Admin</option>
              <option value="USUARIO">Usuário</option>
            </select>
          </div>
          <div className="status-field">
            <span>Ativo</span>
            <label className="switch">
              <input type="checkbox" checked={true} disabled readOnly />
              <span className="slider"></span>
            </label>
          </div>
          <div className="form-actions">
            <button type="submit">Salvar</button>
            <button type="button" onClick={handleClear}>
              Limpar
            </button>
          </div>
        </form>
      </div>
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

export default Usuario;
