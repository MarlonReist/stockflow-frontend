import React, { useState, useEffect } from "react";
import "./Usuario.css";
import {
  cadastrarUsuario,
  buscarUsuarioPorId,
  atualizarUsuario,
} from "../../../services/usuarioService";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

const usuarioInicial = {
  login: "",
  senha: "",
  perfil: "",
};

const Usuario = () => {
  const [usuario, setUsuario] = useState({ ...usuarioInicial });
  const [mensagens, setMensagens] = useState([]);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const modoEdicao = Boolean(id);

  useEffect(() => {
    if (!modoEdicao) {
      return;
    }

    const carregarUsuario = async () => {
      try {
        const response = await buscarUsuarioPorId(id);
        setUsuario({ ...usuarioInicial, ...response.data });
      } catch (error) {
        mostrarMensagem("Erro ao carregar usuário", "erro");
      }
    };

    carregarUsuario();
  }, [id, modoEdicao]);

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
    if (!modoEdicao && !usuario.senha.trim()) {
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
      if (modoEdicao) {
        const usuarioParaAtualizar = { ...usuario };

        if (!usuarioParaAtualizar.senha || !usuarioParaAtualizar.senha.trim()) {
          delete usuarioParaAtualizar.senha;
        }

        await atualizarUsuario(id, usuarioParaAtualizar);
        mostrarMensagem("Usuário atualizado com sucesso", "sucesso");

        setTimeout(() => {
          navigate("/gerenciamento/usuarios");
        }, 1000);
      } else {
        await cadastrarUsuario(usuario);
        mostrarMensagem("Usuário cadastrado com sucesso", "sucesso");
        handleClear();
      }
    } catch (error) {
      const mensagemPadrao = modoEdicao
        ? "Erro ao atualizar usuário."
        : "Erro ao cadastrar usuário.";

      const mensagemErro = error.response?.data?.message || mensagemPadrao;
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
        <h1>{modoEdicao ? "Editar Usuário" : "Cadastro de Usuários"}</h1>
        <p>
          {modoEdicao
            ? `Atualize os dados de ${usuario.login || "usuário selecionado"}`
            : "Adicione novos usuários ao sistema"}
        </p>
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
            <button type="submit">{modoEdicao ? "Atualizar" : "Salvar"}</button>
            <button
              type="button"
              onClick={() => {
                if (modoEdicao) {
                  navigate("/gerenciamento/usuarios");
                } else {
                  handleClear();
                }
              }}
            >
              {modoEdicao ? "Voltar" : "Limpar"}
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
