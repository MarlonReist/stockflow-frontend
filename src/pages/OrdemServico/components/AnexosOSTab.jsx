import React, { useEffect, useRef, useState } from "react";
import { FiDownload, FiEye, FiFile, FiTrash2, FiUpload } from "react-icons/fi";
import {
  buscarArquivoAnexoOrdemServico,
  enviarAnexoOrdemServico,
  excluirAnexoOrdemServico,
  listarAnexosOrdemServico,
} from "../../../services/ordemServicoAnexoService";

const AnexosOSTab = ({ ordemId, mostrarMensagem }) => {
  const [anexos, setAnexos] = useState([]);
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const fileInputRef = useRef(null);
  const tamanhoMaximoArquivo = 10 * 1024 * 1024;

  const carregarAnexos = async () => {
    if (!ordemId) {
      return;
    }

    try {
      const response = await listarAnexosOrdemServico(ordemId);
      setAnexos(response.data);
    } catch (error) {
      mostrarMensagem("Erro ao carregar anexos da OS.", "erro");
    }
  };

  useEffect(() => {
    carregarAnexos();
  }, [ordemId]);

  const extrairMensagemErro = (error, mensagemPadrao) => {
    const data = error.response?.data;

    if (!data) {
      return mensagemPadrao;
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.message) {
      return data.message;
    }

    return mensagemPadrao;
  };

  const getNomeArquivo = (anexo) => {
    return (
      anexo.nomeOriginal ||
      anexo.nomeArquivo ||
      anexo.nome ||
      `Anexo ${anexo.id}`
    );
  };

  const getTipoArquivo = (anexo) => {
    return anexo.tipoArquivo || anexo.contentType || anexo.tipo || "-";
  };

  const getTamanhoArquivo = (anexo) => {
    const tamanho = anexo.tamanho || anexo.tamanhoBytes;

    if (!tamanho) {
      return "-";
    }

    if (tamanho < 1024) {
      return `${tamanho} B`;
    }

    if (tamanho < 1024 * 1024) {
      return `${(tamanho / 1024).toFixed(1)} KB`;
    }

    return `${(tamanho / 1024 / 1024).toFixed(1)} MB`;
  };

  const abrirBlob = (blob, nomeArquivo) => {
    const url = URL.createObjectURL(blob);
    const novaAba = window.open(url, "_blank");

    if (!novaAba) {
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeArquivo;
      link.click();
    }

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const baixarBlob = (blob, nomeArquivo) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = nomeArquivo;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleSelecionarArquivo = (e) => {
    const arquivo = e.target.files?.[0];

    if (!arquivo) {
      setArquivoSelecionado(null);
      return;
    }

    const tiposPermitidos = ["image/jpeg", "image/png", "application/pdf"];
    const tipoPermitido = tiposPermitidos.includes(arquivo.type);

    if (!tipoPermitido) {
      mostrarMensagem("Selecione uma imagem JPG, PNG ou um PDF.", "erro");
      e.target.value = "";
      setArquivoSelecionado(null);
      return;
    }

    if (arquivo.size > tamanhoMaximoArquivo) {
      mostrarMensagem("O arquivo deve ter no maximo 10MB.", "erro");
      e.target.value = "";
      setArquivoSelecionado(null);
      return;
    }

    setArquivoSelecionado(arquivo);
  };

  const handleEnviarAnexo = async () => {
    if (!arquivoSelecionado) {
      mostrarMensagem("Selecione um arquivo antes de enviar.", "erro");
      return;
    }

    try {
      setEnviando(true);

      await enviarAnexoOrdemServico(ordemId, arquivoSelecionado);

      mostrarMensagem("Anexo enviado com sucesso.", "sucesso");
      setArquivoSelecionado(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      carregarAnexos();
    } catch (error) {
      const mensagemErro = extrairMensagemErro(
        error,
        "Erro ao enviar anexo da OS.",
      );

      mostrarMensagem(mensagemErro, "erro");
    } finally {
      setEnviando(false);
    }
  };

  const handleVisualizarAnexo = async (anexo) => {
    try {
      const response = await buscarArquivoAnexoOrdemServico(anexo.id);
      abrirBlob(response.data, getNomeArquivo(anexo));
    } catch (error) {
      mostrarMensagem("Erro ao visualizar anexo.", "erro");
    }
  };

  const handleBaixarAnexo = async (anexo) => {
    try {
      const response = await buscarArquivoAnexoOrdemServico(anexo.id);
      baixarBlob(response.data, getNomeArquivo(anexo));
    } catch (error) {
      mostrarMensagem("Erro ao baixar anexo.", "erro");
    }
  };

  const handleExcluirAnexo = async (anexo) => {
    const confirmar = window.confirm(
      `Deseja excluir o anexo "${getNomeArquivo(anexo)}"?`,
    );

    if (!confirmar) {
      return;
    }

    try {
      await excluirAnexoOrdemServico(anexo.id);

      mostrarMensagem("Anexo excluido com sucesso.", "sucesso");
      carregarAnexos();
    } catch (error) {
      const mensagemErro = extrairMensagemErro(
        error,
        "Erro ao excluir anexo da OS.",
      );

      mostrarMensagem(mensagemErro, "erro");
    }
  };

  return (
    <div className="anexos-os-tab">
      <div className="anexos-os-upload">
        <div className="anexos-os-upload-info">
          <h2>Anexos da OS</h2>
          <p>Envie imagens ou PDFs relacionados a esta ordem de servico.</p>
        </div>

        <div className="anexos-os-upload-controls">
          <label className="anexos-os-file-button">
            <FiFile />
            <span>
              {arquivoSelecionado
                ? arquivoSelecionado.name
                : "Selecionar arquivo"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              capture="environment"
              onChange={handleSelecionarArquivo}
            />
          </label>

          <button
            type="button"
            className="anexos-os-send-button"
            onClick={handleEnviarAnexo}
            disabled={!arquivoSelecionado || enviando}
          >
            <FiUpload />
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>

      <div className="anexos-os-table-wrapper">
        <table className="anexos-os-table">
          <thead>
            <tr>
              <th>Arquivo</th>
              <th>Tipo</th>
              <th>Tamanho</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {anexos.length > 0 ? (
              anexos.map((anexo) => (
                <tr key={anexo.id}>
                  <td>{getNomeArquivo(anexo)}</td>
                  <td>{getTipoArquivo(anexo)}</td>
                  <td>{getTamanhoArquivo(anexo)}</td>
                  <td>
                    <div className="anexos-os-row-actions">
                      <button
                        type="button"
                        onClick={() => handleVisualizarAnexo(anexo)}
                        title="Ver"
                        aria-label="Ver anexo"
                      >
                        <FiEye />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBaixarAnexo(anexo)}
                        title="Baixar"
                        aria-label="Baixar anexo"
                      >
                        <FiDownload />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExcluirAnexo(anexo)}
                        title="Excluir"
                        aria-label="Excluir anexo"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty-state-cell">
                  Nenhum anexo enviado para esta OS.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnexosOSTab;
