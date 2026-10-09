import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CabecalhoRelatorio from "../../../components/CabecalhoRelatorio.jsx";
import { gruposRelatorios } from "./catalogoRelatorios";
import "../Relatorios.css";
import "./CatalogoRelatorios.css";

const normalizar = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const CatalogoOrdensServico = () => {
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState(null);
  const termo = normalizar(busca);
  const navigate = useNavigate();
  const grupos = gruposRelatorios
    .map((grupo) => ({
      ...grupo,
      relatorios: grupo.relatorios.filter((relatorio) =>
        normalizar(
          `${grupo.nome} ${relatorio.nome} ${relatorio.descricao}`,
        ).includes(termo),
      ),
    }))
    .filter((grupo) => grupo.relatorios.length);

  const handleVisualizar = () => {
    if (selecionado?.rota) {
      navigate(selecionado.rota);
    }
  };

  return (
    <div className="relatorios-page">
      <div className="relatorios-header">
        <CabecalhoRelatorio
          titulo="Relatórios de Ordens de Serviço"
          descricao="Selecione uma consulta de atendimentos, acompanhamento ou materiais."
        />
      </div>
      <div className="relatorios-actions">
        <input
          type="search"
          placeholder="Buscar relatório..."
          value={busca}
          onChange={(event) => {
            setBusca(event.target.value);
            setSelecionado(null);
          }}
        />
      </div>
      <p className="catalogo-os-aviso" role="status">
        {selecionado
          ? selecionado.rota
            ? `Relatório selecionado: ${selecionado.nome}`
            : `${selecionado.nome} será implementado nas próximas etapas.`
          : "Selecione um relatório abaixo."}
      </p>
      <div className="catalogo-os-continuar">
        <button
          type="button"
          disabled={!selecionado?.rota}
          onClick={handleVisualizar}
        >
          Visualizar relatório
        </button>
      </div>
      <div className="catalogo-os">
        {grupos.map((grupo) => (
          <section className="catalogo-os-grupo" key={grupo.id}>
            <h2>{grupo.nome}</h2>
            <ul className="catalogo-os-lista">
              {grupo.relatorios.map((relatorio) => (
                <li key={relatorio.id}>
                  <label
                    className={`catalogo-os-opcao ${selecionado?.id === relatorio.id ? "selecionada" : ""}`}
                  >
                    <input
                      type="radio"
                      name="relatorio-os"
                      checked={selecionado?.id === relatorio.id}
                      onChange={() => setSelecionado(relatorio)}
                    />
                    <span>
                      <strong>{relatorio.nome}</strong>
                      <small>{relatorio.descricao}</small>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default CatalogoOrdensServico;
