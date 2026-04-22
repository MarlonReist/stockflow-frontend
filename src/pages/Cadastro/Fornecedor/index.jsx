import React, { useState } from "react";
import "./Fornecedor.css";
import { cadastrarFornecedor } from "../../../services/fornecedorService";

const fornecedorInicial = {
  nome: "",
  cnpj: "",
};

const Fornecedor = () => {
  const [fornecedor, setFornecedor] = useState({ ...fornecedorInicial });
  const [mensagens, setMensagens] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFornecedor({ ...fornecedor, [name]: value });
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

  const validarFornecedor = () => {
    const erros = [];

    if (!fornecedor.nome.trim()) {
      erros.push("Nome é obrigatório");
    }
    if (!fornecedor.cnpj.trim()) {
      erros.push("CNPJ é obrigatório");
    }
    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarFornecedor();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });
      return;
    }

    try {
      await cadastrarFornecedor(fornecedor);
      mostrarMensagem("Fornecedor cadastrado com sucesso", "sucesso");
      handleClear();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao cadastrar fornecedor.";

      mostrarMensagem(mensagemErro, "erro");
    }
  };

  const handleClear = () => {
    setFornecedor({ ...fornecedorInicial });
  };

  return (
    <div className="fornecedor-page">
      <div className="fornecedor-header">
        <h1>Cadastro de Fornecedor</h1>
        <p>Adicione novos fornecedores ao sistema</p>
      </div>
      <div className="fornecedor-card">
        <form className="fornecedor-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              name="nome"
              placeholder="Digite o nome do fornecedor"
              value={fornecedor.nome}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>CNPJ</label>
            <input
              type="text"
              name="cnpj"
              placeholder="00.000.000/0000-00"
              value={fornecedor.cnpj}
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

export default Fornecedor;
