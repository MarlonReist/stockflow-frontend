import api from "./api";

function cadastrarOrdemServico(ordemServico) {
  return api.post("/os", ordemServico);
}

function listarOrdensServico() {
  return api.get("/os");
}

function buscarOrdemServicoPorId(id) {
  return api.get(`/os/${id}`);
}

function deletarOrdemServico(id) {
  return api.delete(`/os/${id}`);
}

function atualizarDescricaoOrdemServico(id, ordemServico) {
  return api.put(`/os/${id}/descricao`, ordemServico);
}

function atualizarTipoDaOrdemServico(id, tipoOrdemServico) {
  return api.put(`/os/${id}/tipo`, tipoOrdemServico);
}

function agendarOrdemServico(id, agendamento) {
  return api.patch(`/os/${id}/agendar`, agendamento);
}

function iniciarAtendimentoOrdemServico(id) {
  return api.patch(`/os/${id}/iniciar`);
}

function concluirAtendimentoOrdemServico(id, conclusao) {
  return api.patch(`/os/${id}/concluir-atendimento`, conclusao);
}

function finalizarOrdemServico(id) {
  return api.patch(`/os/${id}/finalizar`);
}

function cancelarOrdemServico(id) {
  return api.patch(`/os/${id}/cancelar`);
}

function gerarPdfOrdemServico(id) {
  return api.get(`/os/${id}/pdf`, {
    responseType: "blob",
  });
}

function gerarPdfProdutosOrdemServico(id) {
  return api.get(`/os/${id}/produtos/pdf`, {
    responseType: "blob",
  });
}

export {
  cadastrarOrdemServico,
  listarOrdensServico,
  buscarOrdemServicoPorId,
  deletarOrdemServico,
  atualizarDescricaoOrdemServico,
  atualizarTipoDaOrdemServico,
  agendarOrdemServico,
  iniciarAtendimentoOrdemServico,
  concluirAtendimentoOrdemServico,
  finalizarOrdemServico,
  cancelarOrdemServico,
  gerarPdfOrdemServico,
  gerarPdfProdutosOrdemServico,
};
