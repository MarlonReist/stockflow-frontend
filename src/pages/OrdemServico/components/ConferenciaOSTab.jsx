import React from "react";

const formatarDataHora = (valor) => {
  if (!valor) {
    return "-";
  }

  const [data, horario = ""] = String(valor).split("T");
  const [ano, mes, dia] = data.split("-");

  if (!ano || !mes || !dia) {
    return "-";
  }

  const horaMinuto = horario.slice(0, 5);

  return horaMinuto
    ? `${dia}/${mes}/${ano} ${horaMinuto}`
    : `${dia}/${mes}/${ano}`;
};

const ConferenciaOSTab = ({
  ordem,
  cliente,
  abrirProdutos,
  abrirAnexos,
  solicitarFinalizacao,
  finalizando,
}) => {
  return (
    <section className="conferencia-os-tab">
      <header className="conferencia-os-header">
        <div>
          <span className="conferencia-os-eyebrow">
            Conferência administrativa
          </span>

          <h2>Revisão da OS #{ordem.id}</h2>

          <p>
            Confira os dados registrados pelo técnico antes do fechamento
            definitivo.
          </p>
        </div>

        <span className="conferencia-os-status">
          Aguardando conferência
        </span>
      </header>

      <div className="conferencia-os-section">
        <h3>Atendimento</h3>

        <div className="conferencia-os-grid">
          <div>
            <span>Cliente</span>
            <strong>{ordem.clienteNome || "-"}</strong>
          </div>

          <div>
            <span>Telefone</span>
            <strong>{cliente?.telefone || "-"}</strong>
          </div>

          <div className="conferencia-os-wide">
            <span>Endereço</span>
            <strong>{cliente?.endereco || "-"}</strong>
          </div>

          <div>
            <span>Tipo da OS</span>
            <strong>{ordem.tipoOrdemServicoNome || "-"}</strong>
          </div>

          <div>
            <span>Técnico responsável</span>
            <strong>{ordem.colaboradorNome || "-"}</strong>
          </div>

          <div>
            <span>Técnico ajudante</span>
            <strong>{ordem.ajudanteNome || "Nenhum ajudante definido"}</strong>
          </div>
        </div>
      </div>

      <div className="conferencia-os-section">
        <h3>Datas do atendimento</h3>

        <div className="conferencia-os-grid">
          <div>
            <span>Abertura</span>
            <strong>{formatarDataHora(ordem.dataAbertura)}</strong>
          </div>

          <div>
            <span>Agendamento</span>
            <strong>{formatarDataHora(ordem.dataAgendada)}</strong>
          </div>

          <div>
            <span>Início do atendimento</span>
            <strong>{formatarDataHora(ordem.inicioAtendimento)}</strong>
          </div>

          <div>
            <span>Fim do atendimento</span>
            <strong>{formatarDataHora(ordem.fimAtendimento)}</strong>
          </div>

          <div>
            <span>Fechamento administrativo</span>
            <strong>{formatarDataHora(ordem.dataFechamento)}</strong>
          </div>
        </div>
      </div>

      <div className="conferencia-os-section">
        <h3>Relato do serviço</h3>

        <div className="conferencia-os-text">
          <span>Descrição inicial</span>
          <p>{ordem.descricao || "-"}</p>
        </div>

        <div className="conferencia-os-text">
          <span>Observação técnica de conclusão</span>
          <p>{ordem.observacaoConclusao || "Nenhuma observação informada."}</p>
        </div>
      </div>

      <div className="conferencia-os-navigation">
        <button type="button" onClick={abrirProdutos}>
          Conferir produtos
        </button>

        <button type="button" onClick={abrirAnexos}>
          Conferir anexos
        </button>

        <button
          type="button"
          className="conferencia-os-finalize-button"
          onClick={solicitarFinalizacao}
          disabled={finalizando}
        >
          {finalizando ? "Finalizando..." : "Finalizar OS"}
        </button>
      </div>
    </section>
  );
};

export default ConferenciaOSTab;
