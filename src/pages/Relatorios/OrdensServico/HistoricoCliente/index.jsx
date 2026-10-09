import React, { useEffect, useState } from "react";
import { FiPrinter } from "react-icons/fi";
import CabecalhoRelatorio from "../../../../components/CabecalhoRelatorio";
import { listarClientes } from "../../../../services/clientesService";
import { listarOrdensServico } from "../../../../services/ordemServicoService";
import { listarTiposOrdemServicoAtivos } from "../../../../services/tipoOrdemServicoService";
import SeletorCliente from "../components/SeletorCliente";
import { CabecalhoOrdenavel, PaginacaoRelatorio } from "../components/ControlesTabelaRelatorio";
import { useTabelaRelatorio } from "../components/useTabelaRelatorio";
import "./HistoricoCliente.css";

const formatarDataParametro = (data) => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

const criarFiltrosIniciais = () => {
  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setDate(inicio.getDate() - 29);
  return { clienteId: "", clienteNome: "", dataInicial: formatarDataParametro(inicio), dataFinal: formatarDataParametro(hoje), tipoOrdemServicoId: "" };
};

const formatarData = (valor) =>
  valor ? String(valor).slice(0, 10).split("-").reverse().join("/") : "";

const formatarDataHora = (valor) =>
  valor
    ? new Date(valor).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
    : "—";

