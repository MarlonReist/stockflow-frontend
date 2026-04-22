import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

function cadastrarAlmoxarifado(almoxarifado) {
  return api.post("/almoxarifados", almoxarifado);
}

function listarAlmoxarifados() {
  return api.get("/almoxarifados");
}

function deletarAlmoxarifado(id) {
  return api.delete(`/almoxarifados/${id}`);
}

function buscarAlmoxarifadoPorID(id) {
  return api.get(`/almoxarifados/${id}`);
}

function atualizarAlmoxarifado(id, almoxarifado) {
  return api.put(`/almoxarifados/${id}`, almoxarifado);
}

export {
  cadastrarAlmoxarifado,
  listarAlmoxarifados,
  deletarAlmoxarifado,
  buscarAlmoxarifadoPorID,
  atualizarAlmoxarifado,
};
