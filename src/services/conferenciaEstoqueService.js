import api from "./api";

function iniciarConferencia(almoxarifadoId) {
  return api.post("/conferencias-estoque", {
    almoxarifadoId: Number(almoxarifadoId),
  });
}

function listarConferencias() {
  return api.get("/conferencias-estoque");
}

function buscarConferenciaPorId(id) {
  return api.get(`/conferencias-estoque/${id}`);
}

function informarQuantidadeContada(itemId, quantidadeContada) {
  return api.put(`/conferencias-estoque/itens/${itemId}/contagem`, {
    quantidadeContada: Number(quantidadeContada),
  });
}

function finalizarConferencia(id) {
  return api.patch(`/conferencias-estoque/${id}/finalizar`);
}

export {
  iniciarConferencia,
  listarConferencias,
  buscarConferenciaPorId,
  informarQuantidadeContada,
  finalizarConferencia,
};