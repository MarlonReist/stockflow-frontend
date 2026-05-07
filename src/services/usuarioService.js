import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});


function cadastrarUsuario(usuario) {
  return api.post("/usuarios", usuario);
}

function listarUsuarios() {
  return api.get("/usuarios");
}

function deletarUsuario(id) {
  return api.delete(`/usuarios/${id}`);
}

function buscarUsuarioPorId(id) {
  return api.get(`/usuarios/${id}`);
}

function atualizarUsuario(id, usuario) {
  return api.put(`/usuarios/${id}`, usuario);
}

function ativarUsuario(id) {
  return api.put(`/usuarios/${id}/ativar`);
}

function desativarUsuario(id) {
  return api.put(`/usuarios/${id}/desativar`);
}

export {
  cadastrarUsuario,
  listarUsuarios,
  deletarUsuario,
  buscarUsuarioPorId,
  atualizarUsuario,
  ativarUsuario,
  desativarUsuario,
};
