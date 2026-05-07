import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

function cadastrarSaida(saida) {
  return api.post("/saida_estoque", saida);
}

function listarSaidas() {
  return api.get("/saida_estoque");
}

function deletarSaida(id) {
  return api.delete(`/saida_estoque/${id}`);
}

function buscarSaidaPorId(id) {
  return api.get(`/saida_estoque/${id}`);
}

function atualizarSaida(id, saida) {
  return api.put(`/saida_estoque/${id}`, entrada);
}

function finalizarSaida(id, saida) {
  return api.patch(`/saida_estoque/${id}/finalizar`);
}

function cancelarSaida(id, entrada) {
  return api.patch(`/saida_estoque/${id}/cancelar`);
}

export {
  cadastrarSaida,
  listarSaidas,
  deletarSaida,
  buscarSaidaPorId,
  atualizarSaida,
  finalizarSaida,
  cancelarSaida,
};
