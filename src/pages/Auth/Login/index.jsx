import React, { useRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { esqueciSenha, login } from "../../../services/authService";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    login: "",
    senha: "",
  });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [camposInvalidos, setCamposInvalidos] = useState({});
  const [camposRecuperacaoInvalidos, setCamposRecuperacaoInvalidos] = useState(
    {},
  );
  const loginInputRef = useRef(null);
  const senhaInputRef = useRef(null);
  const loginRecuperacaoInputRef = useRef(null);

  const [modalRecuperacaoAberto, setModalRecuperacaoAberto] = useState(false);
  const [loginRecuperacao, setLoginRecuperacao] = useState("");
  const [mensagemRecuperacao, setMensagemRecuperacao] = useState("");
  const [erroRecuperacao, setErroRecuperacao] = useState("");
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((formAtual) => ({
      ...formAtual,
      [name]: value,
    }));

    if (camposInvalidos[name]) {
      setCamposInvalidos((camposAtuais) => ({
        ...camposAtuais,
        [name]: false,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErro("");
    const camposComErro = {};

    if (!form.login) {
      camposComErro.login = true;
    }

    if (!form.senha) {
      camposComErro.senha = true;
    }

    setCamposInvalidos(camposComErro);

    if (Object.keys(camposComErro).length > 0) {
      setErro("Informe o login e a senha.");

      if (camposComErro.login) {
        loginInputRef.current?.focus();
      } else {
        senhaInputRef.current?.focus();
      }

      return;
    }

    if (!form.login || !form.senha) {
      setErro("Informe o login e a senha.");
      return;
    }

    try {
      setCarregando(true);

      const response = await login({
        login: form.login,
        senha: form.senha,
      });

      localStorage.setItem("stockflow_token", response.data.token);
      localStorage.setItem("stockflow_usuario", JSON.stringify(response.data));

      navigate("/dashboard");
    } catch (error) {
      const mensagemErro = error.response?.data?.message;

      if (mensagemErro === "Usuário não está ativo!") {
        setErro("Seu acesso não está ativo. Contate um administrador.");
      } else {
        setErro(mensagemErro || "Login ou senha inválidos.");
      }
    } finally {
      setCarregando(false);
    }
  };

  const abrirModalRecuperacao = () => {
    setLoginRecuperacao(form.login);
    setMensagemRecuperacao("");
    setErroRecuperacao("");
    setModalRecuperacaoAberto(true);
  };

  const fecharModalRecuperacao = () => {
    setModalRecuperacaoAberto(false);
    setLoginRecuperacao("");
    setMensagemRecuperacao("");
    setErroRecuperacao("");
    setCamposRecuperacaoInvalidos({});
  };

  const handleRecuperarSenha = async (event) => {
    event.preventDefault();

    setErroRecuperacao("");
    setMensagemRecuperacao("");
    setCamposRecuperacaoInvalidos({});

    if (!loginRecuperacao) {
      setCamposRecuperacaoInvalidos({ login: true });
      setErroRecuperacao("Informe o login para recuperar a senha.");
      loginRecuperacaoInputRef.current?.focus();
      return;
    }

    try {
      setEnviandoRecuperacao(true);

      const response = await esqueciSenha({
        login: loginRecuperacao,
      });

      setMensagemRecuperacao(
        response.data.mensagem ||
          "Se o login informado existir e estiver ativo, a recuperação de senha será enviada por e-mail.",
      );
      
    } catch (error) {
      setErroRecuperacao("Erro ao solicitar recuperação de senha.");
    } finally {
      setEnviandoRecuperacao(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>StockFlow</h1>
          <p>Acesse sua conta para gerenciar o estoque.</p>
        </div>

        {erro && (
          <div className="login-message login-message-error">{erro}</div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Login
            <input
              ref={loginInputRef}
              type="text"
              name="login"
              value={form.login}
              onChange={handleChange}
              placeholder="Digite seu login"
              className={camposInvalidos.login ? "input-error" : ""}
            />
          </label>

          <label>
            Senha
            <div className="login-password-field">
              <input
                ref={senhaInputRef}
                type={mostrarSenha ? "text" : "password"}
                name="senha"
                value={form.senha}
                onChange={handleChange}
                placeholder="Digite sua senha"
                className={camposInvalidos.senha ? "input-error" : ""}
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setMostrarSenha((valorAtual) => !valorAtual)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </label>

          <button type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>

          <button
            type="button"
            className="login-forgot-button"
            onClick={abrirModalRecuperacao}
          >
            Esqueci minha senha
          </button>
        </form>
      </div>
      {modalRecuperacaoAberto && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <div className="login-modal-header">
              <h2>Recuperar senha</h2>
              <p>Informe seu login para gerar um link de redefinição.</p>
            </div>

            {erroRecuperacao && (
              <div className="login-message login-message-error">
                {erroRecuperacao}
              </div>
            )}

            {mensagemRecuperacao && (
              <div className="login-message login-message-success">
                {mensagemRecuperacao}
              </div>
            )}

            <form className="login-modal-form" onSubmit={handleRecuperarSenha}>
              <label>
                Login
                <input
                  ref={loginRecuperacaoInputRef}
                  type="text"
                  value={loginRecuperacao}
                  onChange={(event) => {
                    setLoginRecuperacao(event.target.value);

                    if (camposRecuperacaoInvalidos.login) {
                      setCamposRecuperacaoInvalidos((camposAtuais) => ({
                        ...camposAtuais,
                        login: false,
                      }));
                    }
                  }}
                  placeholder="Digite seu login"
                  className={
                    camposRecuperacaoInvalidos.login ? "input-error" : ""
                  }
                />
              </label>

              <div className="login-modal-actions">
                <button type="button" onClick={fecharModalRecuperacao}>
                  Cancelar
                </button>

                <button type="submit" disabled={enviandoRecuperacao}>
                  {enviandoRecuperacao ? "Enviando..." : "Enviar recuperação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
