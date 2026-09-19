import api from "./api";

function cadastrarTipoOrdemServico(tipoOrdemServico) {
  return api.post("/tipos-os", tipoOrdemServico);
}

function listarTiposOrdemServico() {
  return api.get("/tipos-os");
}

function listarTiposOrdemServicoAtivos() {
  return api.get("/tipos-os/ativos");
}

function buscarTipoOrdemServicoPorId(id) {
  return api.get(`/tipos-os/${id}`);
}

function atualizarTipoOrdemServico(id, tipoOrdemServico) {
  return api.put(`/tipos-os/${id}`, tipoOrdemServico);
}

function ativarTipoOrdemServico(id) {
  return api.patch(`/tipos-os/${id}/ativar`);
}

function desativarTipoOrdemServico(id) {
  return api.patch(`/tipos-os/${id}/desativar`);
}

export {
  cadastrarTipoOrdemServico,
  listarTiposOrdemServico,
  listarTiposOrdemServicoAtivos,
  buscarTipoOrdemServicoPorId,
  atualizarTipoOrdemServico,
  ativarTipoOrdemServico,
  desativarTipoOrdemServico,
};
