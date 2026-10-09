import React, { useEffect, useState } from "react";
import { FiPrinter } from "react-icons/fi";
import CabecalhoRelatorio from "../../../../components/CabecalhoRelatorio";
import { listarOrdensServico } from "../../../../services/ordemServicoService";
import { listarColaboradores } from "../../../../services/colaboradorService";
import { listarTiposOrdemServicoAtivos } from "../../../../services/tipoOrdemServicoService";
import { CabecalhoOrdenavel, PaginacaoRelatorio } from "../components/ControlesTabelaRelatorio";
import { useTabelaRelatorio } from "../components/useTabelaRelatorio";
import "./AguardandoConferencia.css";

const formatarDataHora = (valor) =>
  valor
    ? new Date(valor).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
    : "—";

const formatarData = (valor) =>
  valor ? String(valor).slice(0, 10).split("-").reverse().join("/") : "";

const formatarTempoAguardando = (fimAtendimento) => {
  if (!fimAtendimento) return "—";
  const diferenca = Math.max(0, Date.now() - new Date(fimAtendimento).getTime());
  const horasTotais = Math.floor(diferenca / 3600000);
  const dias = Math.floor(horasTotais / 24);
  const horas = horasTotais % 24;

  if (dias > 0) return `${dias}d ${horas}h`;
  if (horas > 0) return `${horas}h`;
  return "menos de 1h";
};

