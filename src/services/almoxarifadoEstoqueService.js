import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});


function cadastrarAlmoxarifadoEstoque(almoxarifadoEstoque) {
  return api.post("/estoques", almoxarifadoEstoque);
}

function listarAlmoxarifadosEstoque() {
  return api.get("/estoques");
}

function deletarAlmoxarifadoEstoque(id) {
  return api.delete(`/estoques/${id}`);
}

function buscarAlmoxarifadoEstoquePorID(id) {
  return api.get(`/estoques/${id}`);
}

function atualizarAlmoxarifadoEstoque(id, almoxarifadoEstoque) {
  return api.put(`/estoques/${id}`, almoxarifadoEstoque);
}

export {
  cadastrarAlmoxarifadoEstoque,
  listarAlmoxarifadosEstoque,
  deletarAlmoxarifadoEstoque,
  buscarAlmoxarifadoEstoquePorID,
  atualizarAlmoxarifadoEstoque,
};
