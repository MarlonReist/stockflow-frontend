import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import "./Categorias.css";
import {
  listarCategorias,
  deletarCategoria,
} from "../../../services/categoriaService";
import { useNavigate } from "react-router-dom";

const GerenciamentoCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

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
    const buscarCategorias = async () => {
      try {
        const response = await listarCategorias();
        setCategorias(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar categorias", "erro");
      }
    };
    buscarCategorias();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletarCategoria(id);

      setCategorias((categoriasAtuais) =>
        categoriasAtuais.filter((categorias) => categorias.id !== id),
      );

      mostrarMensagem("Categoria excluida com sucesso", "sucesso");
      setCategoriaSelecionada(null);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir categoria.";

      mostrarMensagem(mensagemErro, "erro");
      setCategoriaSelecionada(null);
    }
  };

  const categoriasFiltradas = categorias.filter((categoria) => {
    const buscaFormatada = busca.toLowerCase();

    return (
      categoria.nome.toLowerCase().includes(buscaFormatada) ||
      String(categoria.id).includes(buscaFormatada)
    );
  });

  return (
    <div className="gerenciamento-categorias-page">
      <div className="gerenciamento-categorias-header">
        <h1>Gerenciamento de Categorias</h1>
        <p>Visualize, edite ou remova categorias cadastradas</p>
      </div>
      <div className="gerenciamento-categorias-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <button type="button" onClick={() => navigate("/categorias")}>
          + Nova Categoria
        </button>
      </div>
      <div className="gerenciamento-categorias-card">
        <table className="gerenciamento-categorias-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categoriasFiltradas.map((categoria) => (
              <tr key={categoria.id}>
                <td>{categoria.id}</td>
                <td>{categoria.nome}</td>
                <td>
                  <button
                    type="button"
                    className="action-button edit-button"
                    onClick={() => navigate(`/categorias/editar/${categoria.id}`)}
                    title="Editar categoria"
                    aria-label="Editar categoria"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => setCategoriaSelecionada(categoria)}
                    title="Excluir categoria"
                    aria-label="Excluir categoria"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {categoriaSelecionada && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Excluir categoria</h2>
            <p>
              Tem certeza que deseja excluir{" "}
              <strong>{categoriaSelecionada.nome}</strong>?
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setCategoriaSelecionada(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => handleDelete(categoriaSelecionada.id)}
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

export default GerenciamentoCategorias;
