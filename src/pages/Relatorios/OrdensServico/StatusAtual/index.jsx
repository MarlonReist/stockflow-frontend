import React, { useEffect, useState } from "react";
import { FiPrinter, FiRefreshCw } from "react-icons/fi";
import CabecalhoRelatorio from "../../../../components/CabecalhoRelatorio";
import { buscarStatusAtualOs } from "../../../../services/relatorioTecnicoService";
import { CabecalhoOrdenavel } from "../components/ControlesTabelaRelatorio";
import { useTabelaRelatorio } from "../components/useTabelaRelatorio";
import "./StatusAtual.css";

const ORDEM_STATUS = [
  "ABERTA",
  "AGENDADA",
  "EM_ATENDIMENTO",
  "AGUARDANDO_CONFERENCIA",
  "FINALIZADA",
  "CANCELADA",
];

const NOMES_STATUS = {
  ABERTA: "Aberta",
  AGENDADA: "Agendada",
  EM_ATENDIMENTO: "Em atendimento",
  AGUARDANDO_CONFERENCIA: "Aguardando conferência",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
};

const StatusAtual = () => {
  const [resultado, setResultado] = useState(null);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const tabela = useTabelaRelatorio(resultado || [], "quantidade", "desc", 10);

  const carregarRelatorio = async () => {
    setCarregando(true);
    setErro("");

    try {
      const response = await buscarStatusAtualOs();
      const quantidades = new Map(
        response.data.map((item) => [item.status, Number(item.quantidade || 0)]),
      );

      const dados = ORDEM_STATUS.map((status) => ({
        status,
        quantidade: quantidades.get(status) || 0,
      }));

      setResultado(dados);
      setAtualizadoEm(new Date());
    } catch (error) {
      setErro("Não foi possível carregar a distribuição atual das ordens de serviço.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarRelatorio();
  }, []);

  const total = resultado?.reduce((soma, item) => soma + item.quantidade, 0) || 0;

  const calcularPercentual = (quantidade) =>
    total > 0
      ? new Intl.NumberFormat("pt-BR", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format((quantidade / total) * 100)
      : "0,0";

  const handleImprimir = () => {
    const tituloOriginal = document.title;
    document.title = "Distribuição Atual por Status";
    window.print();
    setTimeout(() => { document.title = tituloOriginal; }, 500);
  };

  return (
    <div className="status-atual-page">
      <div className="status-atual-header">
        <CabecalhoRelatorio
          titulo="Distribuição Atual por Status"
          descricao="Consulte quantas ordens de serviço estão atualmente em cada etapa."
          voltarPara="/relatorios/tecnicos"
          textoVoltar="Voltar para relatórios de ordens de serviço"
        />
      </div>

      <div className="status-atual-controles">
        <div>
          <strong>Fotografia do estado atual</strong>
          <span>Os números consideram o status das OS no momento da consulta.</span>
        </div>
        <button type="button" onClick={carregarRelatorio} disabled={carregando}>
          <FiRefreshCw /> {carregando ? "Atualizando..." : "Atualizar relatório"}
        </button>
      </div>

      {erro && <p className="status-atual-erro" role="alert">{erro}</p>}

      <section className="status-atual-resultado">
        <div className="status-atual-marca-impressao">
          <strong>StockFlow</strong>
          <span>Relatório de Ordens de Serviço</span>
        </div>

        <div className="status-atual-resultado-header">
          <div>
            <h2>Situação das ordens de serviço</h2>
            {atualizadoEm && (
              <p>Atualizado em {atualizadoEm.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</p>
            )}
          </div>
          <button type="button" className="status-atual-imprimir" onClick={handleImprimir} disabled={!resultado}>
            <FiPrinter /> Imprimir
          </button>
        </div>

        {carregando && resultado === null ? (
          <p className="status-atual-vazio">Carregando relatório...</p>
        ) : resultado ? (
          <>
            <div className="status-atual-total">
              <span>Total de ordens cadastradas</span>
              <strong>{total}</strong>
            </div>
            <div className="status-atual-table-wrapper">
              <table className="status-atual-table">
                <thead><tr><CabecalhoOrdenavel campo="status" {...tabela}>Status atual</CabecalhoOrdenavel><CabecalhoOrdenavel campo="quantidade" {...tabela}>Quantidade</CabecalhoOrdenavel><CabecalhoOrdenavel campo="quantidade" {...tabela}>Participação no total</CabecalhoOrdenavel></tr></thead>
                <tbody>
                  {tabela.dadosOrdenados.map((item) => (
                    <tr key={item.status}>
                      <td><span className={`status-atual-badge status-atual-badge--${item.status.toLowerCase()}`}>{NOMES_STATUS[item.status] || item.status}</span></td>
                      <td>{item.quantidade}</td>
                      <td>{calcularPercentual(item.quantidade)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="status-atual-vazio">Não há dados para exibir.</p>
        )}
      </section>
    </div>
  );
};

export default StatusAtual;
