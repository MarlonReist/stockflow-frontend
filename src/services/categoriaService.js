import api from "./api";

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
