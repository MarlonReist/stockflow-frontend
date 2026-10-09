import api from "./api";

function buscarResumoTecnico(
  { dataInicial, dataFinal, tecnicoId, tipoOrdemServicoId },
  { signal } = {},
) {
  return api.get("/relatorios-tecnicos/resumo", {
    params: { dataInicial, dataFinal, tecnicoId, tipoOrdemServicoId },
    signal,
  });
}

function buscarOsPorTecnicoResponsavel(
  { dataInicial, dataFinal, tecnicoId, tipoOrdemServicoId },
  { signal } = {},
) {
  return api.get("/relatorios-tecnicos/os-por-tecnico", {
    params: { dataInicial, dataFinal, tecnicoId, tipoOrdemServicoId },
    signal,
  });
}

function buscarParticipacoesAjudante(
  { dataInicial, dataFinal, tecnicoId, tipoOrdemServicoId },
  { signal } = {},
) {
  return api.get("/relatorios-tecnicos/participacoes-ajudante", {
    params: { dataInicial, dataFinal, tecnicoId, tipoOrdemServicoId },
    signal,
  });
}

function buscarOsRealizadasTempo(
  { dataInicial, dataFinal, agrupamento, tecnicoId, tipoOrdemServicoId },
  { signal } = {},
) {
  return api.get("/relatorios-tecnicos/os-realizadas-tempo", {
    params: {
      dataInicial,
      dataFinal,
      agrupamento,
      tecnicoId,
      tipoOrdemServicoId,
    },
    signal,
  });
}

function buscarOsPorTipo(
  { dataInicial, dataFinal, tecnicoId },
  { signal } = {},
) {
  return api.get("/relatorios-tecnicos/os-por-tipo", {
    params: { dataInicial, dataFinal, tecnicoId },
    signal,
  });
}

// Fotografia atual do sistema: este endpoint não recebe filtros de período.
function buscarStatusAtualOs({ signal } = {}) {
  return api.get("/relatorios-tecnicos/status-atual", { signal });
}

function buscarAtendimentosTecnicos(params, { signal } = {}) {
  return api.get("/relatorios-tecnicos/atendimentos", {
    params,
    signal,
  });
}

function gerarPdfAtendimentosTecnicos(params) {
  return api.get("/relatorios-tecnicos/atendimentos/pdf", {
    params,
    responseType: "blob",
  });
}

export {
  buscarResumoTecnico,
  buscarOsPorTecnicoResponsavel,
  buscarParticipacoesAjudante,
  buscarOsRealizadasTempo,
  buscarOsPorTipo,
  buscarStatusAtualOs,
  buscarAtendimentosTecnicos,
  gerarPdfAtendimentosTecnicos,
};
