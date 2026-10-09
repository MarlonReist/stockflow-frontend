import React, { useState } from "react";
import { FiPrinter } from "react-icons/fi";
import CabecalhoRelatorio from "../../../../components/CabecalhoRelatorio";
import { listarOrdensServico } from "../../../../services/ordemServicoService";
import { CabecalhoOrdenavel, PaginacaoRelatorio } from "../components/ControlesTabelaRelatorio";
import { useTabelaRelatorio } from "../components/useTabelaRelatorio";
import "./PendentesAgendadas.css";

const statusPermitidos = ["ABERTA", "AGENDADA", "EM_ATENDIMENTO"];
const nomesStatus = {
  ABERTA: "Aberta",
  AGENDADA: "Agendada",
  EM_ATENDIMENTO: "Em atendimento",
};

const formatarData = (valor) => {
  if (!valor) return "—";
  const apenasData = String(valor).slice(0, 10);
  return apenasData.split("-").reverse().join("/");
};

const formatarDataHora = (valor) =>
  valor
    ? new Date(valor).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";

const PendentesAgendadas = () => {
  const [filtros, setFiltros] = useState({
    status: "TODOS",
    dataInicial: "",
    dataFinal: "",
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const tabela = useTabelaRelatorio(resultado || [], "dataAgendada", "asc", 10);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFiltros((atuais) => ({ ...atuais, [name]: value }));
    setErro("");
  };

  const handleVisualizar = async (event) => {
    event.preventDefault();

    if (
      filtros.dataInicial &&
      filtros.dataFinal &&
      filtros.dataInicial > filtros.dataFinal
    ) {
      setErro("A data inicial não pode ser maior que a data final.");
      return;
    }

    setCarregando(true);
    setErro("");
    setResultado(null);

    try {
      const response = await listarOrdensServico();
      const dados = response.data
        .filter((ordem) => statusPermitidos.includes(ordem.status))
        .filter(
          (ordem) =>
            filtros.status === "TODOS" || ordem.status === filtros.status,
        )
        .filter((ordem) => {
          if (!filtros.dataInicial && !filtros.dataFinal) return true;
          if (!ordem.dataAgendada) return false;

          const dataAgendada = String(ordem.dataAgendada).slice(0, 10);
          const passouInicio =
            !filtros.dataInicial || dataAgendada >= filtros.dataInicial;
          const passouFim =
            !filtros.dataFinal || dataAgendada <= filtros.dataFinal;
          return passouInicio && passouFim;
        })
        .sort((a, b) => {
          const dataA = a.dataAgendada || "9999-12-31";
          const dataB = b.dataAgendada || "9999-12-31";
          return dataA.localeCompare(dataB) || a.id - b.id;
        });

      setResultado(dados);
      setFiltrosAplicados({ ...filtros });
    } catch (error) {
      setErro("Não foi possível carregar as ordens pendentes.");
    } finally {
      setCarregando(false);
    }
  };

  const handleImprimir = () => {
    const tituloOriginal = document.title;
    document.title = "Relatório de OS Pendentes e Agendadas";
    window.print();
    setTimeout(() => {
      document.title = tituloOriginal;
    }, 500);
  };

  return (
    <div className="pendentes-page">
      <div className="pendentes-header">
        <CabecalhoRelatorio
          titulo="OS Pendentes e Agendadas"
          descricao="Consulte as ordens abertas, agendadas ou atualmente em atendimento."
          voltarPara="/relatorios/tecnicos"
          textoVoltar="Voltar para relatórios de ordens de serviço"
        />
      </div>

      <form className="pendentes-filtros" onSubmit={handleVisualizar}>
        <div className="pendentes-campo">
          <label htmlFor="status">Status atual</label>
          <select id="status" name="status" value={filtros.status} onChange={handleChange}>
            <option value="TODOS">Todos os pendentes</option>
            <option value="ABERTA">Aberta</option>
            <option value="AGENDADA">Agendada</option>
            <option value="EM_ATENDIMENTO">Em atendimento</option>
          </select>
        </div>
        <div className="pendentes-campo">
          <label htmlFor="dataInicial">Agendada a partir de</label>
          <input id="dataInicial" name="dataInicial" type="date" value={filtros.dataInicial} onChange={handleChange} />
        </div>
        <div className="pendentes-campo">
          <label htmlFor="dataFinal">Agendada até</label>
          <input id="dataFinal" name="dataFinal" type="date" value={filtros.dataFinal} onChange={handleChange} />
        </div>
        <button type="submit" disabled={carregando}>
          {carregando ? "Carregando..." : "Visualizar relatório"}
        </button>
        {erro && <p className="pendentes-erro" role="alert">{erro}</p>}
      </form>

      <section className="pendentes-resultado">
        <div className="pendentes-marca-impressao">
          <strong>StockFlow</strong><span>Relatório de Ordens de Serviço</span>
        </div>
        <div className="pendentes-resultado-header">
          <div>
            <h2>Ordens pendentes</h2>
            {filtrosAplicados && (
              <p className="pendentes-filtros-impressao">
                Status: {filtrosAplicados.status === "TODOS" ? "Todos" : nomesStatus[filtrosAplicados.status]}
                {filtrosAplicados.dataInicial ? ` · Agendada a partir de ${formatarData(filtrosAplicados.dataInicial)}` : ""}
                {filtrosAplicados.dataFinal ? ` · Agendada até ${formatarData(filtrosAplicados.dataFinal)}` : ""}
              </p>
            )}
          </div>
          <button type="button" className="pendentes-imprimir" onClick={handleImprimir} disabled={!resultado?.length}>
            <FiPrinter /> Imprimir
          </button>
        </div>

        {resultado === null ? (
          <p className="pendentes-vazio">Escolha os filtros e clique em Visualizar relatório.</p>
        ) : resultado.length === 0 ? (
          <p className="pendentes-vazio">Nenhuma ordem pendente encontrada.</p>
        ) : (
          <>
          <div className="pendentes-table-wrapper">
            <table className="pendentes-table">
              <thead><tr><CabecalhoOrdenavel campo="id" {...tabela}>OS</CabecalhoOrdenavel><CabecalhoOrdenavel campo="clienteNome" {...tabela}>Cliente</CabecalhoOrdenavel><CabecalhoOrdenavel campo="tipoOrdemServicoNome" {...tabela}>Tipo</CabecalhoOrdenavel><CabecalhoOrdenavel campo="colaboradorNome" {...tabela}>Responsável</CabecalhoOrdenavel><CabecalhoOrdenavel campo="dataAbertura" {...tabela}>Abertura</CabecalhoOrdenavel><CabecalhoOrdenavel campo="dataAgendada" {...tabela}>Agendamento</CabecalhoOrdenavel><CabecalhoOrdenavel campo="status" {...tabela}>Status atual</CabecalhoOrdenavel></tr></thead>
              <tbody>
                {tabela.dadosOrdenados.map((ordem, indice) => (
                  <tr key={ordem.id} className={indice < tabela.inicio || indice >= tabela.inicio + 10 ? "relatorio-linha-fora-pagina" : ""}>
                    <td>#{ordem.id}</td>
                    <td>{ordem.clienteNome || "—"}</td>
                    <td>{ordem.tipoOrdemServicoNome || "—"}</td>
                    <td>{ordem.colaboradorNome || "—"}</td>
                    <td>{formatarData(ordem.dataAbertura)}</td>
                    <td>{formatarDataHora(ordem.dataAgendada)}</td>
                    <td><span className={`pendentes-status pendentes-status-${ordem.status.toLowerCase().replaceAll("_", "-")}`}>{nomesStatus[ordem.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginacaoRelatorio {...tabela} />
          </>
        )}
      </section>
    </div>
  );
};

export default PendentesAgendadas;
