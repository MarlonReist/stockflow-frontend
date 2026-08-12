import React, { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  alterarMinhaSenha,
  buscarMeuPerfil,
} from "../../services/perfilService";
import "./Perfil.css";

const Perfil = () => {
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [sucessoSenha, setSucessoSenha] = useState("");
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false);
  const [formSenha, setFormSenha] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmacaoSenha: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const response = await buscarMeuPerfil();
        setPerfil(response.data);
      } catch (error) {
        setErro("Erro ao carregar os dados do perfil.");
      } finally {
        setCarregando(false);
      }
    };

    carregarPerfil();
  }, []);

  const handleChangeSenha = (event) => {
    const { name, value } = event.target;

    setFormSenha((formAtual) => ({
      ...formAtual,
      [name]: value,
    }));
  };

  const validarSenha = () => {
    if (
      !formSenha.senhaAtual ||
      !formSenha.novaSenha ||
      !formSenha.confirmacaoSenha
    ) {
      return "Preencha todos os campos de senha.";
    }

    if (formSenha.novaSenha.length < 8) {
      return "A nova senha deve ter pelo menos 8 caracteres.";
    }

    if (!/[A-Z]/.test(formSenha.novaSenha)) {
      return "A nova senha deve conter pelo menos uma letra maiúscula.";
    }

    if (!/[a-z]/.test(formSenha.novaSenha)) {
      return "A nova senha deve conter pelo menos uma letra minúscula.";
    }

    if (!/[0-9]/.test(formSenha.novaSenha)) {
      return "A nova senha deve conter pelo menos um número.";
    }

    if (!/[^A-Za-z0-9]/.test(formSenha.novaSenha)) {
      return "A nova senha deve conter pelo menos um caractere especial.";
    }

    if (formSenha.novaSenha !== formSenha.confirmacaoSenha) {
      return "A confirmação de senha não confere.";
    }

    return "";
  };

  const handleSubmitSenha = async (event) => {
    event.preventDefault();

    setErroSenha("");
    setSucessoSenha("");

    const erroValidacao = validarSenha();

    if (erroValidacao) {
      setErroSenha(erroValidacao);
      return;
    }

    try {
      setAlterandoSenha(true);

      const response = await alterarMinhaSenha(formSenha);

      setSucessoSenha(response.data.mensagem || "Senha alterada com sucesso.");

      localStorage.removeItem("stockflow_token");
      localStorage.removeItem("stockflow_usuario");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setErroSenha(
        error.response?.data?.message ||
          "Erro ao alterar senha. Verifique os dados e tente novamente.",
      );
    } finally {
      setAlterandoSenha(false);
    }
  };

  return (
    <div className="perfil-page">
      <div className="perfil-header">
        <div>
          <h1>Meu Perfil</h1>
          <p>Gerencie seus dados de acesso ao StockFlow.</p>
        </div>
      </div>

      {carregando && <p className="perfil-loading">Carregando perfil...</p>}

      {erro && <p className="perfil-message perfil-message-error">{erro}</p>}

      <div className="perfil-content">
        {perfil && (
          <div className="perfil-card perfil-info-card">
            <div className="perfil-card-header">
              <h2>Dados do usuário</h2>
              <span className="perfil-status-badge">{perfil.status}</span>
            </div>

            <div className="perfil-info-grid">
              <div className="perfil-info-item">
                <span>Nome</span>
                <strong>{perfil.nome}</strong>
              </div>

              <div className="perfil-info-item">
                <span>E-mail</span>
                <strong>{perfil.login}</strong>
              </div>

              <div className="perfil-info-item">
                <span>Perfil de acesso</span>
                <strong>{perfil.perfil}</strong>
              </div>

              <div className="perfil-info-item">
                <span>Status</span>
                <strong>{perfil.status}</strong>
              </div>
            </div>
          </div>
        )}

        <form
          className="perfil-card perfil-password-card"
          onSubmit={handleSubmitSenha}
        >
          <div className="perfil-card-header">
            <div>
              <h2>Alterar senha</h2>
              <p>Após alterar, será necessário fazer login novamente.</p>
            </div>
          </div>

          {erroSenha && (
            <p className="perfil-message perfil-message-error">{erroSenha}</p>
          )}
          {sucessoSenha && (
            <p className="perfil-message perfil-message-success">
              {sucessoSenha}
            </p>
          )}

          <div className="perfil-form-grid">
            <label>
              Senha atual
              <div className="perfil-password-field">
                <input
                  type={mostrarSenhaAtual ? "text" : "password"}
                  name="senhaAtual"
                  value={formSenha.senhaAtual}
                  onChange={handleChangeSenha}
                  placeholder="Digite sua senha atual"
                />

                <button
                  type="button"
                  className="perfil-password-toggle"
                  onClick={() => setMostrarSenhaAtual((valorAtual) => !valorAtual)}
                  aria-label={
                    mostrarSenhaAtual ? "Ocultar senha atual" : "Mostrar senha atual"
                  }
                >
                  {mostrarSenhaAtual ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <label>
              Nova senha
              <div className="perfil-password-field">
                <input
                  type={mostrarNovaSenha ? "text" : "password"}
                  name="novaSenha"
                  value={formSenha.novaSenha}
                  onChange={handleChangeSenha}
                  placeholder="Digite a nova senha"
                />

                <button
                  type="button"
                  className="perfil-password-toggle"
                  onClick={() => setMostrarNovaSenha((valorAtual) => !valorAtual)}
                  aria-label={
                    mostrarNovaSenha ? "Ocultar nova senha" : "Mostrar nova senha"
                  }
                >
                  {mostrarNovaSenha ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <label>
              Confirmar nova senha
              <div className="perfil-password-field">
                <input
                  type={mostrarConfirmacaoSenha ? "text" : "password"}
                  name="confirmacaoSenha"
                  value={formSenha.confirmacaoSenha}
                  onChange={handleChangeSenha}
                  placeholder="Confirme a nova senha"
                />

                <button
                  type="button"
                  className="perfil-password-toggle"
                  onClick={() =>
                    setMostrarConfirmacaoSenha((valorAtual) => !valorAtual)
                  }
                  aria-label={
                    mostrarConfirmacaoSenha
                      ? "Ocultar confirmação de senha"
                      : "Mostrar confirmação de senha"
                  }
                >
                  {mostrarConfirmacaoSenha ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>
          </div>

          <div className="perfil-password-rules">
            <span>A senha deve ter no mínimo 8 caracteres, letra maiúscula, letra minúscula, número e caractere especial.</span>
          </div>

          <div className="perfil-actions">
            <button type="submit" disabled={alterandoSenha}>
              {alterandoSenha ? "Alterando..." : "Alterar senha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Perfil;
