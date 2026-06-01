import React, { useState, useEffect } from "react";
import { FiBox, FiTrash2, FiCheckCircle, FiSlash, FiX } from "react-icons/fi";
import "./Itens.css";
import {
  listarSaidas,
  deletarSaida,
  finalizarSaida,
  cancelarSaida,
} from "../../../services/saidaEstoqueService";
import { useNavigate } from "react-router-dom";

const ItensSaida = () => {
  const [saidas, setSaidas] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [buscaData, setBuscaData] = useState("");
  const [saidaSelecionada, setSaidaSelecionada] = useState(null);
  const [acaoConfirmacao, setAcaoConfirmacao] = useState("");

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
    const buscarSaidas = async () => {
      try {
        const response = await listarSaidas();
        setSaidas(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar saídas", "erro");
      }
    };
    buscarSaidas();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletarSaida(id);
      setSaidas((saidasAtuais) =>
        saidasAtuais.filter((saida) => saida.id !== id),
      );

      mostrarMensagem("Saída excluida com sucesso", "sucesso");
      setSaidaSelecionada(null);
      setAcaoConfirmacao("");
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir saída.";

      mostrarMensagem(mensagemErro, "erro");
      setSaidaSelecionada(null);
      setAcaoConfirmacao("");
    }
  };

  const handleFinalizar = async (saida) => {
    try {
      await finalizarSaida(saida.id);
      setSaidas((saidasAtuais) =>
        saidasAtuais.map((saidaAtual) =>
          saidaAtual.id === saida.id
            ? { ...saidaAtual, status: "FINALIZADA" }
            : saidaAtual,
        ),
      );
      mostrarMensagem(`Saída Finalizada com sucesso`, "sucesso");
      setSaidaSelecionada(null);
      setAcaoConfirmacao("");
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao finalizar saída.";
      mostrarMensagem(mensagemErro, "erro");
      setSaidaSelecionada(null);
      setAcaoConfirmacao("");
    }
  };

  const handleCancelar = async (saida) => {
    try {
      await cancelarSaida(saida.id);
      setSaidas((saidasAtuais) =>
        saidasAtuais.map((saidaAtual) =>
          saidaAtual.id === saida.id
            ? { ...saidaAtual, status: "CANCELADA" }
            : saidaAtual,
        ),
      );
      mostrarMensagem(`Saída cancelada com sucesso`, "sucesso");
      setSaidaSelecionada(null);
      setAcaoConfirmacao("");
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao cancelar saída.";
      mostrarMensagem(mensagemErro, "erro");
      setSaidaSelecionada(null);
      setAcaoConfirmacao("");
    }
  };

  const saidasFiltradas = saidas.filter((saida) => {
    const buscaFormatada = busca.toLowerCase();

    const matchBusca =
      saida.almoxarifadoNome.toLowerCase().includes(buscaFormatada) ||
      String(saida.id).includes(buscaFormatada);

    const matchData = buscaData === "" || saida.dataSaida === buscaData;
    return matchBusca && matchData;
  });

  return (
    <div className="gerenciamento-itens-page">
      <div className="gerenciamento-itens-header">
        <h1>Itens da Saída</h1>
        <p>Gerencie os itens das saídas cadastradas</p>
      </div>
      <div className="gerenciamento-itens-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Almoxarifado..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <div className="date-filter-group">
          <input
            type="date"
            placeholder="Buscar por data"
            value={buscaData}
            onChange={(e) => setBuscaData(e.target.value)}
          />
          <button
            type="button"
            className="clear-date-button"
            onClick={() => setBuscaData("")}
          >
            <FiX />
          </button>
        </div>
        <button type="button" onClick={() => navigate("/saida/cadastro")}>
          + Nova Saída
        </button>
      </div>
      <div className="gerenciamento-itens-card">
        <table className="gerenciamento-itens-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Almoxarifado</th>
              <th>Data</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {saidasFiltradas.map((saida) => (
              <tr key={saida.id}>
                <td>{saida.id}</td>
                <td>{saida.almoxarifadoNome}</td>
                <td>{saida.dataSaida}</td>
                <td>
                  <span
                    className={`saida-status ${saida.status === "ABERTA" ? "saida-status-open" : saida.status === "FINALIZADA" ? "saida-status-finished" : "saida-status-canceled"}`}
                  >
                    {saida.status === "ABERTA"
                      ? "Aberta"
                      : saida.status === "FINALIZADA"
                        ? "Finalizada"
                        : "Cancelada"}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="action-button edit-button"
                    onClick={() => navigate(`/saida/itens/${saida.id}`)}
                    title="Gerenciar itens da saida"
                    aria-label="Gerenciar itens da saida"
                  >
                    <FiBox />
                  </button>
                  <button
                    type="button"
                    className="action-button finish-button"
                    onClick={() => {
                      setSaidaSelecionada(saida);
                      setAcaoConfirmacao("finalizar");
                    }}
                    title="Finalizar Saida"
                    aria-label="Finalizar Saida"
                  >
                    <FiCheckCircle />
                  </button>
                  <button
                    type="button"
                    className="action-button finish-cancel"
                    onClick={() => {
                      setSaidaSelecionada(saida);
                      setAcaoConfirmacao("cancelar");
                    }}
                    title="Cancelar Saida"
                    aria-label="Cancelar Saida"
                  >
                    <FiSlash />
                  </button>

                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => {
                      setSaidaSelecionada(saida);
                      setAcaoConfirmacao("excluir");
                    }}
                    title="Excluir saida"
                    aria-label="Excluir saida"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {saidaSelecionada && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            {acaoConfirmacao === "finalizar" ? (
              <h2>Finalizar saída</h2>
            ) : acaoConfirmacao === "cancelar" ? (
              <h2>Cancelar saída</h2>
            ) : (
              <h2>Excluir saída</h2>
            )}
            {acaoConfirmacao === "finalizar" ? (
              <p>
                Tem certeza que deseja finalizar{" "}
                <strong>{saidaSelecionada.id}</strong>?
              </p>
            ) : acaoConfirmacao === "cancelar" ? (
              <p>
                Tem certeza que deseja cancelar{" "}
                <strong>{saidaSelecionada.id}</strong>?
              </p>
            ) : (
              <p>
                Tem certeza que deseja excluir{" "}
                <strong>{saidaSelecionada.id}</strong>?
              </p>
            )}

            <div className="confirm-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setSaidaSelecionada(null);
                  setAcaoConfirmacao("");
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => {
                  acaoConfirmacao === "finalizar"
                    ? handleFinalizar(saidaSelecionada)
                    : acaoConfirmacao === "cancelar"
                      ? handleCancelar(saidaSelecionada)
                      : handleDelete(saidaSelecionada.id);
                }}
              >
                {acaoConfirmacao === "finalizar"
                  ? "Finalizar"
                  : acaoConfirmacao === "cancelar"
                    ? "Cancelar"
                    : "Excluir"}
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

export default ItensSaida;
