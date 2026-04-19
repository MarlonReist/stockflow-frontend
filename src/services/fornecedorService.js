import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

function cadastrarFornecedor(fornecedor) {
  return api.post("/fornecedores", fornecedor);
}

export { cadastrarFornecedor };
