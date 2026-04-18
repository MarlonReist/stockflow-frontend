import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:8080",
})

function cadastrarCategoria(categoria) {
    return api.post("/categorias", categoria)
}

export {cadastrarCategoria}