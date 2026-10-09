import React, { useEffect, useState } from "react";
import { FiPrinter } from "react-icons/fi";
import CabecalhoRelatorio from "../../../../components/CabecalhoRelatorio";
import { listarAlmoxarifados } from "../../../../services/almoxarifadoService";
import { listarColaboradores } from "../../../../services/colaboradorService";
import { listarOrdemServicoItens } from "../../../../services/ordemServicoItemService";
import { listarOrdensServico } from "../../../../services/ordemServicoService";
import { listarTiposOrdemServicoAtivos } from "../../../../services/tipoOrdemServicoService";
import { CabecalhoOrdenavel, PaginacaoRelatorio } from "../components/ControlesTabelaRelatorio";
import { useTabelaRelatorio } from "../components/useTabelaRelatorio";
import "./MateriaisUtilizados.css";

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
  return { dataInicial: formatarDataParametro(inicio), dataFinal: formatarDataParametro(hoje), tecnicoId: "", tipoOrdemServicoId: "", produto: "" };
};

const formatarDataHora = (valor) => valor
  ? new Date(valor).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
  : "—";

const formatarData = (valor) =>
  valor ? String(valor).slice(0, 10).split("-").reverse().join("/") : "";

const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MateriaisUtilizados = () => {
  const [filtros, setFiltros] = useState(criarFiltrosIniciais);
  const [filtrosAplicados, setFiltrosAplicados] = useState(null);
  const [colaboradores, setColaboradores] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [carregandoFiltros, setCarregandoFiltros] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const tabela = useTabelaRelatorio(resultado || [], "fimAtendimento", "desc", 10);

  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        const [colaboradoresResponse, tiposResponse, almoxarifadosResponse] = await Promise.all([
          listarColaboradores(),
          listarTiposOrdemServicoAtivos(),
          listarAlmoxarifados(),
        ]);
        setColaboradores(colaboradoresResponse.data);
        setTipos(tiposResponse.data);
        setAlmoxarifados(almoxarifadosResponse.data);
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
      const [ordensResponse, itensResponse] = await Promise.all([
        listarOrdensServico(),
        listarOrdemServicoItens(),
      ]);
      const ordens = new Map(ordensResponse.data.map((ordem) => [Number(ordem.id), ordem]));
      const buscaProduto = filtros.produto.trim().toLocaleLowerCase("pt-BR");

      const nomesAlmoxarifados = new Map(
        almoxarifados.map((almoxarifado) => [Number(almoxarifado.id), almoxarifado.nome]),
      );
      const dados = itensResponse.data
        .map((item) => ({ ...item, ...(ordens.get(Number(item.osId)) || {}) , itemId: item.id, osId: item.osId, produtoId: item.produtoId, produtoNome: item.produtoNome, quantidade: item.quantidade, valorUnitario: item.valorUnitario, valorTotal: item.valorTotal, almoxarifadoId: item.almoxarifadoId, almoxarifadoNome: nomesAlmoxarifados.get(Number(item.almoxarifadoId)) || `Almoxarifado #${item.almoxarifadoId}` }))
        .filter((item) => item.fimAtendimento && ["AGUARDANDO_CONFERENCIA", "FINALIZADA"].includes(item.status))
        .filter((item) => String(item.fimAtendimento).slice(0, 10) >= filtros.dataInicial && String(item.fimAtendimento).slice(0, 10) <= filtros.dataFinal)
        .filter((item) => !filtros.tecnicoId || String(item.colaboradorId) === String(filtros.tecnicoId))
        .filter((item) => !filtros.tipoOrdemServicoId || String(item.tipoOrdemServicoId) === String(filtros.tipoOrdemServicoId))
        .filter((item) => !buscaProduto || String(item.produtoId).includes(buscaProduto) || String(item.produtoNome || "").toLocaleLowerCase("pt-BR").includes(buscaProduto));

      setResultado(dados);
      setFiltrosAplicados({ ...filtros });
    } catch (error) {
      setErro("Não foi possível carregar os materiais utilizados nos atendimentos.");
    } finally {
      setCarregando(false);
    }
  };

  const obterNome = (lista, id, textoTodos) =>
    !id ? textoTodos : lista.find((item) => String(item.id) === String(id))?.nome || "Selecionado";

  const totalQuantidade = resultado?.reduce((soma, item) => soma + Number(item.quantidade || 0), 0) || 0;
  const totalValor = resultado?.reduce((soma, item) => soma + Number(item.valorTotal || 0), 0) || 0;

  const handleImprimir = () => {
    const tituloOriginal = document.title;
    document.title = "Materiais Utilizados nos Atendimentos";
    window.print();
    setTimeout(() => { document.title = tituloOriginal; }, 500);
  };

  return (
    <div className="materiais-relatorio-page">
      <div className="materiais-relatorio-header"><CabecalhoRelatorio titulo="Materiais Utilizados nos Atendimentos" descricao="Consulte os produtos e quantidades utilizados nas ordens de serviço concluídas." voltarPara="/relatorios/tecnicos" textoVoltar="Voltar para relatórios de ordens de serviço" /></div>

      <form className="materiais-relatorio-filtros" onSubmit={handleVisualizar}>
        <div className="materiais-relatorio-campo"><label htmlFor="dataInicial">Concluído a partir de</label><input id="dataInicial" name="dataInicial" type="date" value={filtros.dataInicial} onChange={handleChange} /></div>
        <div className="materiais-relatorio-campo"><label htmlFor="dataFinal">Concluído até</label><input id="dataFinal" name="dataFinal" type="date" value={filtros.dataFinal} onChange={handleChange} /></div>
        <div className="materiais-relatorio-campo"><label htmlFor="tecnicoId">Técnico responsável</label><select id="tecnicoId" name="tecnicoId" value={filtros.tecnicoId} onChange={handleChange} disabled={carregandoFiltros}><option value="">Todos os técnicos</option>{colaboradores.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div>
        <div className="materiais-relatorio-campo"><label htmlFor="tipoOrdemServicoId">Tipo de serviço</label><select id="tipoOrdemServicoId" name="tipoOrdemServicoId" value={filtros.tipoOrdemServicoId} onChange={handleChange} disabled={carregandoFiltros}><option value="">Todos os tipos</option>{tipos.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div>
        <div className="materiais-relatorio-campo materiais-relatorio-campo--produto"><label htmlFor="produto">Produto</label><input id="produto" name="produto" type="search" placeholder="Buscar por ID ou nome do produto" value={filtros.produto} onChange={handleChange} /></div>
        {erro && <p className="materiais-relatorio-erro" role="alert">{erro}</p>}
        <div className="materiais-relatorio-acoes"><button type="submit" disabled={carregandoFiltros || carregando}>{carregando ? "Carregando..." : "Visualizar relatório"}</button></div>
      </form>

      <section className="materiais-relatorio-resultado">
        <div className="materiais-relatorio-marca-impressao"><strong>StockFlow</strong><span>Relatório de Ordens de Serviço</span></div>
        <div className="materiais-relatorio-resultado-header"><div><h2>Materiais utilizados</h2>{filtrosAplicados && <p className="materiais-relatorio-filtros-impressao">Período: {formatarData(filtrosAplicados.dataInicial)} até {formatarData(filtrosAplicados.dataFinal)}{` · Técnico: ${obterNome(colaboradores, filtrosAplicados.tecnicoId, "Todos")}`}{` · Tipo: ${obterNome(tipos, filtrosAplicados.tipoOrdemServicoId, "Todos")}`}{filtrosAplicados.produto ? ` · Produto: ${filtrosAplicados.produto}` : ""}</p>}</div><button type="button" className="materiais-relatorio-imprimir" onClick={handleImprimir} disabled={!resultado?.length}><FiPrinter /> Imprimir</button></div>

        {resultado === null ? <p className="materiais-relatorio-vazio">Preencha os filtros e clique em Visualizar relatório.</p> : resultado.length === 0 ? <p className="materiais-relatorio-vazio">Nenhum material utilizado foi encontrado no período.</p> : <>
          <div className="materiais-relatorio-resumo"><div><span>Registros</span><strong>{resultado.length}</strong></div><div><span>Quantidade total</span><strong>{totalQuantidade}</strong></div><div><span>Valor total</span><strong>{formatarMoeda(totalValor)}</strong></div></div>
          <div className="materiais-relatorio-table-wrapper"><table className="materiais-relatorio-table"><thead><tr><CabecalhoOrdenavel campo="osId" {...tabela}>OS</CabecalhoOrdenavel><CabecalhoOrdenavel campo="fimAtendimento" {...tabela}>Conclusão</CabecalhoOrdenavel><CabecalhoOrdenavel campo="clienteNome" {...tabela}>Cliente</CabecalhoOrdenavel><CabecalhoOrdenavel campo="tipoOrdemServicoNome" {...tabela}>Tipo</CabecalhoOrdenavel><CabecalhoOrdenavel campo="produtoNome" {...tabela}>Produto</CabecalhoOrdenavel><CabecalhoOrdenavel campo="quantidade" {...tabela}>Quantidade</CabecalhoOrdenavel><CabecalhoOrdenavel campo="valorUnitario" {...tabela}>Valor unitário</CabecalhoOrdenavel><CabecalhoOrdenavel campo="valorTotal" {...tabela}>Valor total</CabecalhoOrdenavel><CabecalhoOrdenavel campo="almoxarifadoNome" {...tabela}>Almoxarifado</CabecalhoOrdenavel></tr></thead><tbody>{tabela.dadosOrdenados.map((item, indice) => <tr key={item.itemId} className={indice < tabela.inicio || indice >= tabela.inicio + 10 ? "relatorio-linha-fora-pagina" : ""}><td>#{item.osId}</td><td>{formatarDataHora(item.fimAtendimento)}</td><td>{item.clienteNome || "—"}</td><td>{item.tipoOrdemServicoNome || "—"}</td><td>#{item.produtoId} · {item.produtoNome}</td><td>{item.quantidade}</td><td>{formatarMoeda(item.valorUnitario)}</td><td>{formatarMoeda(item.valorTotal)}</td><td>{item.almoxarifadoNome}</td></tr>)}</tbody></table></div>
          <PaginacaoRelatorio {...tabela} />
        </>}
      </section>
    </div>
  );
};

export default MateriaisUtilizados;
