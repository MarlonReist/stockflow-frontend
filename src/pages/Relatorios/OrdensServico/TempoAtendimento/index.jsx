import React, { useEffect, useState } from "react";
import { FiPrinter } from "react-icons/fi";
import CabecalhoRelatorio from "../../../../components/CabecalhoRelatorio";
import { listarColaboradores } from "../../../../services/colaboradorService";
import { listarTiposOrdemServicoAtivos } from "../../../../services/tipoOrdemServicoService";
import {
  buscarAtendimentosTecnicos,
  gerarPdfAtendimentosTecnicos,
} from "../../../../services/relatorioTecnicoService";
import { formatarTempoAtendimento } from "../../../../utils/relatoriosTecnicos";
import { CabecalhoOrdenavel } from "../components/ControlesTabelaRelatorio";
import { useTabelaRelatorio } from "../components/useTabelaRelatorio";
import "./TempoAtendimento.css";

const formatarDataParametro = (data) => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

const formatarDataHora = (valor) =>
  valor
    ? new Date(valor).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";

const criarFiltrosIniciais = () => {
  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setDate(inicio.getDate() - 29);

  return {
    dataInicial: formatarDataParametro(inicio),
    dataFinal: formatarDataParametro(hoje),
    tecnicoId: "",
    tipoOrdemServicoId: "",
  };
};

