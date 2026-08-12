import api from "./api";

function buscarMeuPerfil() {
  return api.get("/perfil");
}

function alterarMinhaSenha(payload) {
  return api.put("/perfil/senha", payload);
}

export { buscarMeuPerfil, alterarMinhaSenha };