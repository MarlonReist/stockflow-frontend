import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:8080",
})

function cadastrarAlmoxarifado(almoxarifado) {
    return api.post("/almoxarifados", almoxarifado)
}

export {cadastrarAlmoxarifado}