import React, { useEffect, useState } from "react";
import CabecalhoRelatorio from "../../../../components/CabecalhoRelatorio";
import { listarColaboradores } from "../../../../services/colaboradorService";
import "./AtendimentosColaborador.css";
import { FiPrinter } from "react-icons/fi";
import {
  buscarAtendimentosTecnicos,
  gerarPdfAtendimentosTecnicos,
} from "../../../../services/relatorioTecnicoService";
import TabelaAtendimentos from "./components/TabelaAtendimentos";
import { listarTiposOrdemServicoAtivos } from "../../../../services/tipoOrdemServicoService";

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
    tecnicoId: "",
    tipoOrdemServicoId: "",
    dataInicial: formatarDataParametro(inicio),
    dataFinal: formatarDataParametro(hoje),
    participacao: "RESPONSAVEL",
  };
};

const AtendimentosColaborador = () => {
  const [colaboradores, setColaboradores] = useState([]);
  const [tiposOrdemServico, setTiposOrdemServico] = useState([]);
  const [filtros, setFiltros] = useState(criarFiltrosIniciais);
  const [carregandoColaboradores, setCarregandoColaboradores] = useState(true);
  const [carregandoTipos, setCarregandoTipos] = useState(true);
  const [erro, setErro] = useState("");
  const [paginaAtendimentos, setPaginaAtendimentos] = useState(null);
  const [filtrosAplicados, setFiltrosAplicados] = useState(null);
  const [carregandoAtendimentos, setCarregandoAtendimentos] = useState(false);
  const [imprimindo, setImprimindo] = useState(false);

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
    carregarTiposOrdemServico();
  }, []);

  const carregarTiposOrdemServico = async () => {
    try {
      const response = await listarTiposOrdemServicoAtivos();
      setTiposOrdemServico(response.data);
    } catch (error) {
      setErro("Não foi possível carregar os tipos de serviço.");
    } finally {
      setCarregandoTipos(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFiltros((atuais) => ({
      ...atuais,
      [name]: value,
    }));

    setErro("");
  };

  const montarParametros = (valores, page = 0) => ({
    dataInicial: valores.dataInicial,
    dataFinal: valores.dataFinal,
    participacao: valores.participacao,
    tecnicoId: valores.tecnicoId || undefined,
    tipoOrdemServicoId: valores.tipoOrdemServicoId || undefined,
    page,
    size: 10,
  });

  const carregarAtendimentos = async (valores, page = 0) => {
    setCarregandoAtendimentos(true);
    setErro("");

    try {
      const response = await buscarAtendimentosTecnicos(
        montarParametros(valores, page),
      );

      setPaginaAtendimentos(response.data);
    } catch (error) {
      const status = error.response?.status;

      if (status === 400) {
        setErro("Os filtros foram recusados. Confira o período informado.");
      } else if (status === 403) {
        setErro("Você não tem permissão para consultar este relatório.");
      } else {
        setErro("Não foi possível carregar os atendimentos.");
      }

      setPaginaAtendimentos(null);
    } finally {
      setCarregandoAtendimentos(false);
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

    const novosFiltrosAplicados = { ...filtros };

    setErro("");
    setFiltrosAplicados(novosFiltrosAplicados);
    carregarAtendimentos(novosFiltrosAplicados, 0);
  };

  const handlePaginaAnterior = () => {
    if (!filtrosAplicados || !paginaAtendimentos) {
      return;
    }

    carregarAtendimentos(
      filtrosAplicados,
      Math.max(0, paginaAtendimentos.page - 1),
    );
  };

  const handleProximaPagina = () => {
    if (!filtrosAplicados || !paginaAtendimentos) {
      return;
    }

    carregarAtendimentos(filtrosAplicados, paginaAtendimentos.page + 1);
  };

  const handleImprimir = async () => {
    if (!filtrosAplicados) {
      return;
    }

    setImprimindo(true);
    setErro("");

    try {
      const response = await gerarPdfAtendimentosTecnicos({
        dataInicial: filtrosAplicados.dataInicial,
        dataFinal: filtrosAplicados.dataFinal,
        participacao: filtrosAplicados.participacao,
        tecnicoId: filtrosAplicados.tecnicoId || undefined,
        tipoOrdemServicoId: filtrosAplicados.tipoOrdemServicoId || undefined,
      });

      const pdfUrl = URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );

      const janelaPdf = window.open(pdfUrl, "_blank");

      if (!janelaPdf) {
        URL.revokeObjectURL(pdfUrl);
        setErro("Permita pop-ups para abrir o relatório.");
        return;
      }

      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
    } catch (error) {
      setErro("Não foi possível gerar o PDF dos atendimentos.");
    } finally {
      setImprimindo(false);
    }
  };

  return (
    <div className="atendimentos-colaborador-page">
      <div className="atendimentos-colaborador-header">
        <CabecalhoRelatorio
          titulo="Atendimentos por Colaborador"
          descricao="Consulte as ordens realizadas como responsável, ajudante ou em ambas as participações."
          voltarPara="/relatorios/tecnicos"
          textoVoltar="Voltar para relatórios de ordens de serviço"
        />
      </div>

      <form
        className="atendimentos-colaborador-filtros"
        onSubmit={handleVisualizar}
      >
        <div className="atendimentos-colaborador-campo">
          <label htmlFor="tecnicoId">Colaborador</label>
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

        <div className="atendimentos-colaborador-campo">
          <label htmlFor="participacao">Participação</label>
          <select
            id="participacao"
            name="participacao"
            value={filtros.participacao}
            onChange={handleChange}
          >
            <option value="RESPONSAVEL">Técnico responsável</option>
            <option value="AJUDANTE">Técnico ajudante</option>
            <option value="AMBOS">Responsável ou ajudante</option>
          </select>
        </div>
        <div className="atendimentos-colaborador-campo">
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
        <div className="atendimentos-colaborador-campo">
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

        <div className="atendimentos-colaborador-campo">
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

        {carregandoColaboradores && (
          <p className="atendimentos-colaborador-mensagem" role="status">
            Carregando colaboradores...
          </p>
        )}

        {erro && (
          <p
            className="atendimentos-colaborador-mensagem atendimentos-colaborador-erro"
            role="alert"
          >
            {erro}
          </p>
        )}
        {carregandoTipos && (
          <p className="atendimentos-colaborador-mensagem" role="status">
            Carregando tipos de serviço...
          </p>
        )}
        <div className="atendimentos-colaborador-acoes">
          <button
            type="submit"
            disabled={carregandoColaboradores || carregandoTipos}
          >
            Visualizar relatório
          </button>
        </div>
      </form>
      <section className="atendimentos-colaborador-resultado">
        <div className="atendimentos-colaborador-resultado-header">
          <div>
            <h2>Atendimentos encontrados</h2>
            <p>
              O período considera a data de conclusão do atendimento técnico.
            </p>
          </div>

          <button
            type="button"
            className="atendimentos-colaborador-imprimir"
            disabled={!filtrosAplicados || carregandoAtendimentos || imprimindo}
            onClick={handleImprimir}
          >
            <FiPrinter />
            {imprimindo ? " Gerando..." : " Imprimir"}
          </button>
        </div>

        <TabelaAtendimentos
          pagina={paginaAtendimentos}
          carregando={carregandoAtendimentos}
          onPaginaAnterior={handlePaginaAnterior}
          onProximaPagina={handleProximaPagina}
        />
      </section>
    </div>
  );
};

export default AtendimentosColaborador;
