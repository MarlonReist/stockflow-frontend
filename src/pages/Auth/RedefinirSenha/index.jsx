import React, { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  redefinirSenha,
  validarRecuperacaoSenha,
} from "../../../services/authService";
import "./RedefinirSenha.css";

const RedefinirSenha = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [recuperacao, setRecuperacao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [form, setForm] = useState({
    senha: "",
    confirmacaoSenha: "",
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false);

  useEffect(() => {
    const validarTokenRecuperacao = async () => {
      if (!token) {
        setErro("Token de recuperação não informado.");
        setCarregando(false);
        return;
      }

      try {
        const response = await validarRecuperacaoSenha(token);

        if (response.data.valido) {
          setRecuperacao(response.data);
        } else {
          setErro("Token de recuperação inválido ou expirado.");
        }
      } catch (error) {
        setErro("Erro ao validar recuperação de senha. Tente novamente.");
      } finally {
        setCarregando(false);
      }
    };

    validarTokenRecuperacao();
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((formAtual) => ({
      ...formAtual,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!form.senha || !form.confirmacaoSenha) {
      setErro("Informe a senha e a confirmação de senha.");
      return;
    }

    if (form.senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (!/[A-Z]/.test(form.senha)) {
      setErro("A senha deve conter pelo menos uma letra maiúscula.");
      return;
    }

    if (!/[a-z]/.test(form.senha)) {
      setErro("A senha deve conter pelo menos uma letra minúscula.");
      return;
    }

    if (!/[0-9]/.test(form.senha)) {
      setErro("A senha deve conter pelo menos um número.");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(form.senha)) {
      setErro("A senha deve conter pelo menos um caractere especial.");
      return;
    }

    if (form.senha !== form.confirmacaoSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    try {
      setEnviando(true);

      const response = await redefinirSenha({
        token,
        senha: form.senha,
        confirmacaoSenha: form.confirmacaoSenha,
      });

      setSucesso(response.data.mensagem || "Senha redefinida com sucesso.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setErro(
        error.response?.data?.message ||
          "Erro ao redefinir senha. Tente novamente.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="redefinir-senha-page">
      <div className="redefinir-senha-card">
        <h1>Redefinir Senha</h1>

        {carregando && <p>Validando recuperação de senha...</p>}

        {!carregando && erro && (
          <div className="redefinir-senha-message redefinir-senha-message-error">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="redefinir-senha-message redefinir-senha-message-success">
            {sucesso}
          </div>
        )}

        {!carregando && recuperacao && (
          <form className="redefinir-senha-form" onSubmit={handleSubmit}>
            <p>Crie uma nova senha para acessar sua conta.</p>

            <label>
              Nome
              <input type="text" value={recuperacao.nome} readOnly />
            </label>

            <label>
              E-mail
              <input type="text" value={recuperacao.login} readOnly />
            </label>

            <label>
              Nova senha
              <div className="redefinir-senha-password-field">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  name="senha"
                  value={form.senha}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="redefinir-senha-password-toggle"
                  onClick={() => setMostrarSenha((valorAtual) => !valorAtual)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <label>
              Confirmar nova senha
              <div className="redefinir-senha-password-field">
                <input
                  type={mostrarConfirmacaoSenha ? "text" : "password"}
                  name="confirmacaoSenha"
                  value={form.confirmacaoSenha}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="redefinir-senha-password-toggle"
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

            <button type="submit" disabled={enviando}>
              {enviando ? "Redefinindo..." : "Redefinir senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RedefinirSenha;
