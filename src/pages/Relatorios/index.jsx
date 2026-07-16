import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Relatorios.css";

const relatoriosDisponiveis = [
  {
    id: "estoque-almoxarifado",
    nome: "Estoque por almoxarifado",
    descricao: "Visualize e imprima os produtos disponíveis por almoxarifado.",
    rota: "/estoque/visualizar",
  },
  {
    id: "historico-movimentacoes",
    nome: "Histórico de movimentações",
    descricao:
      "Consulte entradas, saídas, transferências e ordens de serviço.",
    rota: "/relatorios/historico-movimentacoes",
  },
];

const Relatorios = () => {
  const [busca, setBusca] = useState("");
  const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);
  const navigate = useNavigate();

  const relatoriosFiltrados = relatoriosDisponiveis.filter((relatorio) => {
    const buscaFormatada = busca.toLowerCase();

    return (
      relatorio.nome.toLowerCase().includes(buscaFormatada) ||
      relatorio.descricao.toLowerCase().includes(buscaFormatada)
    );
  });

  const handleVisualizarRelatorio = (relatorio = relatorioSelecionado) => {
    if (!relatorio?.rota) {
      return;
    }

    navigate(relatorio.rota);
  };

  return (
    <div className="relatorios-page">
      <div className="relatorios-header">
        <h1>Relatórios</h1>
        <p>Selecione um relatório para visualizar as informações do sistema</p>
      </div>

      <div className="relatorios-actions">
        <input
          type="text"
          placeholder="Buscar relatório..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setRelatorioSelecionado(null);
          }}
        />

        <button
          type="button"
          disabled={!relatorioSelecionado?.rota}
          onClick={() => handleVisualizarRelatorio()}
        >
          Visualizar relatório
        </button>
      </div>

      <div className="relatorios-card">
        <table className="relatorios-table">
          <thead>
            <tr>
              <th>Relatório</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {relatoriosFiltrados.map((relatorio) => (
              <tr
                key={relatorio.id}
                className={
                  relatorioSelecionado?.id === relatorio.id
                    ? "selected-row"
                    : ""
                }
                onClick={() => setRelatorioSelecionado(relatorio)}
                onDoubleClick={() => handleVisualizarRelatorio(relatorio)}
              >
                <td>{relatorio.nome}</td>
                <td>{relatorio.descricao}</td>
              </tr>
            ))}

            {relatoriosFiltrados.length === 0 && (
              <tr>
                <td colSpan="2" className="empty-state-cell">
                  Nenhum relatório encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Relatorios;