const TempoAtendimento = () => {
  const [filtros, setFiltros] = useState(criarFiltrosIniciais);
  const [filtrosAplicados, setFiltrosAplicados] = useState(null);
  const [colaboradores, setColaboradores] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [pagina, setPagina] = useState(null);
  const [carregandoFiltros, setCarregandoFiltros] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [imprimindo, setImprimindo] = useState(false);
  const [erro, setErro] = useState("");
  const tabela = useTabelaRelatorio(
    pagina?.content || [],
    "fimAtendimento",
    "desc",
    pagina?.content?.length || 10,
  );

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

  const montarParametros = (valores, page = 0) => ({
    dataInicial: valores.dataInicial,
    dataFinal: valores.dataFinal,
    tecnicoId: valores.tecnicoId || undefined,
    tipoOrdemServicoId: valores.tipoOrdemServicoId || undefined,
    participacao: "RESPONSAVEL",
    page,
    size: 10,
  });

  const consultar = async (valores, page = 0) => {
    setCarregando(true);
    setErro("");

    try {
      const response = await buscarAtendimentosTecnicos(
        montarParametros(valores, page),
      );
      setPagina(response.data);
    } catch (error) {
      setPagina(null);
      setErro(
        error.response?.status === 400
          ? "Confira o período informado."
          : "Não foi possível carregar os tempos de atendimento.",
      );
    } finally {
      setCarregando(false);
    }
  };

  const handleVisualizar = (event) => {
    event.preventDefault();

    if (!filtros.dataInicial || !filtros.dataFinal) {
      setErro("Informe a data inicial e a data final.");
      return;
    }
    if (filtros.dataInicial > filtros.dataFinal) {
      setErro("A data inicial não pode ser maior que a data final.");
      return;
    }

    const aplicados = { ...filtros };
    setFiltrosAplicados(aplicados);
    consultar(aplicados, 0);
  };

  const handleImprimir = async () => {
    if (!filtrosAplicados) return;
    setImprimindo(true);
    setErro("");

    try {
      const response = await gerarPdfAtendimentosTecnicos({
        dataInicial: filtrosAplicados.dataInicial,
        dataFinal: filtrosAplicados.dataFinal,
        tecnicoId: filtrosAplicados.tecnicoId || undefined,
        tipoOrdemServicoId:
          filtrosAplicados.tipoOrdemServicoId || undefined,
        participacao: "RESPONSAVEL",
      });
      const url = URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      const janela = window.open(url, "_blank");
      if (!janela) {
        URL.revokeObjectURL(url);
        setErro("Permita pop-ups para abrir o relatório.");
        return;
      }
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      setErro("Não foi possível gerar o PDF.");
    } finally {
      setImprimindo(false);
    }
  };

  return (
    <div className="tempo-atendimento-page">
      <div className="tempo-atendimento-header">
        <CabecalhoRelatorio
          titulo="Tempo de Atendimento"
          descricao="Consulte o início, a conclusão e a duração registrada de cada atendimento."
          voltarPara="/relatorios/tecnicos"
          textoVoltar="Voltar para relatórios de ordens de serviço"
        />
      </div>

      <form className="tempo-atendimento-filtros" onSubmit={handleVisualizar}>
        <div className="tempo-atendimento-campo">
          <label htmlFor="dataInicial">Data inicial</label>
          <input id="dataInicial" name="dataInicial" type="date" value={filtros.dataInicial} onChange={handleChange} required />
        </div>
        <div className="tempo-atendimento-campo">
          <label htmlFor="dataFinal">Data final</label>
          <input id="dataFinal" name="dataFinal" type="date" value={filtros.dataFinal} onChange={handleChange} required />
        </div>
        <div className="tempo-atendimento-campo">
          <label htmlFor="tecnicoId">Técnico responsável</label>
          <select id="tecnicoId" name="tecnicoId" value={filtros.tecnicoId} onChange={handleChange} disabled={carregandoFiltros}>
            <option value="">Todos os técnicos</option>
            {colaboradores.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
          </select>
        </div>
        <div className="tempo-atendimento-campo">
          <label htmlFor="tipoOrdemServicoId">Tipo de serviço</label>
          <select id="tipoOrdemServicoId" name="tipoOrdemServicoId" value={filtros.tipoOrdemServicoId} onChange={handleChange} disabled={carregandoFiltros}>
            <option value="">Todos os tipos</option>
            {tipos.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
          </select>
        </div>
        {erro && <p className="tempo-atendimento-erro" role="alert">{erro}</p>}
        <div className="tempo-atendimento-acoes">
          <button type="submit" disabled={carregandoFiltros || carregando}>
            {carregando ? "Carregando..." : "Visualizar relatório"}
          </button>
        </div>
      </form>

      <section className="tempo-atendimento-resultado">
        <div className="tempo-atendimento-resultado-header">
          <h2>Tempos registrados</h2>
          <button type="button" className="tempo-atendimento-imprimir" onClick={handleImprimir} disabled={!pagina?.content?.length || imprimindo}>
            <FiPrinter /> {imprimindo ? "Gerando..." : "Imprimir"}
          </button>
        </div>

        {carregando ? (
          <p className="tempo-atendimento-vazio">Carregando atendimentos...</p>
        ) : !pagina ? (
          <p className="tempo-atendimento-vazio">Preencha os filtros e clique em Visualizar relatório.</p>
        ) : pagina.content.length === 0 ? (
          <p className="tempo-atendimento-vazio">Nenhum atendimento encontrado.</p>
        ) : (
          <>
            <div className="tempo-atendimento-table-wrapper">
              <table className="tempo-atendimento-table">
                <thead><tr><CabecalhoOrdenavel campo="ordemServicoId" {...tabela}>OS</CabecalhoOrdenavel><CabecalhoOrdenavel campo="tipoOrdemServicoNome" {...tabela}>Tipo</CabecalhoOrdenavel><CabecalhoOrdenavel campo="tecnicoResponsavelNome" {...tabela}>Técnico responsável</CabecalhoOrdenavel><CabecalhoOrdenavel campo="inicioAtendimento" {...tabela}>Início</CabecalhoOrdenavel><CabecalhoOrdenavel campo="fimAtendimento" {...tabela}>Conclusão</CabecalhoOrdenavel><CabecalhoOrdenavel campo="duracaoAtendimentoSegundos" {...tabela}>Duração</CabecalhoOrdenavel></tr></thead>
                <tbody>
                  {tabela.dadosOrdenados.map((item) => (
                    <tr key={item.ordemServicoId}>
                      <td>#{item.ordemServicoId}</td>
                      <td>{item.tipoOrdemServicoNome || "—"}</td>
                      <td>{item.tecnicoResponsavelNome || "—"}</td>
                      <td>{formatarDataHora(item.inicioAtendimento)}</td>
                      <td>{formatarDataHora(item.fimAtendimento)}</td>
                      <td>{formatarTempoAtendimento(item.duracaoAtendimentoSegundos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tempo-atendimento-paginacao">
              <span>{pagina.totalElements} atendimento(s)</span>
              <div>
                <button type="button" disabled={pagina.page === 0} onClick={() => consultar(filtrosAplicados, pagina.page - 1)}>Anterior</button>
                <span>Página {pagina.page + 1} de {pagina.totalPages}</span>
                <button type="button" disabled={pagina.page + 1 >= pagina.totalPages} onClick={() => consultar(filtrosAplicados, pagina.page + 1)}>Próxima</button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default TempoAtendimento;
