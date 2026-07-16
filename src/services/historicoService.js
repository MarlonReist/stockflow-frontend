import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

function listarHistoricoMovimentacoes() {
  return api.get("/historico");
}

function buscarHistoricoMovimentacaoPorId(id) {
  return api.get(`/historico/${id}`);
}

function gerarPdfHistoricoMovimentacoes(filtros = {}) {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor) {
      params.append(chave, valor);
    }
  });

  const queryString = params.toString();
  const url = `${import.meta.env.VITE_BASE_URL}/historico/pdf${
    queryString ? `?${queryString}` : ""
  }`;

  window.open(url, "_blank", "noopener,noreferrer");
}

export {
  listarHistoricoMovimentacoes,
  buscarHistoricoMovimentacaoPorId,
  gerarPdfHistoricoMovimentacoes,
};
