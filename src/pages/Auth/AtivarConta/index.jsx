import React, { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ativarConvite, validarConvite } from "../../../services/authService";
import "./AtivarConta.css";

const AtivarConta = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [convite, setConvite] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    senha: "",
    confirmacaoSenha: "",
  });
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false);

  useEffect(() => {
    const validarTokenConvite = async () => {
      if (!token) {
        setErro("Token de convite não informado.");
        setCarregando(false);
        return;
      }

      try {
        const response = await validarConvite(token);

        if (response.data.valido) {
          setConvite(response.data);
        } else {
          setErro("Convite inválido ou expirado.");
        }
      } catch (error) {
        setErro("Erro ao validar convite. Tente novamente.");
      } finally {
        setCarregando(false);
      }
    };

    validarTokenConvite();
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

      await ativarConvite({
        token,
        senha: form.senha,
        confirmacaoSenha: form.confirmacaoSenha,
      });

      setSucesso("Conta ativada com sucesso. Você já pode fazer login.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setErro("Erro ao ativar conta. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="ativar-conta-page">
      <div className="ativar-conta-card">
        <h1>Ativar Conta</h1>
        {carregando && <p>Validando convite...</p>}
        {!carregando && erro && (
          <div className="ativar-conta-message ativar-conta-message-error">
            {erro}
          </div>
        )}
        {sucesso && (
          <div className="ativar-conta-message ativar-conta-message-success">
            {sucesso}
          </div>
        )}
        {!carregando && convite && (
          <form className="ativar-conta-form" onSubmit={handleSubmit}>
            <p>Convite validado. Crie sua senha para acessar o sistema.</p>

            <label>
              Nome
              <input type="text" value={convite.nome} readOnly />
            </label>

            <label>
              E-mail
              <input type="text" value={convite.login} readOnly />
            </label>

            <label>
              Senha
              <div className="ativar-conta-password-field">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  name="senha"
                  value={form.senha}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="ativar-conta-password-toggle"
                  onClick={() => setMostrarSenha((valorAtual) => !valorAtual)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <label>
              Confirmar senha
              <div className="ativar-conta-password-field">
                <input
                  type={mostrarConfirmacaoSenha ? "text" : "password"}
                  name="confirmacaoSenha"
                  value={form.confirmacaoSenha}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="ativar-conta-password-toggle"
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
              {enviando ? "Ativando..." : "Ativar conta"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AtivarConta;
