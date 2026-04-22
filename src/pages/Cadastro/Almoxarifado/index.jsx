import React, { useState } from "react";
import "./Almoxarifado.css";
import { cadastrarAlmoxarifado } from "../../../services/almoxarifadoService";

const almoxarifadoInicial = {
  nome: "",
};

const Almoxarifado = () => {
  const [almoxarifado, setAlmoxarifado] = useState({ ...almoxarifadoInicial });
  const [mensagens, setMensagens] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAlmoxarifado({ ...almoxarifado, [name]: value });
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

  const validarAlmoxarifado = () => {
    const erros = [];

    if (!almoxarifado.nome.trim()) {
      erros.push("Nome é obrigatório");
    }
    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarAlmoxarifado();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });
      return;
    }

    try {
      await cadastrarAlmoxarifado(almoxarifado);
      mostrarMensagem("Almoxarifado cadastrado com sucesso", "sucesso");
      handleClear();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao cadastrar almoxarifado.";

      mostrarMensagem(mensagemErro, "erro");
    }
  };

  const handleClear = () => {
    setAlmoxarifado({ ...almoxarifadoInicial });
  };

  return (
    <div className="almoxarifado-page">
      <div className="almoxarifado-header">
        <h1>Cadastro de Almoxarifado</h1>
        <p>Adicione novos almoxarifados ao sistema</p>
      </div>
      <div className="almoxarifado-card">
        <form className="almoxarifado-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              name="nome"
              placeholder="Digite o nome do almoxarifado"
              value={almoxarifado.nome}
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

export default Almoxarifado;
