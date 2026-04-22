import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import "./Clientes.css";
import {
  listarClientes,
  deletarCliente,
} from "../../../services/clientesService";
import { useNavigate } from "react-router-dom";

const GerenciamentoClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

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
    const buscarClientes = async () => {
      try {
        const response = await listarClientes();
        setClientes(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar clientes", "erro");
      }
    };
    buscarClientes();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletarCliente(id);

      setClientes((clientesAtuais) =>
        clientesAtuais.filter((cliente) => cliente.id !== id),
      );

      mostrarMensagem("Cliente excluido com sucesso", "sucesso");
      setClienteSelecionado(null);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir cliente.";

      mostrarMensagem(mensagemErro, "erro");
      setClienteSelecionado(null);
    }
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    const buscaFormatada = busca.toLowerCase();

    return (
      cliente.nome.toLowerCase().includes(buscaFormatada) ||
      String(cliente.id).includes(buscaFormatada)
    );
  });

  return (
    <div className="gerenciamento-clientes-page">
      <div className="gerenciamento-clientes-header">
        <h1>Gerenciamento de Clientes</h1>
        <p>Visualize, edite ou remova clientes cadastrados</p>
      </div>
      <div className="gerenciamento-clientes-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <button type="button" onClick={() => navigate("/clientes")}>
          + Novo Cliente
        </button>
      </div>
      <div className="gerenciamento-clientes-card">
        <table className="gerenciamento-clientes-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Endereço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.nome}</td>
                <td>{cliente.cpf}</td>
                <td>{cliente.telefone}</td>
                <td>{cliente.email}</td>
                <td>
                  <div className="endereco-cell">{cliente.endereco}</div>
                </td>
                <td>
                  <button
                    type="button"
                    className="action-button edit-button"
                    onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                    title="Editar cliente"
                    aria-label="Editar cliente"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => setClienteSelecionado(cliente)}
                    title="Excluir cliente"
                    aria-label="Excluir cliente"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {clienteSelecionado && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Excluir cliente</h2>
            <p>
              Tem certeza que deseja excluir{" "}
              <strong>{clienteSelecionado.nome}</strong>?
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setClienteSelecionado(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => handleDelete(clienteSelecionado.id)}
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

export default GerenciamentoClientes;
