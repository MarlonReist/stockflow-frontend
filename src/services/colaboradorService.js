import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

function cadastrarColaborador(colaborador) {
  return api.post("/colaboradores", colaborador);
}

function listarColaboradores() {
  return api.get("/colaboradores");
}

function deletarColaborador(id) {
  return api.delete(`/colaboradores/${id}`);
}

function buscarColaboradorPorId(id) {
  return api.get(`/colaboradores/${id}`);
}

function atualizarColaborador(id, colaborador) {
  return api.put(`/colaboradores/${id}`, colaborador);
}

export {
  cadastrarColaborador,
  listarColaboradores,
  deletarColaborador,
  buscarColaboradorPorId,
  atualizarColaborador,
};
