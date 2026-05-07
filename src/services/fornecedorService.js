import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

function cadastrarFornecedor(fornecedor) {
  return api.post("/fornecedores", fornecedor);
}

function listarFornecedores() {
  return api.get("/fornecedores");
}

function deletarFornecedor(id) {
  return api.delete(`/fornecedores/${id}`);
}

function buscarFornecedorPorID(id) {
  return api.get(`/fornecedores/${id}`);
}

function atualizarFornecedor(id, fornecedor) {
  return api.put(`/fornecedores/${id}`, fornecedor);
}

export {
  cadastrarFornecedor,
  listarFornecedores,
  deletarFornecedor,
  buscarFornecedorPorID,
  atualizarFornecedor,
};