const AguardandoConferencia = () => {
  const [filtros, setFiltros] = useState({ dataInicial: "", dataFinal: "", tecnicoId: "", tipoOrdemServicoId: "" });
  const [filtrosAplicados, setFiltrosAplicados] = useState(null);
  const [colaboradores, setColaboradores] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [carregandoFiltros, setCarregandoFiltros] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const tabela = useTabelaRelatorio(resultado || [], "fimAtendimento", "asc", 10);

  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        const [colaboradoresResponse, tiposResponse] = await Promise.all([
          listarColaboradores(),
          listarTiposOrdemServicoAtivos(),
        ]);
        setColaboradores(colaboradoresResponse.data);
        setTipos(tiposResponse.data);
      } catch (error) {
        setErro("Não foi possível carregar os filtros do relatório.");
      } finally {
        setCarregandoFiltros(false);
      }
    };
    carregarOpcoes();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFiltros((atuais) => ({ ...atuais, [name]: value }));
    setErro("");
  };

  const handleVisualizar = async (event) => {
    event.preventDefault();
    if (filtros.dataInicial && filtros.dataFinal && filtros.dataInicial > filtros.dataFinal) {
      setErro("A data inicial não pode ser maior que a data final.");
      return;
    }

    setCarregando(true);
    setErro("");
    setResultado(null);

    try {
      const response = await listarOrdensServico();
      const dados = response.data
        .filter((ordem) => ordem.status === "AGUARDANDO_CONFERENCIA")
        .filter((ordem) => !filtros.tecnicoId || String(ordem.colaboradorId) === String(filtros.tecnicoId))
        .filter((ordem) => !filtros.tipoOrdemServicoId || String(ordem.tipoOrdemServicoId) === String(filtros.tipoOrdemServicoId))
        .filter((ordem) => {
          const conclusao = ordem.fimAtendimento ? String(ordem.fimAtendimento).slice(0, 10) : "";
          return (!filtros.dataInicial || conclusao >= filtros.dataInicial) &&
            (!filtros.dataFinal || conclusao <= filtros.dataFinal);
        })
        .sort((a, b) => String(a.fimAtendimento).localeCompare(String(b.fimAtendimento)) || a.id - b.id);

      setResultado(dados);
      setFiltrosAplicados({ ...filtros });
    } catch (error) {
      setErro("Não foi possível carregar os atendimentos aguardando conferência.");
    } finally {
      setCarregando(false);
    }
  };

  const obterNome = (lista, id, textoTodos) =>
    !id ? textoTodos : lista.find((item) => String(item.id) === String(id))?.nome || "Selecionado";

  const handleImprimir = () => {
    const tituloOriginal = document.title;
    document.title = "Atendimentos Aguardando Conferência";
    window.print();
    setTimeout(() => { document.title = tituloOriginal; }, 500);
  };

  return (
    <div className="aguardando-page">
      <div className="aguardando-header">
        <CabecalhoRelatorio
          titulo="Atendimentos Aguardando Conferência"
          descricao="Consulte os atendimentos concluídos que ainda dependem de validação administrativa."
          voltarPara="/relatorios/tecnicos"
          textoVoltar="Voltar para relatórios de ordens de serviço"
        />
      </div>

      <form className="aguardando-filtros" onSubmit={handleVisualizar}>
        <div className="aguardando-campo"><label htmlFor="dataInicial">Concluído a partir de</label><input id="dataInicial" name="dataInicial" type="date" value={filtros.dataInicial} onChange={handleChange} /></div>
        <div className="aguardando-campo"><label htmlFor="dataFinal">Concluído até</label><input id="dataFinal" name="dataFinal" type="date" value={filtros.dataFinal} onChange={handleChange} /></div>
        <div className="aguardando-campo"><label htmlFor="tecnicoId">Técnico responsável</label><select id="tecnicoId" name="tecnicoId" value={filtros.tecnicoId} onChange={handleChange} disabled={carregandoFiltros}><option value="">Todos os técnicos</option>{colaboradores.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div>
        <div className="aguardando-campo"><label htmlFor="tipoOrdemServicoId">Tipo de serviço</label><select id="tipoOrdemServicoId" name="tipoOrdemServicoId" value={filtros.tipoOrdemServicoId} onChange={handleChange} disabled={carregandoFiltros}><option value="">Todos os tipos</option>{tipos.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div>
        {erro && <p className="aguardando-erro" role="alert">{erro}</p>}
        <div className="aguardando-acoes"><button type="submit" disabled={carregandoFiltros || carregando}>{carregando ? "Carregando..." : "Visualizar relatório"}</button></div>
      </form>

      <section className="aguardando-resultado">
        <div className="aguardando-marca-impressao"><strong>StockFlow</strong><span>Relatório de Ordens de Serviço</span></div>
        <div className="aguardando-resultado-header">
          <div>
            <h2>Fila de conferência</h2>
            {filtrosAplicados && <p className="aguardando-filtros-impressao">
              Conclusão: {formatarData(filtrosAplicados.dataInicial) || "sem início"} até {formatarData(filtrosAplicados.dataFinal) || "hoje"}
              {` · Técnico: ${obterNome(colaboradores, filtrosAplicados.tecnicoId, "Todos")}`}
              {` · Tipo: ${obterNome(tipos, filtrosAplicados.tipoOrdemServicoId, "Todos")}`}
            </p>}
          </div>
          <button type="button" className="aguardando-imprimir" onClick={handleImprimir} disabled={!resultado?.length}><FiPrinter /> Imprimir</button>
        </div>

        {resultado === null ? <p className="aguardando-vazio">Escolha os filtros e clique em Visualizar relatório.</p> :
          resultado.length === 0 ? <p className="aguardando-vazio">Nenhum atendimento aguardando conferência.</p> :
          <><div className="aguardando-table-wrapper"><table className="aguardando-table">
            <thead><tr><CabecalhoOrdenavel campo="id" {...tabela}>OS</CabecalhoOrdenavel><CabecalhoOrdenavel campo="clienteNome" {...tabela}>Cliente</CabecalhoOrdenavel><CabecalhoOrdenavel campo="tipoOrdemServicoNome" {...tabela}>Tipo</CabecalhoOrdenavel><CabecalhoOrdenavel campo="colaboradorNome" {...tabela}>Responsável</CabecalhoOrdenavel><CabecalhoOrdenavel campo="ajudanteNome" {...tabela}>Ajudante</CabecalhoOrdenavel><CabecalhoOrdenavel campo="fimAtendimento" {...tabela}>Conclusão técnica</CabecalhoOrdenavel><CabecalhoOrdenavel campo="fimAtendimento" {...tabela}>Tempo aguardando</CabecalhoOrdenavel></tr></thead>
            <tbody>{tabela.dadosOrdenados.map((ordem, indice) => <tr key={ordem.id} className={indice < tabela.inicio || indice >= tabela.inicio + 10 ? "relatorio-linha-fora-pagina" : ""}>
              <td>#{ordem.id}</td><td>{ordem.clienteNome || "—"}</td><td>{ordem.tipoOrdemServicoNome || "—"}</td><td>{ordem.colaboradorNome || "—"}</td><td>{ordem.ajudanteNome || "—"}</td><td>{formatarDataHora(ordem.fimAtendimento)}</td><td><span className="aguardando-tempo">{formatarTempoAguardando(ordem.fimAtendimento)}</span></td>
            </tr>)}</tbody>
          </table></div><PaginacaoRelatorio {...tabela} /></>}
      </section>
    </div>
  );
};

export default AguardandoConferencia;
