import api from "./api";

function cadastrarCliente(cliente) {
  return api.post("/clientes", cliente);
}

function listarClientes() {
  return api.get("/clientes");
}

function deletarCliente(id) {
  return api.delete(`/clientes/${id}`);
}

function buscarClientePorID(id) {
  return api.get(`/clientes/${id}`);
}

function atualizarCliente(id, cliente) {
  return api.put(`/clientes/${id}`, cliente);
}

function atualizarRoteadorPrincipal(id, roteador) {
  return api.put(`/clientes/${id}/roteador-principal`, roteador);
}

function buscarSugestoesRoteador(texto, limite = 8) {
  return api.get("/clientes/roteador-principal/sugestoes", {
    params: { q: texto, limite },
  });
}

function listarHistoricoRoteador(id) {
  return api.get(`/clientes/${id}/roteador-principal/historico`);
}

export {
  cadastrarCliente,
  listarClientes,
  deletarCliente,
  buscarClientePorID,
  atualizarCliente,
  atualizarRoteadorPrincipal,
  buscarSugestoesRoteador,
  listarHistoricoRoteador,
};
