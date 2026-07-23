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
  finalizarOrdemServico,
  cancelarOrdemServico,
  gerarPdfOrdemServico,
  gerarPdfProdutosOrdemServico,
};
