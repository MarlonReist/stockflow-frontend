import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import "./Almoxarifados.css";
import {
  listarAlmoxarifados,
  deletarAlmoxarifado,
} from "../../../services/almoxarifadoService";
import { useNavigate } from "react-router-dom";

const GerenciamentoAlmoxarifados = () => {
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [almoxarifadoSelecionado, setAlmoxarifadoSelecionado] = useState(null);

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
    const buscarAlmoxarifados = async () => {
      try {
        const response = await listarAlmoxarifados();
        setAlmoxarifados(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar almoxarifados", "erro");
      }
    };
    buscarAlmoxarifados();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletarAlmoxarifado(id);

      setAlmoxarifados((almoxarifadosAtuais) =>
        almoxarifadosAtuais.filter((almoxarifados) => almoxarifados.id !== id),
      );

      mostrarMensagem("Almoxarifado excluido com sucesso", "sucesso");
      setAlmoxarifadoSelecionado(null);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir almoxarifado.";

      mostrarMensagem(mensagemErro, "erro");
      setAlmoxarifadoSelecionado(null);
    }
  };

  const almoxarifadosFiltrados = almoxarifados.filter((almoxarifado) => {
    const buscaFormatada = busca.toLowerCase();

    return (
      almoxarifado.nome.toLowerCase().includes(buscaFormatada) ||
      String(almoxarifado.id).includes(buscaFormatada)
    );
  });

  return (
      <div className="gerenciamento-almoxarifados-page">
        <div className="gerenciamento-almoxarifados-header">
          <h1>Gerenciamento de Almoxarifados</h1>
          <p>Visualize, edite ou remova almoxarifados cadastrados</p>
        </div>
        <div className="gerenciamento-almoxarifados-actions">
          <input
            type="text"
            placeholder="Buscar por ID ou Nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button type="button" onClick={() => navigate("/almoxarifados")}>
            + Novo Almoxarifado
          </button>
        </div>
        <div className="gerenciamento-almoxarifados-card">
          <table className="gerenciamento-almoxarifados-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {almoxarifadosFiltrados.map((almoxarifado) => (
                <tr key={almoxarifado.id}>
                  <td>{almoxarifado.id}</td>
                  <td>{almoxarifado.nome}</td>
                  <td>
                    <button
                      type="button"
                      className="action-button edit-button"
                      onClick={() => navigate(`/almoxarifados/editar/${almoxarifado.id}`)}
                      title="Editar almoxarifado"
                      aria-label="Editar almoxarifado"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      type="button"
                      className="action-button delete-button"
                      onClick={() => setAlmoxarifadoSelecionado(almoxarifado)}
                      title="Excluir almoxarifado"
                      aria-label="Excluir almoxarifado"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {almoxarifadoSelecionado && (
          <div className="modal-overlay">
            <div className="confirm-modal">
              <h2>Excluir almoxarifado</h2>
              <p>
                Tem certeza que deseja excluir{" "}
                <strong>{almoxarifadoSelecionado.nome}</strong>?
              </p>
              <div className="confirm-modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setAlmoxarifadoSelecionado(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleDelete(almoxarifadoSelecionado.id)}
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
  
  export default GerenciamentoAlmoxarifados;
  