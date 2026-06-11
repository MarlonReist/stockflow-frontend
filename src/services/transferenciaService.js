import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

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
