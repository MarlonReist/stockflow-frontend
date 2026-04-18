import React, { useState } from "react";
import "./Categoria.css";
import { cadastrarCategoria } from "../../services/categoriaService";

const categoriaInicial = {
  nome: "",
};

const Categorias = () => {
  const [categoria, setCategoria] = useState({ ...categoriaInicial });
  const [mensagens, setMensagens] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoria({ ...categoria, [name]: value });
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

  const validarCategoria = () => {
    const erros = [];

    if (!categoria.nome.trim()) {
      erros.push("Nome é obrigatório");
    }
    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarCategoria();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });
      return;
    }

    try {
      await cadastrarCategoria(categoria);
      mostrarMensagem("Categoria cadastrada com sucesso", "sucesso");
      handleClear();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao cadastrar categoria.";

      mostrarMensagem(mensagemErro, "erro");
    }
  };

  const handleClear = () => {
    setCategoria({ ...categoriaInicial });
  };

  return (
    <div className="categorias-page">
      <div className="categorias-header">
        <h1>Cadastro de Categorias</h1>
        <p>Adicione novas categorias ao sistema</p>
      </div>
      <div className="categorias-card">
        <form className="categorias-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              name="nome"
              placeholder="Digite o nome da categoria"
              value={categoria.nome}
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

export default Categorias;
