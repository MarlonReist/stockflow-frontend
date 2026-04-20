import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:8080",
})

function cadastrarUsuario(usuario) {
    return api.post("/usuarios", usuario)
}

export {cadastrarUsuario}