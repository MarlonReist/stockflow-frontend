import React, { useEffect, useState } from "react";
import { FiAlertTriangle, FiBox, FiClipboard, FiRepeat, FiX } from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import {
  buscarMovimentacoesRecentesDashboard,
  buscarOsPorStatusDashboard,
  buscarResumoDashboard,
} from "../../services/dashboardService";
import {
  listarAlmoxarifadosEstoque,
  listarEstoquesBaixos,
} from "../../services/almoxarifadoEstoqueService";
import { listarAlmoxarifados } from "../../services/almoxarifadoService";
import { listarProdutos } from "../../services/produtoService";
import { listarOrdensServico } from "../../services/ordemServicoService";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [estoquesBaixos, setEstoquesBaixos] = useState([]);
  const [erroEstoqueBaixo, setErroEstoqueBaixo] = useState("");
  const [resumo, setResumo] = useState({
    totalProdutos: 0,
    almoxarifadosAtivos: 0,
    osAbertas: 0,
    movimentacoesNoPeriodo: 0,
    valorTotalEntradasPeriodo: 0,
    valorTotalSaidasPeriodo: 0,
    custoTotalOrdensServicoPeriodo: 0,
  });
  const [movimentacoesRecentes, setMovimentacoesRecentes] = useState([]);
  const [osPorStatus, setOsPorStatus] = useState([]);
  const [periodoSelecionado, setPeriodoSelecionado] = useState("30d");
  const [dataInicioPersonalizada, setDataInicioPersonalizada] = useState("");
  const [dataFimPersonalizada, setDataFimPersonalizada] = useState("");
  const [erroPeriodo, setErroPeriodo] = useState("");
  const [ordensServicoDashboard, setOrdensServicoDashboard] = useState([]);
  const [estoquePorAlmoxarifado, setEstoquePorAlmoxarifado] = useState([]);
  const [carregandoValorizacao, setCarregandoValorizacao] = useState(false);
  const [erroValorizacao, setErroValorizacao] = useState("");
  const [almoxarifadoDetalhado, setAlmoxarifadoDetalhado] = useState(null);

  const usuarioLogado = JSON.parse(
    localStorage.getItem("stockflow_usuario") || "{}",
  );

  const usuarioAdmin = usuarioLogado.perfil === "ADMIN";

  const opcoesPeriodo = [
    { label: "7 dias", value: "7d" },
    { label: "30 dias", value: "30d" },
    { label: "3 meses", value: "3m" },
    { label: "6 meses", value: "6m" },
    { label: "12 meses", value: "12m" },
    { label: "Total", value: "total" },
    { label: "Personalizado", value: "custom" },
  ];

  const formatarMoeda = (valor) => {
    const valorNumerico = Number(valor) || 0;

    return valorNumerico.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarDataParametro = (data) => {
    return data.toISOString().split("T")[0];
  };

  const calcularPeriodoDashboard = () => {
    if (periodoSelecionado === "custom") {
      if (!dataInicioPersonalizada || !dataFimPersonalizada) {
        return null;
      }

      if (dataInicioPersonalizada > dataFimPersonalizada) {
        return null;
      }

      return {
        dataInicio: dataInicioPersonalizada,
        dataFim: dataFimPersonalizada,
      };
    }

    if (periodoSelecionado === "total") {
      return {
        dataInicio: "2000-01-01",
        dataFim: formatarDataParametro(new Date()),
      };
    }

    const dataFim = new Date();
    const dataInicio = new Date();

    if (periodoSelecionado === "7d") {
      dataInicio.setDate(dataFim.getDate() - 7);
    }

    if (periodoSelecionado === "30d") {
      dataInicio.setDate(dataFim.getDate() - 30);
    }

    if (periodoSelecionado === "3m") {
      dataInicio.setMonth(dataFim.getMonth() - 3);
    }

    if (periodoSelecionado === "6m") {
      dataInicio.setMonth(dataFim.getMonth() - 6);
    }

    if (periodoSelecionado === "12m") {
      dataInicio.setMonth(dataFim.getMonth() - 12);
    }

    return {
      dataInicio: formatarDataParametro(dataInicio),
      dataFim: formatarDataParametro(dataFim),
    };
  };

  useEffect(() => {
    const carregarEstoquesBaixos = async () => {
      try {
        const response = await listarEstoquesBaixos();
        setEstoquesBaixos(response.data);
        setErroEstoqueBaixo("");
      } catch (error) {
        setEstoquesBaixos([]);
        setErroEstoqueBaixo(
          error.response?.data?.message ||
            "Não foi possível consultar o estoque baixo.",
        );
      }
    };

    carregarEstoquesBaixos();
  }, []);

  useEffect(() => {
    if (!usuarioAdmin) return;

    const carregarValorizacaoEstoque = async () => {
      setCarregandoValorizacao(true);
      setErroValorizacao("");

      try {
        const [almoxarifadosResponse, estoquesResponse, produtosResponse] =
          await Promise.all([
            listarAlmoxarifados(),
            listarAlmoxarifadosEstoque(),
            listarProdutos(),
          ]);

        const produtosPorId = new Map(
          produtosResponse.data.map((produto) => [Number(produto.id), produto]),
        );

        const estoquesValorizados = estoquesResponse.data.map((item) => {
          const produto = produtosPorId.get(Number(item.produtoId));
          const quantidade = Math.max(0, Number(item.quantidade || 0));
          const precoInformado = produto?.preco;
          const precoConvertido = Number(precoInformado);
          const custoValido =
            precoInformado !== null &&
            precoInformado !== undefined &&
            precoInformado !== "" &&
            Number.isFinite(precoConvertido) &&
            precoConvertido >= 0;
          const custoUnitario = custoValido ? precoConvertido : null;

          return {
            ...item,
            produtoNome: item.produtoNome || produto?.nome || `Produto #${item.produtoId}`,
            quantidade,
            custoUnitario,
            valorTotal: custoUnitario === null ? 0 : quantidade * custoUnitario,
          };
        });

        const dados = almoxarifadosResponse.data.map((almoxarifado) => {
          const produtos = estoquesValorizados.filter(
            (item) => Number(item.almoxarifadoId) === Number(almoxarifado.id),
          );

          return {
            id: almoxarifado.id,
            nome: almoxarifado.nome,
            produtos,
            valorTotal: produtos.reduce(
              (total, produto) => total + produto.valorTotal,
              0,
            ),
          };
        });

        setEstoquePorAlmoxarifado(dados);
      } catch (error) {
        setEstoquePorAlmoxarifado([]);
        setErroValorizacao(
          error.response?.data?.message ||
            "Não foi possível calcular o valor atual do estoque.",
        );
      } finally {
        setCarregandoValorizacao(false);
      }
    };

    carregarValorizacaoEstoque();
  }, [usuarioAdmin]);

  useEffect(() => {
    if (!almoxarifadoDetalhado) return undefined;

    const fecharComEscape = (event) => {
      if (event.key === "Escape") setAlmoxarifadoDetalhado(null);
    };

    document.addEventListener("keydown", fecharComEscape);
    return () => document.removeEventListener("keydown", fecharComEscape);
  }, [almoxarifadoDetalhado]);

  useEffect(() => {
    const carregarDadosDashboard = async () => {
      try {
        const paramsPeriodo = calcularPeriodoDashboard();

        if (!paramsPeriodo) {
          if (
            periodoSelecionado === "custom" &&
            dataInicioPersonalizada &&
            dataFimPersonalizada &&
            dataInicioPersonalizada > dataFimPersonalizada
          ) {
            setErroPeriodo(
              "A data inicial não pode ser maior que a data final.",
            );
          }

          return;
        }

        setErroPeriodo("");

        const [resumoResponse, movimentacoesResponse, osPorStatusResponse] =
          await Promise.all([
            buscarResumoDashboard(paramsPeriodo),
            buscarMovimentacoesRecentesDashboard(paramsPeriodo),
            buscarOsPorStatusDashboard(paramsPeriodo),
          ]);

        setResumo(resumoResponse.data);
        setMovimentacoesRecentes(movimentacoesResponse.data);
        setOsPorStatus(osPorStatusResponse.data);
      } catch (error) {
        console.error("Erro ao carregar dados da dashboard:", error);
      }
    };

    carregarDadosDashboard();
  }, [periodoSelecionado, dataInicioPersonalizada, dataFimPersonalizada]);

  useEffect(() => {
    const carregarOrdensServicoDashboard = async () => {
      try {
        const response = await listarOrdensServico();
        setOrdensServicoDashboard(response.data);
      } catch (error) {
        setOrdensServicoDashboard([]);
      }
    };

    carregarOrdensServicoDashboard();
  }, []);

  const formatarData = (data) => {
    if (!data) {
      return "-";
    }

    return data.split("-").reverse().join("/");
  };

  const formatarTipo = (tipo) => {
    if (tipo === "ENTRADA") {
      return "Entrada";
    }

    if (tipo === "SAIDA") {
      return "Saída";
    }

    return tipo || "-";
  };

  const quantidadePorStatus = (status) =>
    Number(osPorStatus.find((item) => item.status === status)?.quantidade ?? 0);

  const quantidadeEmAberto =
    quantidadePorStatus("ABERTA") +
    quantidadePorStatus("EM_ATENDIMENTO") +
    quantidadePorStatus("AGUARDANDO_CONFERENCIA");

  const quantidadeAgendadas = quantidadePorStatus("AGENDADA");
  const osFinalizadas = quantidadePorStatus("FINALIZADA");

  const totalOsPorStatus =
    quantidadeEmAberto + quantidadeAgendadas + osFinalizadas;

  const taxaConclusao =
    totalOsPorStatus > 0 ? (osFinalizadas / totalOsPorStatus) * 100 : 0;

  const textoTaxaConclusao =
    totalOsPorStatus > 0
      ? `${osFinalizadas} de ${totalOsPorStatus} ordens foram finalizadas`
      : "Nenhuma ordem de serviço registrada";

  const periodoAtendimentos = calcularPeriodoDashboard();

  const atendimentosConcluidosNoPeriodo = periodoAtendimentos
    ? ordensServicoDashboard.filter((ordem) => {
        if (!ordem.fimAtendimento) {
          return false;
        }

        const dataFimAtendimento = String(ordem.fimAtendimento).slice(0, 10);

        return (
          dataFimAtendimento >= periodoAtendimentos.dataInicio &&
          dataFimAtendimento <= periodoAtendimentos.dataFim
        );
      }).length
    : 0;

  const osPorStatusFormatado = [
    {
      status: "EM_ABERTO",
      label: "Em aberto",
      quantidade: quantidadeEmAberto,
      cor: "#f97316",
    },
    {
      status: "AGENDADA",
      label: "Agendadas",
      quantidade: quantidadeAgendadas,
      cor: "#3b82f6",
    },
    {
      status: "FINALIZADA",
      label: "Finalizadas",
      quantidade: osFinalizadas,
      cor: "#22c55e",
    },
  ]
    .filter((item) => item.quantidade > 0)
    .map((item) => ({
      ...item,
      porcentagem:
        totalOsPorStatus > 0 ? (item.quantidade / totalOsPorStatus) * 100 : 0,
    }));

  const dadosGraficoOs = osPorStatusFormatado.map((item) => ({
    name: item.label,
    value: item.quantidade,
    cor: item.cor,
    porcentagem: item.porcentagem,
  }));

  const cardsResumo = [
    {
      titulo: "Total de Produtos",
      valor: resumo.totalProdutos,
      icone: FiBox,
      cor: "purple",
    },
    {
      titulo: "Produtos com estoque baixo",
      valor: estoquesBaixos.length,
      icone: FiAlertTriangle,
      cor: "red",
    },
    {
      titulo: "OS Abertas",
      valor: resumo.osAbertas,
      icone: FiClipboard,
      cor: "green",
    },
    {
      titulo: "Movimentações no Período",
      valor: resumo.movimentacoesNoPeriodo,
      icone: FiRepeat,
      cor: "blue",
    },
  ];

  const cardsGerenciaisAdmin = [
    {
      titulo: "Valor Total em Estoque",
      valor: carregandoValorizacao
        ? "Calculando..."
        : formatarMoeda(
            estoquePorAlmoxarifado.reduce(
              (total, almoxarifado) => total + almoxarifado.valorTotal,
              0,
            ),
          ),
      cor: "purple",
    },
    {
      titulo: "Custo das OS no Período",
      valor: formatarMoeda(resumo.custoTotalOrdensServicoPeriodo),
      cor: "blue",
    },
  ];

  const valorTotalEstoque = estoquePorAlmoxarifado.reduce(
    (total, almoxarifado) => total + almoxarifado.valorTotal,
    0,
  );

  const tooltipValorEstoque = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const almoxarifado = payload[0].payload;

    return (
      <div className="dashboard-stock-tooltip">
        <strong>{almoxarifado.nome}</strong>
        <span>{formatarMoeda(almoxarifado.valorTotal)}</span>
        <small>Clique para ver os produtos</small>
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Bem-vindo ao StockFlow - Gerencie seu estoque</p>
        </div>

        <div className="dashboard-filter-area">
          <div className="dashboard-period-filter">
            {opcoesPeriodo.map((opcao) => (
              <button
                key={opcao.value}
                type="button"
                className={periodoSelecionado === opcao.value ? "active" : ""}
                aria-pressed={periodoSelecionado === opcao.value}
                onClick={() => {
                  setPeriodoSelecionado(opcao.value);
                  setErroPeriodo("");
                }}
              >
                {opcao.label}
              </button>
            ))}
          </div>

          {periodoSelecionado === "custom" && (
            <div className="dashboard-custom-period">
              <label>
                Início
                <input
                  type="date"
                  value={dataInicioPersonalizada}
                  onChange={(e) => setDataInicioPersonalizada(e.target.value)}
                />
              </label>

              <label>
                Fim
                <input
                  type="date"
                  value={dataFimPersonalizada}
                  onChange={(e) => setDataFimPersonalizada(e.target.value)}
                />
              </label>
            </div>
          )}

          {erroPeriodo && (
            <p className="dashboard-period-error" role="alert">
              {erroPeriodo}
            </p>
          )}
        </div>
      </div>

      <div className="dashboard-summary-grid">
        {cardsResumo.map((card) => {
          const Icone = card.icone;

          return (
            <div
              key={card.titulo}
              className={`dashboard-summary-card ${
                card.titulo === "Produtos com estoque baixo"
                  ? "dashboard-summary-card-clickable"
                  : ""
              }`}
              onClick={() => {
                if (card.titulo === "Produtos com estoque baixo") {
                  navigate("/estoque/baixo");
                }
              }}
              role={
                card.titulo === "Produtos com estoque baixo"
                  ? "button"
                  : undefined
              }
              tabIndex={
                card.titulo === "Produtos com estoque baixo" ? 0 : undefined
              }
            >
              <div
                className={`dashboard-summary-icon dashboard-summary-icon-${card.cor}`}
              >
                <Icone />
              </div>

              <strong>{card.valor}</strong>
              <span>{card.titulo}</span>
              {card.titulo === "Produtos com estoque baixo" && (
                <button
                  type="button"
                  className="dashboard-summary-link"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate("/estoque/baixo");
                  }}
                >
                  Ver detalhes
                </button>
              )}
            </div>
          );
        })}
      </div>
      {usuarioAdmin && (
        <section className="dashboard-admin-metrics">
          <div className="dashboard-admin-metrics-header">
            <h2>Indicadores gerenciais</h2>
            <span>Posição atual do estoque e custos do período selecionado</span>
          </div>

          <div className="dashboard-admin-metrics-grid">
            {cardsGerenciaisAdmin.map((card) => (
              <div
                key={card.titulo}
                className={`dashboard-admin-card dashboard-admin-card-${card.cor}`}
              >
                <span>{card.titulo}</span>
                <strong>{card.valor}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      {usuarioAdmin && (
        <section className="dashboard-stock-value-panel">
          <div className="dashboard-panel-header dashboard-stock-value-header">
            <div>
              <h2>Valor do Estoque por Almoxarifado</h2>
              <p>
                Soma das quantidades disponíveis pelo preço de referência de cada produto.
              </p>
            </div>
            <strong>{formatarMoeda(valorTotalEstoque)}</strong>
          </div>

          {carregandoValorizacao ? (
            <p className="dashboard-empty-text">Calculando valorização do estoque...</p>
          ) : erroValorizacao ? (
            <p className="dashboard-stock-error" role="alert">{erroValorizacao}</p>
          ) : estoquePorAlmoxarifado.length === 0 ? (
            <p className="dashboard-empty-text">Nenhum almoxarifado encontrado.</p>
          ) : (
            <div className="dashboard-stock-chart-scroll">
              <div
                className="dashboard-stock-chart"
                style={{ height: Math.max(280, estoquePorAlmoxarifado.length * 58) }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={estoquePorAlmoxarifado}
                    layout="vertical"
                    margin={{ top: 8, right: 34, bottom: 8, left: 12 }}
                  >
                    <CartesianGrid stroke="rgba(148, 163, 184, 0.1)" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(valor) =>
                        Number(valor).toLocaleString("pt-BR", {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        })
                      }
                      stroke="#94a3b8"
                      fontSize={12}
                    />
                    <YAxis
                      type="category"
                      dataKey="nome"
                      width={160}
                      tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 700 }}
                      tickFormatter={(nome) =>
                        nome.length > 22 ? `${nome.slice(0, 20)}…` : nome
                      }
                    />
                    <Tooltip content={tooltipValorEstoque} cursor={{ fill: "rgba(139, 92, 246, 0.08)" }} />
                    <Bar
                      dataKey="valorTotal"
                      fill="#8b5cf6"
                      radius={[0, 8, 8, 0]}
                      minPointSize={3}
                      cursor="pointer"
                      onClick={(dados) =>
                        setAlmoxarifadoDetalhado(dados.payload)
                      }
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>
      )}

      <div className="dashboard-content-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Movimentações Recentes</h2>
          </div>

          <div className="dashboard-list">
            {movimentacoesRecentes.length > 0 ? (
              movimentacoesRecentes.map((movimentacao) => (
                <div key={movimentacao.id} className="dashboard-list-item">
                  <div>
                    <strong>{movimentacao.produtoNome}</strong>
                    <span>
                      {formatarTipo(movimentacao.tipo)} -{" "}
                      {movimentacao.quantidade} unidades
                    </span>
                  </div>

                  <span className="dashboard-list-date">
                    {formatarData(movimentacao.dataMovimentacao)}
                  </span>
                </div>
              ))
            ) : (
              <p className="dashboard-empty-text">
                Nenhuma movimentação recente.
              </p>
            )}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Ordens de Serviço por Status</h2>
          </div>

          <div className="dashboard-donut-content">
            <div className="dashboard-donut-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosGraficoOs}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="88%"
                    paddingAngle={4}
                    stroke="rgba(31, 33, 55, 0.95)"
                    strokeWidth={4}
                  >
                    {dadosGraficoOs.map((item) => (
                      <Cell key={item.name} fill={item.cor} />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value, name) => [`${value} OS`, name]}
                    contentStyle={{
                      backgroundColor: "#1f2137",
                      border: "1px solid rgba(139, 92, 246, 0.25)",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="dashboard-donut-center">
                <strong>{totalOsPorStatus}</strong>
                <span>OS</span>
              </div>
            </div>

            <div className="dashboard-donut-legend">
              {osPorStatusFormatado.length > 0 ? (
                osPorStatusFormatado.map((item) => (
                  <div
                    key={item.status}
                    className="dashboard-donut-legend-item"
                  >
                    <span
                      className="dashboard-donut-color"
                      style={{ backgroundColor: item.cor }}
                    />

                    <div>
                      <strong>{item.label}</strong>
                      <span>
                        {item.quantidade} OS - {item.porcentagem.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="dashboard-empty-text">
                  Nenhuma ordem de serviço encontrada.
                </p>
              )}
            </div>
          </div>

          <div className="dashboard-completion">
            <div className="dashboard-completion-header">
              <strong>Taxa de conclusão</strong>
              <span>{taxaConclusao.toFixed(1)}%</span>
            </div>

            <div className="dashboard-completion-bar">
              <div
                className="dashboard-completion-progress"
                style={{ width: `${taxaConclusao}%` }}
              />
            </div>

            <p>{textoTaxaConclusao}</p>
          </div>

          <div className="dashboard-daily-completions">
            <div>
              <strong>Atendimentos concluídos no período</strong>
              <span>OS com trabalho técnico encerrado no período selecionado.</span>
            </div>

            <strong className="dashboard-daily-completions-value">
              {atendimentosConcluidosNoPeriodo}
            </strong>
          </div>
        </section>
      </div>

      {almoxarifadoDetalhado && (
        <div
          className="dashboard-stock-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setAlmoxarifadoDetalhado(null);
            }
          }}
        >
          <div
            className="dashboard-stock-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-stock-modal-title"
          >
            <div className="dashboard-stock-modal-header">
              <div>
                <span>Detalhamento do estoque</span>
                <h2 id="dashboard-stock-modal-title">
                  {almoxarifadoDetalhado.nome}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Fechar detalhamento"
                onClick={() => setAlmoxarifadoDetalhado(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="dashboard-stock-modal-total">
              <span>Valor total do estoque</span>
              <strong>{formatarMoeda(almoxarifadoDetalhado.valorTotal)}</strong>
            </div>

            <div className="dashboard-stock-table-wrapper">
              <table className="dashboard-stock-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Quantidade disponível</th>
                    <th>Custo unitário</th>
                    <th>Valor total</th>
                  </tr>
                </thead>
                <tbody>
                  {almoxarifadoDetalhado.produtos.length > 0 ? (
                    almoxarifadoDetalhado.produtos.map((produto) => (
                      <tr key={produto.id}>
                        <td>
                          <strong>{produto.produtoNome}</strong>
                          <span>#{produto.produtoId}</span>
                        </td>
                        <td>{produto.quantidade.toLocaleString("pt-BR")}</td>
                        <td>
                          {produto.custoUnitario === null
                            ? "Sem custo cadastrado"
                            : formatarMoeda(produto.custoUnitario)}
                        </td>
                        <td>{formatarMoeda(produto.valorTotal)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="dashboard-stock-table-empty">
                        Este almoxarifado não possui produtos cadastrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
