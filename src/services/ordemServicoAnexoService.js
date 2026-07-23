import api from "./api";

function listarAnexosOrdemServico(osId) {
  return api.get(`/os/${osId}/anexos`);
}

function enviarAnexoOrdemServico(osId, arquivo) {
  const formData = new FormData();
  formData.append("arquivo", arquivo);

  return api.post(`/os/${osId}/anexos`, formData);
}

function buscarArquivoAnexoOrdemServico(anexoId) {
  return api.get(`/os/anexos/${anexoId}/arquivo`, {
    responseType: "blob",
  });
}

function excluirAnexoOrdemServico(anexoId) {
  return api.delete(`/os/anexos/${anexoId}`);
}

export {
  listarAnexosOrdemServico,
  enviarAnexoOrdemServico,
  buscarArquivoAnexoOrdemServico,
  excluirAnexoOrdemServico,
};
