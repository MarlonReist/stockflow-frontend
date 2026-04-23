import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import "./Fornecedor.css";
import {
  listarFornecedores,
  deletarFornecedor,
} from "../../../services/fornecedorService";
import { useNavigate } from "react-router-dom";

const GerenciamentoFornecedores = () => {
  const [fornecedores, setFornecedores] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);

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
    const buscarFornecedores = async () => {
      try {
        const response = await listarFornecedores();
        setFornecedores(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar fornecedores", "erro");
      }
    };
    buscarFornecedores();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletarFornecedor(id);

      setFornecedores((fornecedoresAtuais) =>
        fornecedoresAtuais.filter((fornecedor) => fornecedor.id !== id),
      );

      mostrarMensagem("Fornecedor excluido com sucesso", "sucesso");
      setFornecedorSelecionado(null);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir fornecedor.";

      mostrarMensagem(mensagemErro, "erro");
      setFornecedorSelecionado(null);
    }
  };

  const fornecedoresFiltrados = fornecedores.filter((fornecedor) => {
    const buscaFormatada = busca.toLowerCase();

    return (
      fornecedor.nome.toLowerCase().includes(buscaFormatada) ||
      String(fornecedor.id).includes(buscaFormatada)
    );
  });

  return (
    <div className="gerenciamento-fornecedores-page">
      <div className="gerenciamento-fornecedores-header">
        <h1>Gerenciamento de Fornecedores</h1>
        <p>Visualize, edite ou remova fornecedores cadastrados</p>
      </div>
      <div className="gerenciamento-fornecedores-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <button type="button" onClick={() => navigate("/fornecedores")}>
          + Novo Fornecedor
        </button>
      </div>
      <div className="gerenciamento-fornecedores-card">
        <table className="gerenciamento-fornecedores-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CNPJ</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {fornecedoresFiltrados.map((fornecedor) => (
              <tr key={fornecedor.id}>
                <td>{fornecedor.id}</td>
                <td>{fornecedor.nome}</td>
                <td>{fornecedor.cnpj}</td>
                <td>
                  <button
                    type="button"
                    className="action-button edit-button"
                    onClick={() => navigate(`/fornecedores/editar/${fornecedor.id}`)}
                    title="Editar fornecedor"
                    aria-label="Editar fornecedor"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => setFornecedorSelecionado(fornecedor)}
                    title="Excluir fornecedor"
                    aria-label="Excluir fornecedor"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {fornecedorSelecionado && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Excluir fornecedor</h2>
            <p>
              Tem certeza que deseja excluir{" "}
              <strong>{fornecedorSelecionado.nome}</strong>?
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setFornecedorSelecionado(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => handleDelete(fornecedorSelecionado.id)}
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

export default GerenciamentoFornecedores;
