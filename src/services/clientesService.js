import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

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

export { cadastrarCliente, listarClientes, deletarCliente, buscarClientePorID, atualizarCliente};
