import api from "./api";

function listarUsuarios() {
  return api.get("/usuarios");
}

function bloquearUsuario(id) {
  return api.put(`/usuarios/${id}/bloquear`);
}

function desbloquearUsuario(id) {
  return api.put(`/usuarios/${id}/desbloquear`);
}

function convidarUsuario(usuario) {
  return api.post("/usuarios/convites", usuario);
}

function reenviarConviteUsuario(id) {
  return api.post(`/usuarios/${id}/reenviar-convite`);
}

export {
  listarUsuarios,
  convidarUsuario,
  reenviarConviteUsuario,
  bloquearUsuario,
  desbloquearUsuario,
};
