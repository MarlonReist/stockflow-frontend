import api from "./api";

function buscarResumoDashboard() {
  return api.get("/dashboard/resumo");
}

function buscarMovimentacoesRecentesDashboard() {
  return api.get("/dashboard/movimentacoes-recentes");
}

function buscarOsPorStatusDashboard() {
  return api.get("/dashboard/os-por-status");
}

export { buscarResumoDashboard, buscarMovimentacoesRecentesDashboard, buscarOsPorStatusDashboard };
