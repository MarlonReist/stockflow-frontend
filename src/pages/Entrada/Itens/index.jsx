import React, { useState, useEffect } from "react";
import { FiBox, FiTrash2, FiCheckCircle, FiSlash, FiX } from "react-icons/fi";
import "./Itens.css";
import {
  listarEntradas,
  deletarEntrada,
  finalizarEntrada,
  cancelarEntrada,
} from "../../../services/entradaEstoqueService";
import { useNavigate } from "react-router-dom";

const ItensEntrada = () => {
  const [entradas, setEntradas] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [buscaData, setBuscaData] = useState("");
  const [entradaSelecionada, setEntradaSelecionada] = useState(null);
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
    const buscarEntradas = async () => {
      try {
        const response = await listarEntradas();
        setEntradas(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar entradas", "erro");
      }
    };
    buscarEntradas();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletarEntrada(id);
      setEntradas((entradasAtuais) =>
        entradasAtuais.filter((entrada) => entrada.id !== id),
      );

      mostrarMensagem("Entrada excluida com sucesso", "sucesso");
      setEntradaSelecionada(null);
      setAcaoConfirmacao("");
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir entrada.";

      mostrarMensagem(mensagemErro, "erro");
      setEntradaSelecionada(null);
      setAcaoConfirmacao("");
    }
  };

  const handleFinalizar = async (entrada) => {
    try {
      await finalizarEntrada(entrada.id);
      setEntradas((entradasAtuais) =>
        entradasAtuais.map((entradaAtual) =>
          entradaAtual.id === entrada.id
            ? { ...entradaAtual, status: "FINALIZADA" }
            : entradaAtual,
        ),
      );
      mostrarMensagem(`Entrada Finalizada com sucesso`, "sucesso");
      setEntradaSelecionada(null);
      setAcaoConfirmacao("");
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao finalizar entrada.";
      mostrarMensagem(mensagemErro, "erro");
      setEntradaSelecionada(null);
      setAcaoConfirmacao("");
    }
  };

  const handleCancelar = async (entrada) => {
    try {
      await cancelarEntrada(entrada.id);
      setEntradas((entradasAtuais) =>
        entradasAtuais.map((entradaAtual) =>
          entradaAtual.id === entrada.id
            ? { ...entradaAtual, status: "CANCELADA" }
            : entradaAtual,
        ),
      );
      mostrarMensagem(`Entrada cancelada com sucesso`, "sucesso");
      setEntradaSelecionada(null);
      setAcaoConfirmacao("");
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao cancelar entrada.";
      mostrarMensagem(mensagemErro, "erro");
      setEntradaSelecionada(null);
      setAcaoConfirmacao("");
    }
  };

  const entradasFiltradas = entradas.filter((entrada) => {
    const buscaFormatada = busca.toLowerCase();

    const matchBusca =
      entrada.fornecedorNome.toLowerCase().includes(buscaFormatada) ||
      String(entrada.id).includes(buscaFormatada);

    const matchData = buscaData === "" || entrada.dataEntrada === buscaData;
    return matchBusca && matchData;
  });

  return (
    <div className="gerenciamento-itens-page">
      <div className="gerenciamento-itens-header">
        <h1>Itens da Entrada</h1>
        <p>Gerencie os itens das entradas cadastradas</p>
      </div>
      <div className="gerenciamento-itens-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Fornecedor..."
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
        <button type="button" onClick={() => navigate("/entrada/cadastro")}>
          + Nova Entrada
        </button>
      </div>
      <div className="gerenciamento-itens-card">
        <table className="gerenciamento-itens-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fornecedor</th>
              <th>Almoxarifado</th>
              <th>Data</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {entradasFiltradas.map((entrada) => (
              <tr key={entrada.id}>
                <td>{entrada.id}</td>
                <td>{entrada.fornecedorNome}</td>
                <td>{entrada.almoxarifadoNome}</td>
                <td>{entrada.dataEntrada}</td>
                <td>
                  <span
                    className={`entrada-status ${entrada.status === "ABERTA" ? "entrada-status-open" : entrada.status === "FINALIZADA" ? "entrada-status-finished" : "entrada-status-canceled"}`}
                  >
                    {entrada.status === "ABERTA"
                      ? "Aberta"
                      : entrada.status === "FINALIZADA"
                        ? "Finalizada"
                        : "Cancelada"}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="action-button edit-button"
                    onClick={() => navigate(`/entrada/itens/${entrada.id}`)}
                    title="Gerenciar itens da entrada"
                    aria-label="Gerenciar itens da entrada"
                  >
                    <FiBox />
                  </button>
                  <button
                    type="button"
                    className="action-button finish-button"
                    onClick={() => {
                      setEntradaSelecionada(entrada);
                      setAcaoConfirmacao("finalizar");
                    }}
                    title="Finalizar Entrada"
                    aria-label="Finalizar Entrada"
                  >
                    <FiCheckCircle />
                  </button>
                  <button
                    type="button"
                    className="action-button finish-cancel"
                    onClick={() => {
                      setEntradaSelecionada(entrada);
                      setAcaoConfirmacao("cancelar");
                    }}
                    title="Cancelar Entrada"
                    aria-label="Cancelar Entrada"
                  >
                    <FiSlash />
                  </button>

                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => {
                      setEntradaSelecionada(entrada);
                      setAcaoConfirmacao("excluir");
                    }}
                    title="Excluir entrada"
                    aria-label="Excluir entrada"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {entradaSelecionada && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            {acaoConfirmacao === "finalizar" ? (
              <h2>Finalizar entrada</h2>
            ) : acaoConfirmacao === "cancelar" ? (
              <h2>Cancelar entrada</h2>
            ) : (
              <h2>Excluir entrada</h2>
            )}
            {acaoConfirmacao === "finalizar" ? (
              <p>
                Tem certeza que deseja finalizar{" "}
                <strong>{entradaSelecionada.id}</strong>?
              </p>
            ) : acaoConfirmacao === "cancelar" ? (
              <p>
                Tem certeza que deseja cancelar{" "}
                <strong>{entradaSelecionada.id}</strong>?
              </p>
            ) : (
              <p>
                Tem certeza que deseja excluir{" "}
                <strong>{entradaSelecionada.id}</strong>?
              </p>
            )}

            <div className="confirm-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setEntradaSelecionada(null);
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
                    ? handleFinalizar(entradaSelecionada)
                    : acaoConfirmacao === "cancelar"
                      ? handleCancelar(entradaSelecionada)
                      : handleDelete(entradaSelecionada.id);
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

export default ItensEntrada;
