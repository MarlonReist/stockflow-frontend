import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:8080",
})

function cadastrarEntrada(entrada) {
    return api.post("/entrada_estoque", entrada)
}

function listarEntradas() {
  return api.get("/entrada_estoque");
}

function deletarEntrada(id) {
  return api.delete(`/entrada_estoque/${id}`);
}

function buscarEntradaPorId(id) {
  return api.get(`/entrada_estoque/${id}`);
}

function atualizarEntrada(id, entrada) {
  return api.put(`/entrada_estoque/${id}`, entrada);
}

export {cadastrarEntrada, listarEntradas, deletarEntrada, buscarEntradaPorId, atualizarEntrada}