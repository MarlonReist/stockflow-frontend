import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

function login(dados) {
  return api.post("/auth/login", dados);
}

function validarConvite(token) {
  return api.get(`/convites/validar?token=${token}`);
}

function ativarConvite(dados) {
  return api.post("/convites/ativar", dados);
}

export { login, validarConvite, ativarConvite };