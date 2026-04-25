import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import "./Produtos.css";
import {
  listarProdutos,
  deletarProduto,
} from "../../../services/produtoService";
import { useNavigate } from "react-router-dom";

const GerenciamentoProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const navigate = useNavigate();

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
    const buscarProdutos = async () => {
      try {
        const response = await listarProdutos();
        setProdutos(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar produtos", "erro");
      }
    };
    buscarProdutos();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletarProduto(id);

      setProdutos((produtosAtuais) =>
        produtosAtuais.filter((produto) => produto.id !== id),
      );

      mostrarMensagem("Produto excluido com sucesso", "sucesso");
      setProdutoSelecionado(null);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir produto.";

      mostrarMensagem(mensagemErro, "erro");
      setProdutoSelecionado(null);
    }
  };

  const produtosFiltrados = produtos.filter((produto) => {
    const buscaFormatada = busca.toLowerCase();

    return (
      produto.nome.toLowerCase().includes(buscaFormatada) ||
      String(produto.id).includes(buscaFormatada)
    );
  });

  return (
    <div className="gerenciamento-produtos-page">
      <div className="gerenciamento-produtos-header">
        <h1>Gerenciamento de Produtos</h1>
        <p>Visualize, edite ou remova produtos cadastrados</p>
      </div>
      <div className="gerenciamento-produtos-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <button type="button" onClick={() => navigate("/produtos")}>
          + Novo Produto
        </button>
      </div>
      <div className="gerenciamento-produtos-card">
        <table className="gerenciamento-produtos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Preço</th>
              <th>Categoria</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.map((produto) => (
              <tr key={produto.id}>
                <td>{produto.id}</td>
                <td>{produto.nome}</td>
                <td>
                  {Number(produto.preco).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td>{produto.categoriaNome}</td>
                <td>
                  <button
                    type="button"
                    className="action-button edit-button"
                    onClick={() => navigate(`/produtos/editar/${produto.id}`)}
                    title="Editar produto"
                    aria-label="Editar produto"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => setProdutoSelecionado(produto)}
                    title="Excluir produto"
                    aria-label="Excluir produto"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {produtoSelecionado && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Excluir produto</h2>
            <p>
              Tem certeza que deseja excluir{" "}
              <strong>{produtoSelecionado.nome}</strong>?
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setProdutoSelecionado(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => handleDelete(produtoSelecionado.id)}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
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

export default GerenciamentoProdutos;
