import React from "react";
import { formatarTempoAtendimento } from "../../../../../utils/relatoriosTecnicos";
import { CabecalhoOrdenavel } from "../../components/ControlesTabelaRelatorio";
import { useTabelaRelatorio } from "../../components/useTabelaRelatorio";

const nomesStatus = {
  ABERTA: "Aberta",
  AGENDADA: "Agendada",
  EM_ATENDIMENTO: "Em atendimento",
  AGUARDANDO_CONFERENCIA: "Aguardando conferência",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
};

const formatarDataHora = (valor) => {
  if (!valor) {
    return "—";
  }

  return new Date(valor).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const TabelaAtendimentos = ({
  pagina,
  carregando,
  onPaginaAnterior,
  onProximaPagina,
}) => {
  const tabela = useTabelaRelatorio(
    pagina?.content || [],
    "fimAtendimento",
    "desc",
    pagina?.content?.length || 10,
  );

  if (carregando) {
    return (
      <p className="atendimentos-colaborador-vazio" role="status">
        Carregando atendimentos...
      </p>
    );
  }

  if (!pagina) {
    return (
      <p className="atendimentos-colaborador-vazio">
        Preencha os filtros e clique em Visualizar relatório.
      </p>
    );
  }

  if (pagina.content.length === 0) {
    return (
      <p className="atendimentos-colaborador-vazio">
        Nenhum atendimento encontrado para os filtros informados.
      </p>
    );
  }

  return (
    <>
      <div
        className="atendimentos-colaborador-table-wrapper"
        role="region"
        aria-label="Atendimentos do colaborador"
        tabIndex={0}
      >
        <table className="atendimentos-colaborador-table">
          <thead>
            <tr>
              <CabecalhoOrdenavel campo="ordemServicoId" {...tabela}>OS</CabecalhoOrdenavel>
              <CabecalhoOrdenavel campo="clienteNome" {...tabela}>Cliente</CabecalhoOrdenavel>
              <CabecalhoOrdenavel campo="tipoOrdemServicoNome" {...tabela}>Tipo de serviço</CabecalhoOrdenavel>
              <CabecalhoOrdenavel campo="tecnicoResponsavelNome" {...tabela}>Responsável</CabecalhoOrdenavel>
              <CabecalhoOrdenavel campo="tecnicoAjudanteNome" {...tabela}>Ajudante</CabecalhoOrdenavel>
              <CabecalhoOrdenavel campo="participacaoDoTecnico" {...tabela}>Participação</CabecalhoOrdenavel>
              <CabecalhoOrdenavel campo="fimAtendimento" {...tabela}>Conclusão</CabecalhoOrdenavel>
              <CabecalhoOrdenavel campo="duracaoAtendimentoSegundos" {...tabela}>Duração</CabecalhoOrdenavel>
              <CabecalhoOrdenavel campo="statusAtual" {...tabela}>Status atual</CabecalhoOrdenavel>
            </tr>
          </thead>

          <tbody>
            {tabela.dadosOrdenados.map((atendimento) => (
              <tr key={atendimento.ordemServicoId}>
                <td>#{atendimento.ordemServicoId}</td>
                <td>{atendimento.clienteNome || "—"}</td>
                <td>{atendimento.tipoOrdemServicoNome || "—"}</td>
                <td>{atendimento.tecnicoResponsavelNome || "—"}</td>
                <td>{atendimento.tecnicoAjudanteNome || "—"}</td>
                <td>{atendimento.participacaoDoTecnico || "—"}</td>
                <td>{formatarDataHora(atendimento.fimAtendimento)}</td>
                <td>
                  {formatarTempoAtendimento(
                    atendimento.duracaoAtendimentoSegundos,
                  )}
                </td>
                <td>
                  <span className="atendimentos-colaborador-status">
                    {nomesStatus[atendimento.statusAtual] ||
                      atendimento.statusAtual ||
                      "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="atendimentos-colaborador-paginacao">
        <span>{pagina.totalElements} atendimento(s) encontrado(s)</span>

        <div>
          <button
            type="button"
            disabled={pagina.page === 0}
            onClick={onPaginaAnterior}
          >
            Anterior
          </button>

          <span>
            Página {pagina.page + 1} de {pagina.totalPages}
          </span>

          <button
            type="button"
            disabled={pagina.page + 1 >= pagina.totalPages}
            onClick={onProximaPagina}
          >
            Próxima
          </button>
        </div>
      </div>
    </>
  );
};

export default TabelaAtendimentos;
