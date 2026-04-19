import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:8080",
})

function cadastrarColaborador(colaborador) {
    return api.post("/colaboradores", colaborador)
}

export {cadastrarColaborador}