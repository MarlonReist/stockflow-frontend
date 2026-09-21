import api from "./api";

function criarAjusteManual(ajuste) {
  return api.post("/ajustes-estoque", ajuste);
}

function criarAjustePorConferencia(itemId, motivo) {
  return api.post(`/ajustes-estoque/conferencia-itens/${itemId}`, {
    motivo,
  });
}

function listarAjustes() {
  return api.get("/ajustes-estoque");
}

function buscarAjustePorId(id) {
  return api.get(`/ajustes-estoque/${id}`);
}

export {
  criarAjusteManual,
  criarAjustePorConferencia,
  listarAjustes,
  buscarAjustePorId,
};