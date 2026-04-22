import React, { useState } from "react";
import "./Colaborador.css";
import { cadastrarColaborador } from "../../../services/colaboradorService";

const colaboradorInicial = {
  nome: "",
  cpf: "",
  cargo: "",
  telefone: "",
};

const Colaborador = () => {
  const [colaborador, setColaborador] = useState({ ...colaboradorInicial });
  const [mensagens, setMensagens] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setColaborador({ ...colaborador, [name]: value });
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

  const validarColaborador = () => {
    const erros = [];

    if (!colaborador.nome.trim()) {
      erros.push("Nome é obrigatório");
    }
    if (!colaborador.cpf.trim()) {
      erros.push("CPF é obrigatório");
    }
    if (!colaborador.cargo.trim()) {
      erros.push("Cargo é obrigatório");
    }
    if (!colaborador.telefone.trim()) {
      erros.push("Telefone é obrigatório");
    }
    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarColaborador();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });
      return;
    }

    try {
      await cadastrarColaborador(colaborador);
      mostrarMensagem("Colaborador cadastrado com sucesso", "sucesso");
      handleClear();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao cadastrar colaborador.";

      mostrarMensagem(mensagemErro, "erro");
    }
  };

  const handleClear = () => {
    setColaborador({ ...colaboradorInicial });
  };

  return (
    <div className="colaborador-page">
      <div className="colaborador-header">
        <h1>Cadastro de Colaborador</h1>
        <p>Adicione novos colaboradores ao sistema</p>
      </div>
      <div className="colaborador-card">
        <form className="colaborador-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              name="nome"
              placeholder="Digite o nome do colaborador"
              value={colaborador.nome}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>CPF</label>
              <input
                type="text"
                name="cpf"
                placeholder="000.000.000-00"
                value={colaborador.cpf}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Cargo</label>
              <input
                type="text"
                name="cargo"
                placeholder="Ex: Técnico, Gerente"
                value={colaborador.cargo}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Telefone</label>
            <input
              type="text"
              name="telefone"
              placeholder="(00) 00000-0000"
              value={colaborador.telefone}
              onChange={handleChange}
            />
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

export default Colaborador;
