import api from "./api";

function buscarResumoDashboard(params) {
  return api.get("/dashboard/resumo", { params });
}

function buscarMovimentacoesRecentesDashboard(params) {
  return api.get("/dashboard/movimentacoes-recentes", { params });
}

function buscarOsPorStatusDashboard(params) {
  return api.get("/dashboard/os-por-status", { params });
}

export {
  buscarResumoDashboard,
  buscarMovimentacoesRecentesDashboard,
  buscarOsPorStatusDashboard,
};
