import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:8080",
})

function cadastrarCliente(cliente) {
    return api.post("/clientes", cliente)
}

export {cadastrarCliente}