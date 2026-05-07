import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

function cadastrarEntradaItem(entradaItens) {
  return api.post("/entrada_itens", entradaItens);
}

function listarEntradaItens() {
  return api.get("/entrada_itens");
}

function deletarEntradaItem(id) {
  return api.delete(`/entrada_itens/${id}`);
}

function buscarEntradaItemPorId(id) {
  return api.get(`/entrada_itens/${id}`);
}

function atualizarEntradaItem(id, entradaItens) {
  return api.put(`/entrada_itens/${id}`, entradaItens);
}

export {
  cadastrarEntradaItem,
  listarEntradaItens,
  deletarEntradaItem,
  buscarEntradaItemPorId,
  atualizarEntradaItem,
};
