import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

function cadastrarOrdemServicoItem(item) {
  return api.post("/itens", item);
}

function listarOrdemServicoItens() {
  return api.get("/itens");
}

function buscarOrdemServicoItemPorId(id) {
  return api.get(`/itens/${id}`);
}

function atualizarOrdemServicoItem(id, item) {
  return api.put(`/itens/${id}`, item);
}

function deletarOrdemServicoItem(id) {
  return api.delete(`/itens/${id}`);
}

export {
  cadastrarOrdemServicoItem,
  listarOrdemServicoItens,
  buscarOrdemServicoItemPorId,
  atualizarOrdemServicoItem,
  deletarOrdemServicoItem,
};