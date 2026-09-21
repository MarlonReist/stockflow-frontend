import React, { useEffect, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronsLeft,
  FiChevronsRight,
  FiRefreshCw,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  iniciarConferencia,
  listarConferencias,
} from "../../../services/conferenciaEstoqueService";
import { listarAlmoxarifados } from "../../../services/almoxarifadoService";
import "./Conferencia.css";

const Conferencia = () => {
  const [conferencias, setConferencias] = useState([]);
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [almoxarifadoId, setAlmoxarifadoId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [buscaData, setBuscaData] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ordenacao, setOrdenacao] = useState({ coluna: "id", direcao: "asc" });
  const itensPorPagina = 10;
  const navigate = useNavigate();

  const carregarDados = async () => {
    try {
      const [conferenciasResponse, almoxarifadosResponse] = await Promise.all([
        listarConferencias(),
        listarAlmoxarifados(),
      ]);

      setConferencias(conferenciasResponse.data);
      setAlmoxarifados(almoxarifadosResponse.data);
      setMensagem("");
    } catch (error) {
      setMensagem(
        error.response?.data?.message ||
          "Não foi possível carregar as conferências.",
      );
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleIniciar = async (event) => {
    event.preventDefault();

    if (!almoxarifadoId) {
      setMensagem("Selecione um almoxarifado.");
      return;
    }

    try {
      setCarregando(true);

      const response = await iniciarConferencia(almoxarifadoId);

      navigate(`/estoque/conferencias/${response.data.id}`);
    } catch (error) {
      setMensagem(
        error.response?.data?.message ||
          "Não foi possível iniciar a conferência.",
      );
    } finally {
      setCarregando(false);
    }
  };

  const formatarData = (data) => {
    if (!data) {
      return "-";
    }

    return new Date(data).toLocaleString("pt-BR");
  };

  const handleOrdenar = (coluna) => {
    setOrdenacao((atual) =>
      atual.coluna === coluna
        ? { coluna, direcao: atual.direcao === "asc" ? "desc" : "asc" }
        : { coluna, direcao: "asc" },
    );
    setPaginaAtual(1);
  };

  const conferenciasOrdenadas = [...conferencias]
    .filter(
      (conferencia) =>
        !buscaData ||
        String(conferencia.dataHoraInicio || "").slice(0, 10) === buscaData,
    )
    .sort((a, b) => {
      const valorA = a[ordenacao.coluna] ?? "";
      const valorB = b[ordenacao.coluna] ?? "";
      const resultado =
        ordenacao.coluna === "id"
          ? Number(valorA) - Number(valorB)
          : String(valorA).localeCompare(String(valorB), "pt-BR");
      return ordenacao.direcao === "asc" ? resultado : -resultado;
    });
  const totalPaginas = Math.max(
    1,
    Math.ceil(conferenciasOrdenadas.length / itensPorPagina),
  );
  const paginaLimitada = Math.min(paginaAtual, totalPaginas);
  const indiceInicial = (paginaLimitada - 1) * itensPorPagina;
  const conferenciasPaginadas = conferenciasOrdenadas.slice(
    indiceInicial,
    indiceInicial + itensPorPagina,
  );
  const indicadorOrdenacao = (coluna) =>
    ordenacao.coluna === coluna ? (
      ordenacao.direcao === "asc" ? (
        <FiChevronUp />
      ) : (
        <FiChevronDown />
      )
    ) : null;

  const getClasseDivergencia = (divergencia) => {
    if (divergencia > 0) return "divergencia-positiva";
    if (divergencia < 0) return "divergencia-negativa";
    return "divergencia-zero";
  };

  const formatarDivergencia = (divergencia) => {
    if (divergencia === null || divergencia === undefined) return "-";
    return divergencia > 0 ? `+${divergencia}` : divergencia;
  };

  return (
    <div className="conferencia-page">
      <div className="conferencia-header">
        <h1>Conferência de Estoque</h1>
        <p>Confira os saldos físicos dos almoxarifados.</p>
      </div>

      <div className="conferencia-card">
        <h2>Iniciar nova conferência</h2>

        <form onSubmit={handleIniciar} className="conferencia-form">
          <select
            value={almoxarifadoId}
            onChange={(event) => setAlmoxarifadoId(event.target.value)}
          >
            <option value="">Selecione o almoxarifado</option>
            {almoxarifados.map((almoxarifado) => (
              <option key={almoxarifado.id} value={almoxarifado.id}>
                {almoxarifado.nome}
              </option>
            ))}
          </select>

          <button type="submit" disabled={carregando}>
            {carregando ? "Iniciando..." : "Iniciar conferência"}
          </button>
        </form>
      </div>

      {mensagem && <p className="conferencia-message">{mensagem}</p>}

      <div className="conferencia-card">
        <h2>Conferências realizadas</h2>

        <div className="conferencia-list-toolbar">
          <input
            type="date"
            value={buscaData}
            onChange={(event) => {
              setBuscaData(event.target.value);
              setPaginaAtual(1);
            }}
          />
          <button
            type="button"
            onClick={() => {
              setBuscaData("");
              setPaginaAtual(1);
            }}
          >
            <FiRefreshCw />
          </button>
        </div>

        {conferenciasOrdenadas.length === 0 ? (
          <p>Nenhuma conferência encontrada.</p>
        ) : (
          <div className="conferencia-table-wrapper">
            <table className="conferencia-table">
              <thead>
                <tr>
                  <th onClick={() => handleOrdenar("id")}>
                    ID {indicadorOrdenacao("id")}
                  </th>
                  <th onClick={() => handleOrdenar("almoxarifadoNome")}>
                    Almoxarifado {indicadorOrdenacao("almoxarifadoNome")}
                  </th>
                  <th onClick={() => handleOrdenar("dataHoraInicio")}>
                    Início {indicadorOrdenacao("dataHoraInicio")}
                  </th>
                  <th onClick={() => handleOrdenar("status")}>
                    Status {indicadorOrdenacao("status")}
                  </th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {conferenciasPaginadas.map((conferencia) => (
                  <tr key={conferencia.id}>
                    <td>{conferencia.id}</td>
                    <td>{conferencia.almoxarifadoNome}</td>
                    <td>{formatarData(conferencia.dataHoraInicio)}</td>
                    <td>{conferencia.status}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/estoque/conferencias/${conferencia.id}`)
                        }
                      >
                        Abrir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="conferencia-pagination">
          <button
            type="button"
            onClick={() => setPaginaAtual(1)}
            disabled={paginaLimitada === 1}
          >
            <FiChevronsLeft />
          </button>
          <button
            type="button"
            onClick={() => setPaginaAtual((pagina) => Math.max(1, pagina - 1))}
            disabled={paginaLimitada === 1}
          >
            <FiChevronLeft />
          </button>
          <button
            type="button"
            onClick={() =>
              setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1))
            }
            disabled={paginaLimitada === totalPaginas}
          >
            <FiChevronRight />
          </button>
          <button
            type="button"
            onClick={() => setPaginaAtual(totalPaginas)}
            disabled={paginaLimitada === totalPaginas}
          >
            <FiChevronsRight />
          </button>
          <span>
            {conferenciasOrdenadas.length === 0
              ? "0 - 0 / 0"
              : `${indiceInicial + 1} - ${Math.min(indiceInicial + itensPorPagina, conferenciasOrdenadas.length)} / ${conferenciasOrdenadas.length}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Conferencia;
