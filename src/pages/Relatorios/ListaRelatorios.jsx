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
  {
    id: "relatorios-os",
    nome: "Relatórios de Ordens de Serviço",
    descricao:
      "Consulte atendimentos, equipe, pendências, clientes e materiais das OS.",
    rota: "/relatorios/tecnicos",
    somenteAdmin: true,
  },
];

const ListaRelatorios = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState(null);
  const usuario = JSON.parse(localStorage.getItem("stockflow_usuario") || "{}");

  const relatorios = relatoriosDisponiveis.filter((relatorio) => {
    if (relatorio.somenteAdmin && usuario.perfil !== "ADMIN") return false;
    const termo = busca.toLowerCase();
    return (
      relatorio.nome.toLowerCase().includes(termo) ||
      relatorio.descricao.toLowerCase().includes(termo)
    );
  });

  const visualizar = (relatorio = selecionado) => {
    if (relatorio?.rota) navigate(relatorio.rota);
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
          onChange={(event) => {
            setBusca(event.target.value);
            setSelecionado(null);
          }}
        />
        <button type="button" disabled={!selecionado} onClick={() => visualizar()}>
          Visualizar relatório
        </button>
      </div>

      <div className="relatorios-card">
        <table className="relatorios-table">
          <thead>
            <tr><th>Relatório</th><th>Descrição</th></tr>
          </thead>
          <tbody>
            {relatorios.map((relatorio) => (
              <tr
                key={relatorio.id}
                className={selecionado?.id === relatorio.id ? "selected-row" : ""}
                onClick={() => setSelecionado(relatorio)}
                onDoubleClick={() => visualizar(relatorio)}
              >
                <td>{relatorio.nome}</td>
                <td>{relatorio.descricao}</td>
              </tr>
            ))}
            {relatorios.length === 0 && (
              <tr><td colSpan="2" className="empty-state-cell">Nenhum relatório encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaRelatorios;
