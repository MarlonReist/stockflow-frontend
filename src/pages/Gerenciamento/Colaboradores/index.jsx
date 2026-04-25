import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import "./Colaboradores.css";
import {
  listarColaboradores,
  deletarColaborador,
} from "../../../services/colaboradorService";
import { useNavigate } from "react-router-dom";

const GerenciamentoColaboradores = () => {
  const [colaboradores, setColaboradores] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState(null);

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
    const buscarColaboradores = async () => {
      try {
        const response = await listarColaboradores();
        setColaboradores(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar colaboradores", "erro");
      }
    };
    buscarColaboradores();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletarColaborador(id);

      setColaboradores((colaboradoresAtuais) =>
        colaboradoresAtuais.filter((colaborador) => colaborador.id !== id),
      );

      mostrarMensagem("Colaborador excluido com sucesso", "sucesso");
      setColaboradorSelecionado(null);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir colaborador.";

      mostrarMensagem(mensagemErro, "erro");
      setColaboradorSelecionado(null);
    }
  };

  const colaboradoresFiltrados = colaboradores.filter((colaborador) => {
    const buscaFormatada = busca.toLowerCase();

    return (
      colaborador.nome.toLowerCase().includes(buscaFormatada) ||
      String(colaborador.id).includes(buscaFormatada)
    );
  });

  return (
    <div className="gerenciamento-colaboradores-page">
      <div className="gerenciamento-colaboradores-header">
        <h1>Gerenciamento de Colaboradores</h1>
        <p>Visualize, edite ou remova colaboradores cadastrados</p>
      </div>
      <div className="gerenciamento-colaboradores-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <button type="button" onClick={() => navigate("/colaboradores")}>
          + Novo Colaborador
        </button>
      </div>
      <div className="gerenciamento-colaboradores-card">
        <table className="gerenciamento-colaboradores-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Cargo</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {colaboradoresFiltrados.map((colaborador) => (
              <tr key={colaborador.id}>
                <td>{colaborador.id}</td>
                <td>{colaborador.nome}</td>
                <td>{colaborador.cpf}</td>
                <td>{colaborador.cargo}</td>
                <td>{colaborador.telefone}</td>
                <td>
                  <button
                    type="button"
                    className="action-button edit-button"
                    onClick={() =>
                      navigate(`/colaboradores/editar/${colaborador.id}`)
                    }
                    title="Editar colaborador"
                    aria-label="Editar colaborador"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => setColaboradorSelecionado(colaborador)}
                    title="Excluir colaborador"
                    aria-label="Excluir colaborador"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {colaboradorSelecionado && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Excluir colaborador</h2>
            <p>
              Tem certeza que deseja excluir{" "}
              <strong>{colaboradorSelecionado.nome}</strong>?
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setColaboradorSelecionado(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => handleDelete(colaboradorSelecionado.id)}
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

export default GerenciamentoColaboradores;
