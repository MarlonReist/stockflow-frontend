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
import { useNavigate, useParams } from "react-router-dom";
import {
  buscarConferenciaPorId,
  informarQuantidadeContada,
  finalizarConferencia,
} from "../../../../services/conferenciaEstoqueService";
import {
  criarAjustePorConferencia,
  listarAjustes,
} from "../../../../services/ajusteEstoqueService";
import "./Detalhe.css";

const DetalheConferencia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conferencia, setConferencia] = useState(null);
  const [contagens, setContagens] = useState({});
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvandoTodas, setSalvandoTodas] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ordenacao, setOrdenacao] = useState({
    coluna: "produtoNome",
    direcao: "asc",
  });
  const itensPorPagina = 10;
  const [ajustes, setAjustes] = useState([]);
  const [ajustesCarregados, setAjustesCarregados] = useState(false);
  const [itemAjustandoId, setItemAjustandoId] = useState(null);
  const [motivosAjuste, setMotivosAjuste] = useState({});

  const carregarConferencia = async () => {
    setAjustesCarregados(false);
    try {
      const conferenciaResponse = await buscarConferenciaPorId(id);

      setConferencia(conferenciaResponse.data);
      setMensagem("");

      try {
        const ajustesResponse = await listarAjustes();
        setAjustes(
          ajustesResponse.data.filter(
            (ajuste) => Number(ajuste.conferenciaEstoqueId) === Number(id),
          ),
        );
        setAjustesCarregados(true);
      } catch {
        setMensagem("Não foi possível consultar os ajustes existentes. Reabra a conferência para tentar novamente.");
      }
    } catch (error) {
      setMensagem(
        error.response?.data?.message ||
          "Não foi possível carregar a conferência.",
      );
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarConferencia();
  }, [id]);

  const handleContagem = async (itemId) => {
    const valor = contagens[itemId];

    if (valor === undefined || valor === "") {
      setMensagem("Informe uma quantidade contada.");
      return;
    }

    try {
      await informarQuantidadeContada(itemId, valor);
      await carregarConferencia();
      setContagens((valoresAtuais) => ({
        ...valoresAtuais,
        [itemId]: "",
      }));
    } catch (error) {
      setMensagem(
        error.response?.data?.message ||
          "Não foi possível registrar a contagem.",
      );
    }
  };

  const handleFinalizar = async () => {
    try {
      const response = await finalizarConferencia(id);
      setConferencia(response.data);
      setMensagem("");
    } catch (error) {
      setMensagem(
        error.response?.data?.message ||
          "Não foi possível finalizar a conferência.",
      );
    }
  };

  const handleSalvarTodas = async () => {
    const contagensPreenchidas = conferencia.itens.filter(
      (item) => contagens[item.id] !== undefined && contagens[item.id] !== "",
    );

    if (contagensPreenchidas.length === 0) {
      setMensagem("Informe pelo menos uma quantidade contada.");
      return;
    }

    try {
      setSalvandoTodas(true);

      for (const item of contagensPreenchidas) {
        await informarQuantidadeContada(item.id, contagens[item.id]);
      }

      await carregarConferencia();
      setContagens({});
      setMensagem("Contagens salvas com sucesso.");
    } catch (error) {
      setMensagem(
        error.response?.data?.message ||
          "Não foi possível salvar todas as contagens.",
      );
    } finally {
      setSalvandoTodas(false);
    }
  };

  const itemJaAjustado = (itemId) =>
    ajustes.some(
      (ajuste) => Number(ajuste.conferenciaEstoqueItemId) === Number(itemId),
    );

  const handleGerarAjuste = async (itemId) => {
    if (itemAjustandoId !== null || !ajustesCarregados || conferencia?.status !== "FINALIZADA") return;
    const motivo = motivosAjuste[itemId]?.trim();

    if (!motivo) {
      setMensagem("Informe o motivo antes de gerar o ajuste.");
      return;
    }

    if (itemJaAjustado(itemId)) {
      setMensagem("Este item já possui um ajuste.");
      return;
    }

    try {
      setItemAjustandoId(itemId);

      const response = await criarAjustePorConferencia(itemId, motivo);
      setAjustes((atuais) => [...atuais, response.data]);
      await carregarConferencia();

      setMotivosAjuste((valoresAtuais) => ({
        ...valoresAtuais,
        [itemId]: "",
      }));

      setMensagem("Ajuste gerado com sucesso.");
    } catch (error) {
      setMensagem(
        error.response?.data?.message || "Não foi possível gerar o ajuste.",
      );
    } finally {
      setItemAjustandoId(null);
    }
  };

  const handleOrdenar = (coluna) => {
    setOrdenacao((atual) =>
      atual.coluna === coluna
        ? { coluna, direcao: atual.direcao === "asc" ? "desc" : "asc" }
        : { coluna, direcao: "asc" },
    );
    setPaginaAtual(1);
  };

  const itensOrdenados = [...(conferencia?.itens || [])].sort((a, b) => {
    const valorA = a[ordenacao.coluna] ?? "";
    const valorB = b[ordenacao.coluna] ?? "";
    const comparacao =
      typeof valorA === "number" && typeof valorB === "number"
        ? valorA - valorB
        : String(valorA).localeCompare(String(valorB), "pt-BR");

    return ordenacao.direcao === "asc" ? comparacao : -comparacao;
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(itensOrdenados.length / itensPorPagina),
  );
  const paginaLimitada = Math.min(paginaAtual, totalPaginas);
  const indiceInicial = (paginaLimitada - 1) * itensPorPagina;
  const itensPaginados = itensOrdenados.slice(
    indiceInicial,
    indiceInicial + itensPorPagina,
  );

  const indicadorOrdenacao = (coluna) => {
    if (ordenacao.coluna !== coluna) return null;
    return ordenacao.direcao === "asc" ? <FiChevronUp /> : <FiChevronDown />;
  };

  if (carregando) {
    return <div className="detalhe-conferencia-page">Carregando...</div>;
  }

  if (!conferencia) {
    return (
      <div className="detalhe-conferencia-page">
        <p className="detalhe-conferencia-message">{mensagem}</p>
      </div>
    );
  }

  const conferenciaAberta = conferencia.status === "ABERTA";
  const conferenciaFinalizada = conferencia.status === "FINALIZADA";
  const possuiItensPendentes = conferencia.itens.some(
    (item) => item.quantidadeContada === null,
  );

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
    <div className="detalhe-conferencia-page">
      <div className="detalhe-conferencia-header">
        <button type="button" onClick={() => navigate("/estoque/conferencias")}>
          Voltar
        </button>

        <div>
          <h1>Conferência de Estoque</h1>
          <p>
            Almoxarifado: <strong>{conferencia.almoxarifadoNome}</strong>
          </p>
        </div>
      </div>

      <div className="detalhe-conferencia-summary">
        <span>Produtos: {conferencia.totalProdutosConferidos}</span>
        <span>Sem divergência: {conferencia.totalSemDivergencia}</span>
        <span>Com divergência: {conferencia.totalComDivergencia}</span>
        <strong>Status: {conferencia.status}</strong>
      </div>

      {mensagem && <p className="detalhe-conferencia-message">{mensagem}</p>}

      <div className="detalhe-conferencia-card">
        <div className="detalhe-conferencia-table-wrapper">
          <table className="detalhe-conferencia-table">
            <thead>
              <tr>
                <th onClick={() => handleOrdenar("produtoNome")}>
                  Produto {indicadorOrdenacao("produtoNome")}
                </th>
                <th onClick={() => handleOrdenar("quantidadeEsperada")}>
                  Esperado {indicadorOrdenacao("quantidadeEsperada")}
                </th>
                <th onClick={() => handleOrdenar("quantidadeContada")}>
                  Contado {indicadorOrdenacao("quantidadeContada")}
                </th>
                <th onClick={() => handleOrdenar("divergencia")}>
                  Divergência {indicadorOrdenacao("divergencia")}
                </th>
                {(conferenciaAberta || conferenciaFinalizada) && <th>Ação</th>}
              </tr>
            </thead>
            <tbody>
              {itensPaginados.map((item) => (
                <tr key={item.id}>
                  <td>{item.produtoNome}</td>
                  <td>{item.quantidadeEsperada}</td>
                  <td>
                    {conferenciaAberta ? (
                      <input
                        type="number"
                        min="0"
                        value={contagens[item.id] ?? ""}
                        onChange={(event) =>
                          setContagens((valoresAtuais) => ({
                            ...valoresAtuais,
                            [item.id]: event.target.value,
                          }))
                        }
                      />
                    ) : (
                      (item.quantidadeContada ?? "-")
                    )}
                  </td>
                  <td>
                    <span
                      className={`divergencia-badge ${getClasseDivergencia(
                        item.divergencia,
                      )}`}
                    >
                      {formatarDivergencia(item.divergencia)}
                    </span>
                  </td>
                  {(conferenciaAberta || conferenciaFinalizada) && (
                    <td>
                      {conferenciaAberta ? (
                        <button
                          type="button"
                          onClick={() => handleContagem(item.id)}
                        >
                          Salvar contagem
                        </button>
                      ) : !item.possuiDivergencia ? (
                        <span className="ajuste-status sem-divergencia">
                          Sem divergência
                        </span>
                      ) : itemJaAjustado(item.id) ? (
                        <span className="ajuste-status ajustado">Ajustado</span>
                      ) : (
                        <div className="ajuste-conferencia-actions">
                          <input
                            type="text"
                            value={motivosAjuste[item.id] ?? ""}
                            onChange={(event) =>
                              setMotivosAjuste((valoresAtuais) => ({
                                ...valoresAtuais,
                                [item.id]: event.target.value,
                              }))
                            }
                            placeholder="Motivo do ajuste"
                          />

                          <button
                            type="button"
                            onClick={() => handleGerarAjuste(item.id)}
                            disabled={itemAjustandoId !== null || !ajustesCarregados}
                          >
                            {itemAjustandoId === item.id
                              ? "Gerando..."
                              : "Gerar ajuste"}
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="detalhe-conferencia-pagination">
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
            onClick={() => {
              setPaginaAtual(1);
              setOrdenacao({ coluna: "produtoNome", direcao: "asc" });
            }}
          >
            <FiRefreshCw />
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
            {itensOrdenados.length === 0
              ? "0 - 0 / 0"
              : `${indiceInicial + 1} - ${Math.min(indiceInicial + itensPorPagina, itensOrdenados.length)} / ${itensOrdenados.length}`}
          </span>
        </div>

        {conferenciaAberta && (
          <div className="detalhe-conferencia-actions">
            <button
              type="button"
              className="detalhe-conferencia-salvar-todas"
              disabled={salvandoTodas}
              onClick={handleSalvarTodas}
            >
              {salvandoTodas ? "Salvando..." : "Salvar todas as contagens"}
            </button>
            <button
              type="button"
              className="detalhe-conferencia-finalizar"
              disabled={possuiItensPendentes || salvandoTodas}
              onClick={handleFinalizar}
            >
              Finalizar Conferência
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalheConferencia;
