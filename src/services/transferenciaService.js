import api from "./api";

const endpoint = "/transferencia_almoxarifado";

function cadastrarTransferencia(transferencia) {
  return api.post(endpoint, transferencia);
}

function listarTransferencias() {
  return api.get(endpoint);
}

function deletarTransferencia(id) {
  return api.delete(`${endpoint}/${id}`);
}

function buscarTransferenciaPorId(id) {
  return api.get(`${endpoint}/${id}`);
}

export {
  cadastrarTransferencia,
  listarTransferencias,
  deletarTransferencia,
  buscarTransferenciaPorId,
};