const HistoricoCliente = () => {
  const [filtros, setFiltros] = useState(criarFiltrosIniciais);
  const [filtrosAplicados, setFiltrosAplicados] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [carregandoFiltros, setCarregandoFiltros] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const tabela = useTabelaRelatorio(resultado || [], "fimAtendimento", "desc", 10);

  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        const [clientesResponse, tiposResponse] = await Promise.all([
          listarClientes(),
          listarTiposOrdemServicoAtivos(),
        ]);
        setClientes(clientesResponse.data);
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

  const handleSelecionarCliente = (cliente) => {
    setFiltros((atuais) => ({ ...atuais, clienteId: String(cliente.id || ""), clienteNome: cliente.nome || "" }));
    setErro("");
  };

  const handleVisualizar = async (event) => {
    event.preventDefault();

    if (!filtros.clienteId) {
      setErro("Selecione um cliente.");
      return;
    }
    if (!filtros.dataInicial || !filtros.dataFinal) {
      setErro("Informe a data inicial e a data final.");
      return;
    }
    if (filtros.dataInicial > filtros.dataFinal) {
      setErro("A data inicial não pode ser maior que a data final.");
      return;
    }

    setCarregando(true);
    setErro("");
    setResultado(null);

    try {
      const response = await listarOrdensServico();
      const dados = response.data
        .filter((ordem) => ["AGUARDANDO_CONFERENCIA", "FINALIZADA"].includes(ordem.status))
        .filter((ordem) => String(ordem.clienteId) === String(filtros.clienteId))
        .filter((ordem) => !filtros.tipoOrdemServicoId || String(ordem.tipoOrdemServicoId) === String(filtros.tipoOrdemServicoId))
        .filter((ordem) => {
          const conclusao = ordem.fimAtendimento ? String(ordem.fimAtendimento).slice(0, 10) : "";
          return conclusao >= filtros.dataInicial && conclusao <= filtros.dataFinal;
        })
        .sort((a, b) => String(b.fimAtendimento).localeCompare(String(a.fimAtendimento)) || b.id - a.id);

      setResultado(dados);
      setFiltrosAplicados({ ...filtros });
    } catch (error) {
      setErro("Não foi possível carregar o histórico de atendimentos do cliente.");
    } finally {
      setCarregando(false);
    }
  };

  const obterNome = (lista, id, textoPadrao) =>
    lista.find((item) => String(item.id) === String(id))?.nome || textoPadrao;

  const handleImprimir = () => {
    const tituloOriginal = document.title;
    document.title = "Histórico de Atendimentos por Cliente";
    window.print();
    setTimeout(() => { document.title = tituloOriginal; }, 500);
  };

  return (
    <div className="historico-cliente-page">
      <div className="historico-cliente-header">
        <CabecalhoRelatorio titulo="Histórico de Atendimentos por Cliente" descricao="Consulte os serviços concluídos para um cliente e os técnicos envolvidos." voltarPara="/relatorios/tecnicos" textoVoltar="Voltar para relatórios de ordens de serviço" />
      </div>

      <form className="historico-cliente-filtros" onSubmit={handleVisualizar}>
        <div className="historico-cliente-campo historico-cliente-campo--cliente"><label>Cliente</label><SeletorCliente clientes={clientes} clienteId={filtros.clienteId} clienteNome={filtros.clienteNome} onSelecionar={handleSelecionarCliente} disabled={carregandoFiltros} /></div>
        <div className="historico-cliente-campo"><label htmlFor="dataInicial">Concluído a partir de</label><input id="dataInicial" name="dataInicial" type="date" value={filtros.dataInicial} onChange={handleChange} /></div>
        <div className="historico-cliente-campo"><label htmlFor="dataFinal">Concluído até</label><input id="dataFinal" name="dataFinal" type="date" value={filtros.dataFinal} onChange={handleChange} /></div>
        <div className="historico-cliente-campo"><label htmlFor="tipoOrdemServicoId">Tipo de serviço</label><select id="tipoOrdemServicoId" name="tipoOrdemServicoId" value={filtros.tipoOrdemServicoId} onChange={handleChange} disabled={carregandoFiltros}><option value="">Todos os tipos</option>{tipos.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div>
        {erro && <p className="historico-cliente-erro" role="alert">{erro}</p>}
        <div className="historico-cliente-acoes"><button type="submit" disabled={carregandoFiltros || carregando}>{carregando ? "Carregando..." : "Visualizar relatório"}</button></div>
      </form>

      <section className="historico-cliente-resultado">
        <div className="historico-cliente-marca-impressao"><strong>StockFlow</strong><span>Relatório de Ordens de Serviço</span></div>
        <div className="historico-cliente-resultado-header">
          <div>
            <h2>Atendimentos do cliente</h2>
            {filtrosAplicados && <p className="historico-cliente-filtros-impressao">
              Cliente: {filtrosAplicados.clienteNome || obterNome(clientes, filtrosAplicados.clienteId, "Selecionado")}
              {` · Período: ${formatarData(filtrosAplicados.dataInicial)} até ${formatarData(filtrosAplicados.dataFinal)}`}
              {` · Tipo: ${filtrosAplicados.tipoOrdemServicoId ? obterNome(tipos, filtrosAplicados.tipoOrdemServicoId, "Selecionado") : "Todos"}`}
            </p>}
          </div>
          <button type="button" className="historico-cliente-imprimir" onClick={handleImprimir} disabled={!resultado?.length}><FiPrinter /> Imprimir</button>
        </div>

        {resultado === null ? <p className="historico-cliente-vazio">Escolha o cliente e clique em Visualizar relatório.</p> :
          resultado.length === 0 ? <p className="historico-cliente-vazio">Nenhum atendimento foi encontrado para o cliente no período.</p> :
          <><div className="historico-cliente-total">{resultado.length} atendimento(s) encontrado(s)</div><div className="historico-cliente-table-wrapper"><table className="historico-cliente-table">
            <thead><tr><CabecalhoOrdenavel campo="id" ordenacao={tabela.ordenacao} ordenarPor={tabela.ordenarPor}>OS</CabecalhoOrdenavel><CabecalhoOrdenavel campo="tipoOrdemServicoNome" ordenacao={tabela.ordenacao} ordenarPor={tabela.ordenarPor}>Tipo</CabecalhoOrdenavel><CabecalhoOrdenavel campo="colaboradorNome" ordenacao={tabela.ordenacao} ordenarPor={tabela.ordenarPor}>Responsável</CabecalhoOrdenavel><CabecalhoOrdenavel campo="ajudanteNome" ordenacao={tabela.ordenacao} ordenarPor={tabela.ordenarPor}>Ajudante</CabecalhoOrdenavel><CabecalhoOrdenavel campo="fimAtendimento" ordenacao={tabela.ordenacao} ordenarPor={tabela.ordenarPor}>Conclusão</CabecalhoOrdenavel><CabecalhoOrdenavel campo="status" ordenacao={tabela.ordenacao} ordenarPor={tabela.ordenarPor}>Situação</CabecalhoOrdenavel></tr></thead>
            <tbody>{tabela.dadosOrdenados.map((ordem, indice) => <tr key={ordem.id} className={indice < tabela.inicio || indice >= tabela.inicio + 10 ? "relatorio-linha-fora-pagina" : ""}>
              <td>#{ordem.id}</td><td>{ordem.tipoOrdemServicoNome || "—"}</td><td>{ordem.colaboradorNome || "—"}</td><td>{ordem.ajudanteNome || "—"}</td><td>{formatarDataHora(ordem.fimAtendimento)}</td><td>{ordem.status === "FINALIZADA" ? "Finalizada" : "Aguardando conferência"}</td>
            </tr>)}</tbody>
          </table></div><PaginacaoRelatorio {...tabela} /></>}
      </section>
    </div>
  );
};

export default HistoricoCliente;
