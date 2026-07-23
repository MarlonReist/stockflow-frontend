import api from "./api";

function login(dados) {
  return api.post("/auth/login", dados);
}

function validarConvite(token) {
  return api.get(`/convites/validar?token=${token}`);
}

function ativarConvite(dados) {
  return api.post("/convites/ativar", dados);
}

function esqueciSenha(dados) {
  return api.post("/auth/esqueci-senha", dados);
}

function validarRecuperacaoSenha(token) {
  return api.get(`/auth/recuperacao-senha/validar?token=${token}`);
}

function redefinirSenha(dados) {
  return api.post("/auth/redefinir-senha", dados);
}

export { login, validarConvite, ativarConvite, esqueciSenha, validarRecuperacaoSenha, redefinirSenha };