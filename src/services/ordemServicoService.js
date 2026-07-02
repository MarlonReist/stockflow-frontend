import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

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

export {
  cadastrarOrdemServico,
  listarOrdensServico,
  buscarOrdemServicoPorId,
  deletarOrdemServico,
  atualizarDescricaoOrdemServico,
  finalizarOrdemServico,
  cancelarOrdemServico,
};
