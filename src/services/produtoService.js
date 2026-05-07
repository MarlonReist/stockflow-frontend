import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});


function cadastrarProduto(produto) {
    return api.post("/produtos", produto)
}

function listarProdutos() {
  return api.get("/produtos");
}

function deletarProduto(id) {
  return api.delete(`/produtos/${id}`);
}

function buscarProdutoPorID(id) {
  return api.get(`/produtos/${id}`);
}

function atualizarProduto(id, produto) {
  return api.put(`/produtos/${id}`, produto);
}

export {cadastrarProduto, listarProdutos, deletarProduto, buscarProdutoPorID, atualizarProduto}