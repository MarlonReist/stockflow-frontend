import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:8080",
})

function cadastrarProduto(produto) {
    return api.post("/produtos", produto)
}

export {cadastrarProduto}