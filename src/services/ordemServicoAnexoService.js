import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

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
