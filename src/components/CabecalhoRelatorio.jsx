import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "./CabecalhoRelatorio.css";

const CabecalhoRelatorio = ({
  titulo,
  descricao,
  voltarPara = "/relatorios",
  textoVoltar = "Voltar para relatórios",
}) => {
  const navigate = useNavigate();

  return (
    <div className="relatorio-titulo-com-volta">
      <button
        type="button"
        className="relatorio-voltar"
        onClick={() => navigate(voltarPara)}
        aria-label={textoVoltar}
        title={textoVoltar}
      >
        <FiArrowLeft aria-hidden="true" />
      </button>

      <div>
        <h1>{titulo}</h1>
        <p>{descricao}</p>
      </div>
    </div>
  );
};

export default CabecalhoRelatorio;
