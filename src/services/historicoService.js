import api from "./api";

function listarHistoricoMovimentacoes() {
  return api.get("/historico");
}

function buscarHistoricoMovimentacaoPorId(id) {
  return api.get(`/historico/${id}`);
}

function gerarPdfHistoricoMovimentacoes(filtros = {}) {
  const filtrosPreenchidos = {};

  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor) {
      filtrosPreenchidos[chave] = valor;
    }
  });

  return api.get("/historico/pdf", {
    params: filtrosPreenchidos,
    responseType: "blob",
  });
}

export {
  listarHistoricoMovimentacoes,
  buscarHistoricoMovimentacaoPorId,
  gerarPdfHistoricoMovimentacoes,
};
