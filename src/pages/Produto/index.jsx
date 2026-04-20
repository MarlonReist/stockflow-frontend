import React, { useState, useEffect } from "react";
import "./Produto.css";
import { cadastrarProduto } from "../../services/produtoService";
import { listarCategorias } from "../../services/categoriaService";

const produtoInicial = {
  nome: "",
  preco: "",
  categoriaId: "",
  unidadeMedida: "",
};

const Produto = () => {
  const [produto, setProduto] = useState({ ...produtoInicial });
  const [categorias, setCategorias] = useState([]);
  const [mensagens, setMensagens] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduto({ ...produto, [name]: value });
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

  useEffect(() => {
    const buscarCategorias = async () => {
      try {
        const response = await listarCategorias();
        setCategorias(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar categoria", "erro");
      }
    };
    buscarCategorias();
  }, []);

  const validarProduto = () => {
    const erros = [];

    if (!produto.nome.trim()) {
      erros.push("Nome é obrigatório");
    }
    if (!produto.preco.trim()) {
      erros.push("Preço é obrigatório");
    }
    if (!produto.categoriaId.trim()) {
      erros.push("Categoria é obrigatório");
    }
    if (!produto.unidadeMedida.trim()) {
      erros.push("Unidade de Medida é obrigatório");
    }
    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarProduto();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });
      return;
    }

    try {
      await cadastrarProduto(produto);
      mostrarMensagem("Produto cadastrado com sucesso", "sucesso");
      handleClear();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao cadastrar produto.";

      mostrarMensagem(mensagemErro, "erro");

      return;
    }
  };

  const handleClear = () => {
    setProduto({ ...produtoInicial });
  };

  return (
    <div className="produto-page">
      <div className="produto-header">
        <h1>Cadastro de Produtos</h1>
        <p>Adicione novos produtos ao sistema</p>
      </div>
      <div className="produto-card">
        <form className="produto-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              name="nome"
              placeholder="Digite o nome do produto"
              value={produto.nome}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Preço</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="preco"
                placeholder="Digite o preço"
                value={produto.preco}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select
                name="categoriaId"
                value={produto.categoriaId}
                onChange={handleChange}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Unidade de Medida</label>
            <select
              name="unidadeMedida"
              value={produto.unidadeMedida}
              onChange={handleChange}
            >
              <option value=""> Selecione uma unidade</option>
              <option value="UNIDADES">Unidades</option>
              <option value="METRO">Metro</option>
            </select>
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

export default Produto;
