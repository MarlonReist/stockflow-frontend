import React, { useEffect, useState } from "react";
import CabecalhoRelatorio from "../../../../components/CabecalhoRelatorio";
import { listarTiposOrdemServicoAtivos } from "../../../../services/tipoOrdemServicoService";
import { buscarOsPorTecnicoResponsavel } from "../../../../services/relatorioTecnicoService";
import "./ResumoResponsavel.css";
import { FiPrinter } from "react-icons/fi";
import { CabecalhoOrdenavel, PaginacaoRelatorio } from "../components/ControlesTabelaRelatorio";
import { useTabelaRelatorio } from "../components/useTabelaRelatorio";

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

  return {
    dataInicial: formatarDataParametro(inicio),
    dataFinal: formatarDataParametro(hoje),
    tipoOrdemServicoId: "",
  };
};

const ResumoResponsavel = () => {
  const [filtros, setFiltros] = useState(criarFiltrosIniciais);
  const [tiposOrdemServico, setTiposOrdemServico] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [filtrosAplicados, setFiltrosAplicados] = useState(null);
  const [carregandoTipos, setCarregandoTipos] = useState(true);
  const [carregandoResultado, setCarregandoResultado] = useState(false);
  const [erro, setErro] = useState("");
  const tabela = useTabelaRelatorio(resultado || [], "quantidade", "desc", 10);

  useEffect(() => {
    const carregarTipos = async () => {
      try {
        const response = await listarTiposOrdemServicoAtivos();
        setTiposOrdemServico(response.data);
      } catch (error) {
        setErro("Não foi possível carregar os tipos de serviço.");
      } finally {
        setCarregandoTipos(false);
      }
    };

    carregarTipos();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFiltros((atuais) => ({
      ...atuais,
      [name]: value,
    }));

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

    setCarregandoResultado(true);
    setErro("");
    setResultado(null);

    try {
      const response = await buscarOsPorTecnicoResponsavel({
        dataInicial: filtros.dataInicial,
        dataFinal: filtros.dataFinal,
        tipoOrdemServicoId: filtros.tipoOrdemServicoId || undefined,
      });

      setResultado(response.data);
      setFiltrosAplicados({ ...filtros });
    } catch (error) {
      const status = error.response?.status;

      if (status === 400) {
        setErro("O período informado foi recusado pelo servidor.");
      } else if (status === 403) {
        setErro("Você não tem permissão para consultar este relatório.");
      } else {
        setErro("Não foi possível carregar o resumo dos técnicos.");
      }
    } finally {
      setCarregandoResultado(false);
    }
  };

  const formatarDataExibicao = (data) => {
    if (!data) {
      return "";
    }

    return data.split("-").reverse().join("/");
  };

  const obterNomeTipoAplicado = () => {
    if (!filtrosAplicados?.tipoOrdemServicoId) {
      return "Todos os tipos";
    }

    return (
      tiposOrdemServico.find(
        (tipo) =>
          String(tipo.id) === String(filtrosAplicados.tipoOrdemServicoId),
      )?.nome || "Tipo selecionado"
    );
  };

  const handleImprimir = () => {
    const tituloOriginal = document.title;

    document.title = "Relatório de Atendimentos por Responsável";
    window.print();

    setTimeout(() => {
      document.title = tituloOriginal;
    }, 500);
  };

  return (
    <div className="resumo-responsavel-page">
      <div className="resumo-responsavel-header">
        <CabecalhoRelatorio
          titulo="Resumo por Técnico Responsável"
          descricao="Compare a quantidade de atendimentos concluídos por cada técnico responsável."
          voltarPara="/relatorios/tecnicos"
          textoVoltar="Voltar para relatórios de ordens de serviço"
        />
      </div>

      <form className="resumo-responsavel-filtros" onSubmit={handleVisualizar}>
        <div className="resumo-responsavel-campo">
          <label htmlFor="dataInicial">Data inicial</label>
          <input
            id="dataInicial"
            name="dataInicial"
            type="date"
            value={filtros.dataInicial}
            onChange={handleChange}
            required
          />
        </div>

        <div className="resumo-responsavel-campo">
          <label htmlFor="dataFinal">Data final</label>
          <input
            id="dataFinal"
            name="dataFinal"
            type="date"
            value={filtros.dataFinal}
            onChange={handleChange}
            required
          />
        </div>

        <div className="resumo-responsavel-campo">
          <label htmlFor="tipoOrdemServicoId">Tipo de serviço</label>
          <select
            id="tipoOrdemServicoId"
            name="tipoOrdemServicoId"
            value={filtros.tipoOrdemServicoId}
            onChange={handleChange}
            disabled={carregandoTipos}
          >
            <option value="">Todos os tipos</option>

            {tiposOrdemServico.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={carregandoTipos || carregandoResultado}>
          {carregandoResultado ? "Carregando..." : "Visualizar relatório"}
        </button>

        {erro && (
          <p
            className="resumo-responsavel-mensagem resumo-responsavel-erro"
            role="alert"
          >
            {erro}
          </p>
        )}
      </form>

      <section className="resumo-responsavel-resultado">
        <div className="resumo-responsavel-marca-impressao">
          <strong>StockFlow</strong>
          <span>Relatório de Ordens de Serviço</span>
        </div>

        <div className="resumo-responsavel-resultado-header">
          <div>
            <h2>Atendimentos por responsável</h2>

            {filtrosAplicados ? (
              <p className="resumo-responsavel-filtros-impressao">
                Período: {formatarDataExibicao(filtrosAplicados.dataInicial)}
                {" até "}
                {formatarDataExibicao(filtrosAplicados.dataFinal)}
                {" · Tipo: "}
                {obterNomeTipoAplicado()}
              </p>
            ) : (
              <p>Consulte um período para gerar o relatório.</p>
            )}
          </div>

          <button
            type="button"
            className="resumo-responsavel-imprimir"
            onClick={handleImprimir}
            disabled={!resultado || resultado.length === 0}
          >
            <FiPrinter />
            Imprimir
          </button>
        </div>

        {resultado === null ? (
          <p className="resumo-responsavel-vazio">
            Preencha os filtros e clique em Visualizar relatório.
          </p>
        ) : resultado.length === 0 ? (
          <p className="resumo-responsavel-vazio">
            Nenhum atendimento encontrado para o período informado.
          </p>
        ) : (
          <><table className="resumo-responsavel-table">
            <thead>
              <tr>
                <CabecalhoOrdenavel campo="tecnicoNome" {...tabela}>Técnico responsável</CabecalhoOrdenavel>
                <CabecalhoOrdenavel campo="quantidade" {...tabela}>OS realizadas</CabecalhoOrdenavel>
              </tr>
            </thead>

            <tbody>
              {tabela.dadosOrdenados.map((item, indice) => (
                <tr key={item.tecnicoId} className={indice < tabela.inicio || indice >= tabela.inicio + 10 ? "relatorio-linha-fora-pagina" : ""}>
                  <td>{item.tecnicoNome}</td>
                  <td>{item.quantidade.toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table><PaginacaoRelatorio {...tabela} /></>
        )}
      </section>
    </div>
  );
};

export default ResumoResponsavel;
