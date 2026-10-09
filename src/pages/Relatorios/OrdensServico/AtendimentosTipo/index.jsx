import React, { useEffect, useState } from "react";
import { FiPrinter } from "react-icons/fi";
import { CabecalhoOrdenavel, PaginacaoRelatorio } from "../components/ControlesTabelaRelatorio";
import { useTabelaRelatorio } from "../components/useTabelaRelatorio";
import CabecalhoRelatorio from "../../../../components/CabecalhoRelatorio";
import { listarColaboradores } from "../../../../services/colaboradorService";
import { buscarOsPorTipo } from "../../../../services/relatorioTecnicoService";
import "./AtendimentosTipo.css";

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
    tecnicoId: "",
  };
};

const formatarDataExibicao = (data) => {
  return data?.split("-").reverse().join("/") || "";
};

const AtendimentosTipo = () => {
  const [filtros, setFiltros] = useState(criarFiltrosIniciais);
  const [filtrosAplicados, setFiltrosAplicados] = useState(null);
  const [colaboradores, setColaboradores] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [carregandoColaboradores, setCarregandoColaboradores] =
    useState(true);
  const [carregandoResultado, setCarregandoResultado] = useState(false);
  const [erro, setErro] = useState("");
  const tabela = useTabelaRelatorio(resultado || [], "quantidade", "desc", 10);

  useEffect(() => {
    const carregarColaboradores = async () => {
      try {
        const response = await listarColaboradores();
        setColaboradores(response.data);
      } catch (error) {
        setErro("Não foi possível carregar os colaboradores.");
      } finally {
        setCarregandoColaboradores(false);
      }
    };

    carregarColaboradores();
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
    setResultado(null);
    setErro("");

    try {
      const response = await buscarOsPorTipo({
        dataInicial: filtros.dataInicial,
        dataFinal: filtros.dataFinal,
        tecnicoId: filtros.tecnicoId || undefined,
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
        setErro("Não foi possível carregar os atendimentos por tipo.");
      }
    } finally {
      setCarregandoResultado(false);
    }
  };

  const obterNomeColaborador = () => {
    if (!filtrosAplicados?.tecnicoId) {
      return "Todos os colaboradores";
    }

    return (
      colaboradores.find(
        (colaborador) =>
          String(colaborador.id) ===
          String(filtrosAplicados.tecnicoId),
      )?.nome || "Colaborador selecionado"
    );
  };

  const handleImprimir = () => {
    const tituloOriginal = document.title;

    document.title = "Relatório de Atendimentos por Tipo";
    window.print();

    setTimeout(() => {
      document.title = tituloOriginal;
    }, 500);
  };

  return (
    <div className="atendimentos-tipo-page">
      <div className="atendimentos-tipo-header">
        <CabecalhoRelatorio
          titulo="Atendimentos por Tipo de Serviço"
          descricao="Consulte a quantidade de atendimentos concluídos em cada tipo de ordem de serviço."
          voltarPara="/relatorios/tecnicos"
          textoVoltar="Voltar para relatórios de ordens de serviço"
        />
      </div>

      <form
        className="atendimentos-tipo-filtros"
        onSubmit={handleVisualizar}
      >
        <div className="atendimentos-tipo-campo">
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

        <div className="atendimentos-tipo-campo">
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

        <div className="atendimentos-tipo-campo">
          <label htmlFor="tecnicoId">Técnico responsável</label>
          <select
            id="tecnicoId"
            name="tecnicoId"
            value={filtros.tecnicoId}
            onChange={handleChange}
            disabled={carregandoColaboradores}
          >
            <option value="">Todos os colaboradores</option>

            {colaboradores.map((colaborador) => (
              <option key={colaborador.id} value={colaborador.id}>
                {colaborador.nome}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={carregandoColaboradores || carregandoResultado}
        >
          {carregandoResultado ? "Carregando..." : "Visualizar relatório"}
        </button>

        {erro && (
          <p className="atendimentos-tipo-mensagem" role="alert">
            {erro}
          </p>
        )}
      </form>

      <section className="atendimentos-tipo-resultado">
        <div className="atendimentos-tipo-marca-impressao">
          <strong>StockFlow</strong>
          <span>Relatório de Ordens de Serviço</span>
        </div>

        <div className="atendimentos-tipo-resultado-header">
          <div>
            <h2>Atendimentos por tipo</h2>

            {filtrosAplicados && (
              <p className="atendimentos-tipo-filtros-impressao">
                Período:{" "}
                {formatarDataExibicao(filtrosAplicados.dataInicial)}
                {" até "}
                {formatarDataExibicao(filtrosAplicados.dataFinal)}
                {" · Técnico: "}
                {obterNomeColaborador()}
              </p>
            )}
          </div>

          <button
            type="button"
            className="atendimentos-tipo-imprimir"
            onClick={handleImprimir}
            disabled={!resultado || resultado.length === 0}
          >
            <FiPrinter />
            Imprimir
          </button>
        </div>

        {resultado === null ? (
          <p className="atendimentos-tipo-vazio">
            Preencha os filtros e clique em Visualizar relatório.
          </p>
        ) : resultado.length === 0 ? (
          <p className="atendimentos-tipo-vazio">
            Nenhum atendimento encontrado para os filtros informados.
          </p>
        ) : (
          <><table className="atendimentos-tipo-table">
            <thead>
              <tr>
                <CabecalhoOrdenavel campo="tipoOrdemServicoNome" {...tabela}>Tipo de serviço</CabecalhoOrdenavel>
                <CabecalhoOrdenavel campo="quantidade" {...tabela}>OS realizadas</CabecalhoOrdenavel>
              </tr>
            </thead>

            <tbody>
              {tabela.dadosOrdenados.map((item, indice) => (
                <tr key={item.tipoOrdemServicoId} className={indice < tabela.inicio || indice >= tabela.inicio + 10 ? "relatorio-linha-fora-pagina" : ""}>
                  <td>{item.tipoOrdemServicoNome}</td>
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

export default AtendimentosTipo;
