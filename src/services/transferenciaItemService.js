import api from "./api";

function cadastrarTransferenciaItem(transferenciaItem) {
  return api.post("/transferencia_itens", transferenciaItem);
}

function listarTransferenciaItens() {
  return api.get("/transferencia_itens");
}

function deletarTransferenciaItem(id) {
  return api.delete(`/transferencia_itens/${id}`);
}

function buscarTransferenciaItemPorId(id) {
  return api.get(`/transferencia_itens/${id}`);
}

function atualizarTransferenciaItem(id, transferenciaItem) {
  return api.put(`/transferencia_itens/${id}`, transferenciaItem);
}

export {
  cadastrarTransferenciaItem,
  listarTransferenciaItens,
  deletarTransferenciaItem,
  buscarTransferenciaItemPorId,
  atualizarTransferenciaItem,
};
