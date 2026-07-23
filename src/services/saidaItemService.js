import api from "./api";

function cadastrarSaidaItem(saidaItens) {
  return api.post("/saida_itens", saidaItens);
}

function listarSaidaItens() {
  return api.get("/saida_itens");
}

function deletarSaidaItem(id) {
  return api.delete(`/saida_itens/${id}`);
}

function buscarSaidaItemPorId(id) {
  return api.get(`/saida_itens/${id}`);
}

function atualizarSaidaItem(id, saidaItens) {
  return api.put(`/saida_itens/${id}`, saidaItens);
}

export {
  cadastrarSaidaItem,
  listarSaidaItens,
  deletarSaidaItem,
  buscarSaidaItemPorId,
  atualizarSaidaItem,
};
