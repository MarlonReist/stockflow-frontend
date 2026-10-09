import React, { useEffect, useState } from "react";
import { FiPrinter } from "react-icons/fi";
import CabecalhoRelatorio from "../../../../components/CabecalhoRelatorio";
import { listarOrdensServico } from "../../../../services/ordemServicoService";
import { listarColaboradores } from "../../../../services/colaboradorService";
import { listarTiposOrdemServicoAtivos } from "../../../../services/tipoOrdemServicoService";
import { CabecalhoOrdenavel, PaginacaoRelatorio } from "../components/ControlesTabelaRelatorio";
import { useTabelaRelatorio } from "../components/useTabelaRelatorio";
import "./Canceladas.css";

const formatarData = (valor) =>
  valor ? String(valor).slice(0, 10).split("-").reverse().join("/") : "";

const formatarDataHora = (valor) => {
  if (!valor) return "—";
  const [data, horario = ""] = String(valor).split("T");
  const [ano, mes, dia] = data.split("-");
  const horaMinuto = horario.slice(0, 5);
  return horaMinuto ? `${dia}/${mes}/${ano} ${horaMinuto}` : `${dia}/${mes}/${ano}`;
};

const Canceladas = () => {
  const [filtros, setFiltros] = useState({ dataInicial: "", dataFinal: "", tecnicoId: "", tipoOrdemServicoId: "" });
  const [filtrosAplicados, setFiltrosAplicados] = useState(null);
  const [colaboradores, setColaboradores] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [carregandoFiltros, setCarregandoFiltros] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const tabela = useTabelaRelatorio(resultado || [], "dataFechamento", "desc", 10);

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
        .filter((ordem) => ordem.status === "CANCELADA")
        .filter((ordem) => !filtros.tecnicoId || String(ordem.colaboradorId) === String(filtros.tecnicoId))
        .filter((ordem) => !filtros.tipoOrdemServicoId || String(ordem.tipoOrdemServicoId) === String(filtros.tipoOrdemServicoId))
        .filter((ordem) => {
          const cancelamento = ordem.dataFechamento ? String(ordem.dataFechamento).slice(0, 10) : "";
          return (!filtros.dataInicial || cancelamento >= filtros.dataInicial) &&
            (!filtros.dataFinal || cancelamento <= filtros.dataFinal);
        })
        .sort((a, b) => String(b.dataFechamento).localeCompare(String(a.dataFechamento)) || b.id - a.id);

      setResultado(dados);
      setFiltrosAplicados({ ...filtros });
    } catch (error) {
      setErro("Não foi possível carregar as ordens de serviço canceladas.");
    } finally {
      setCarregando(false);
    }
  };

  const obterNome = (lista, id, textoTodos) =>
    !id ? textoTodos : lista.find((item) => String(item.id) === String(id))?.nome || "Selecionado";

  const handleImprimir = () => {
    const tituloOriginal = document.title;
    document.title = "Ordens de Serviço Canceladas";
    window.print();
    setTimeout(() => { document.title = tituloOriginal; }, 500);
  };

  return (
    <div className="canceladas-page">
      <div className="canceladas-header">
        <CabecalhoRelatorio titulo="OS Canceladas" descricao="Consulte as ordens canceladas e suas informações de fechamento." voltarPara="/relatorios/tecnicos" textoVoltar="Voltar para relatórios de ordens de serviço" />
      </div>

      <form className="canceladas-filtros" onSubmit={handleVisualizar}>
        <div className="canceladas-campo"><label htmlFor="dataInicial">Cancelada a partir de</label><input id="dataInicial" name="dataInicial" type="date" value={filtros.dataInicial} onChange={handleChange} /></div>
        <div className="canceladas-campo"><label htmlFor="dataFinal">Cancelada até</label><input id="dataFinal" name="dataFinal" type="date" value={filtros.dataFinal} onChange={handleChange} /></div>
        <div className="canceladas-campo"><label htmlFor="tecnicoId">Técnico responsável</label><select id="tecnicoId" name="tecnicoId" value={filtros.tecnicoId} onChange={handleChange} disabled={carregandoFiltros}><option value="">Todos os técnicos</option>{colaboradores.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div>
        <div className="canceladas-campo"><label htmlFor="tipoOrdemServicoId">Tipo de serviço</label><select id="tipoOrdemServicoId" name="tipoOrdemServicoId" value={filtros.tipoOrdemServicoId} onChange={handleChange} disabled={carregandoFiltros}><option value="">Todos os tipos</option>{tipos.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div>
        {erro && <p className="canceladas-erro" role="alert">{erro}</p>}
        <div className="canceladas-acoes"><button type="submit" disabled={carregandoFiltros || carregando}>{carregando ? "Carregando..." : "Visualizar relatório"}</button></div>
      </form>

      <section className="canceladas-resultado">
        <div className="canceladas-marca-impressao"><strong>StockFlow</strong><span>Relatório de Ordens de Serviço</span></div>
        <div className="canceladas-resultado-header">
          <div>
            <h2>Ordens canceladas</h2>
            {filtrosAplicados && <p className="canceladas-filtros-impressao">
              Cancelamento: {formatarData(filtrosAplicados.dataInicial) || "sem início"} até {formatarData(filtrosAplicados.dataFinal) || "hoje"}
              {` · Técnico: ${obterNome(colaboradores, filtrosAplicados.tecnicoId, "Todos")}`}
              {` · Tipo: ${obterNome(tipos, filtrosAplicados.tipoOrdemServicoId, "Todos")}`}
            </p>}
          </div>
          <button type="button" className="canceladas-imprimir" onClick={handleImprimir} disabled={!resultado?.length}><FiPrinter /> Imprimir</button>
        </div>

        {resultado === null ? <p className="canceladas-vazio">Escolha os filtros e clique em Visualizar relatório.</p> :
          resultado.length === 0 ? <p className="canceladas-vazio">Nenhuma ordem de serviço cancelada foi encontrada.</p> :
          <><div className="canceladas-table-wrapper"><table className="canceladas-table">
            <thead><tr><CabecalhoOrdenavel campo="id" {...tabela}>OS</CabecalhoOrdenavel><CabecalhoOrdenavel campo="clienteNome" {...tabela}>Cliente</CabecalhoOrdenavel><CabecalhoOrdenavel campo="tipoOrdemServicoNome" {...tabela}>Tipo</CabecalhoOrdenavel><CabecalhoOrdenavel campo="colaboradorNome" {...tabela}>Responsável</CabecalhoOrdenavel><CabecalhoOrdenavel campo="dataAbertura" {...tabela}>Abertura</CabecalhoOrdenavel><CabecalhoOrdenavel campo="dataFechamento" {...tabela}>Cancelamento</CabecalhoOrdenavel></tr></thead>
            <tbody>{tabela.dadosOrdenados.map((ordem, indice) => <tr key={ordem.id} className={indice < tabela.inicio || indice >= tabela.inicio + 10 ? "relatorio-linha-fora-pagina" : ""}>
              <td>#{ordem.id}</td><td>{ordem.clienteNome || "—"}</td><td>{ordem.tipoOrdemServicoNome || "—"}</td><td>{ordem.colaboradorNome || "—"}</td><td>{formatarData(ordem.dataAbertura) || "—"}</td><td><span className="canceladas-data">{formatarDataHora(ordem.dataFechamento)}</span></td>
            </tr>)}</tbody>
          </table></div><PaginacaoRelatorio {...tabela} /></>}
      </section>
    </div>
  );
};

export default Canceladas;
