import React, { useEffect, useState } from "react";
import { FiArchive, FiBox, FiClipboard, FiRepeat } from "react-icons/fi";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  buscarMovimentacoesRecentesDashboard,
  buscarOsPorStatusDashboard,
  buscarResumoDashboard,
} from "../../services/dashboardService";
import "./Dashboard.css";

const Dashboard = () => {
  const [resumo, setResumo] = useState({
    totalProdutos: 0,
    almoxarifadosAtivos: 0,
    osAbertas: 0,
    movimentacoesNoMes: 0,
  });
  const [movimentacoesRecentes, setMovimentacoesRecentes] = useState([]);
  const [osPorStatus, setOsPorStatus] = useState([]);

  useEffect(() => {
    const carregarDadosDashboard = async () => {
      try {
        const [resumoResponse, movimentacoesResponse, osPorStatusResponse] =
          await Promise.all([
            buscarResumoDashboard(),
            buscarMovimentacoesRecentesDashboard(),
            buscarOsPorStatusDashboard(),
          ]);

        setResumo(resumoResponse.data);
        setMovimentacoesRecentes(movimentacoesResponse.data);
        setOsPorStatus(osPorStatusResponse.data);
      } catch (error) {
        console.error("Erro ao carregar dados da dashboard:", error);
      }
    };

    carregarDadosDashboard();
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

  const formatarStatus = (status) => {
    if (status === "ABERTA") {
      return "Abertas";
    }

    if (status === "FINALIZADA") {
      return "Finalizadas";
    }

    if (status === "CANCELADA") {
      return "Canceladas";
    }

    return status || "-";
  };

  const getCorStatus = (status) => {
    if (status === "ABERTA") {
      return "#22c55e";
    }

    if (status === "FINALIZADA") {
      return "#3b82f6";
    }

    if (status === "CANCELADA") {
      return "#ef4444";
    }

    return "#94a3b8";
  };

  const totalOsPorStatus = osPorStatus.reduce(
    (total, item) => total + item.quantidade,
    0,
  );

  const osFinalizadas =
    osPorStatus.find((item) => item.status === "FINALIZADA")?.quantidade || 0;

  const taxaConclusao =
    totalOsPorStatus > 0 ? (osFinalizadas / totalOsPorStatus) * 100 : 0;

  const textoTaxaConclusao =
    totalOsPorStatus > 0
      ? `${osFinalizadas} de ${totalOsPorStatus} ordens foram finalizadas`
      : "Nenhuma ordem de serviço registrada";

  const osPorStatusFormatado = osPorStatus.map((item) => {
    const porcentagem =
      totalOsPorStatus > 0 ? (item.quantidade / totalOsPorStatus) * 100 : 0;

    return {
      ...item,
      label: formatarStatus(item.status),
      cor: getCorStatus(item.status),
      porcentagem,
    };
  });

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
      titulo: "Almoxarifados Ativos",
      valor: resumo.almoxarifadosAtivos,
      icone: FiArchive,
      cor: "blue",
    },
    {
      titulo: "OS Abertas",
      valor: resumo.osAbertas,
      icone: FiClipboard,
      cor: "green",
    },
    {
      titulo: "Movimentações no Mês",
      valor: resumo.movimentacoesNoMes,
      icone: FiRepeat,
      cor: "red",
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Bem-vindo ao StockFlow - Gerencie seu estoque</p>
      </div>

      <div className="dashboard-summary-grid">
        {cardsResumo.map((card) => {
          const Icone = card.icone;

          return (
            <div key={card.titulo} className="dashboard-summary-card">
              <div
                className={`dashboard-summary-icon dashboard-summary-icon-${card.cor}`}
              >
                <Icone />
              </div>

              <strong>{card.valor}</strong>
              <span>{card.titulo}</span>
            </div>
          );
        })}
      </div>

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
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
