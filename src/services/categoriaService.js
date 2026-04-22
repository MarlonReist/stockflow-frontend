import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:8080",
})

function cadastrarCategoria(categoria) {
  return api.post("/categorias", categoria);
}

function listarCategorias() {
  return api.get("/categorias");
}

function deletarCategoria(id) {
  return api.delete(`/categorias/${id}`);
}

function buscarCategoriaPorID(id) {
  return api.get(`/categorias/${id}`);
}

function atualizarCategoria(id, categoria) {
  return api.put(`/categorias/${id}`, categoria);
}

export { cadastrarCategoria, listarCategorias, deletarCategoria, buscarCategoriaPorID, atualizarCategoria};
