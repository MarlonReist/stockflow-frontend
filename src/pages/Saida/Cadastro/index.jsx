import React, { useState, useEffect } from "react";
import "./Cadastro.css";
import { cadastrarSaida } from "../../../services/saidaEstoqueService";
import { listarAlmoxarifados } from "../../../services/almoxarifadoService";
import { useNavigate } from "react-router-dom";

const saidaInicial = {
  almoxarifadoId: "",
};

const CadastroSaida = () => {
  const [saida, setSaida] = useState({ ...saidaInicial });
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSaida({ ...saida, [name]: value });
  };

  const mostrarMensagem = (texto, tipo) => {
    const id = `${Date.now()}-${Math.random()}`;

    setMensagens((mensagensAtuais) => [
      ...mensagensAtuais,
      { id, texto, tipo },
    ]);

    setTimeout(() => {
      setMensagens((mensagensAtuais) =>
        mensagensAtuais.filter((mensagem) => mensagem.id !== id),
      );
    }, 3000);
  };

  useEffect(() => {
    const buscarAlmoxarifados = async () => {
      try {
        const response = await listarAlmoxarifados();
        setAlmoxarifados(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar almoxarifados", "erro");
      }
    };
    buscarAlmoxarifados();
  }, []);

  const validarCadastro = () => {
    const erros = [];

    if (!saida.almoxarifadoId.trim()) {
      erros.push("Almoxarifado é obrigatório");
    }

    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarCadastro();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });
      return;
    }

    try {
      await cadastrarSaida(saida);
      mostrarMensagem("Saída cadastrada com sucesso", "sucesso");
      handleClear();
    } catch (error) {
      const mensagemPadrao = "Erro ao cadastrar saida.";
      const mensagemErro = error.response?.data?.message || mensagemPadrao;
      mostrarMensagem(mensagemErro, "erro");
      return;
    }
  };

  const handleClear = () => {
    setSaida({ ...saidaInicial });
  };

  return (
    <div className="saida-page">
      <div className="saida-header">
        <h1>Cadastro de Saída</h1>
        <p>Registre saídas de produtos do estoque</p>
      </div>
      <div className="saida-card">
        <form className="saida-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Almoxarifado</label>
            <select
              name="almoxarifadoId"
              value={saida.almoxarifadoId}
              onChange={handleChange}
            >
              <option value="">Selecione o almoxarifado</option>
              {almoxarifados.map((almoxarifado) => (
                <option key={almoxarifado.id} value={almoxarifado.id}>
                  {almoxarifado.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="submit">Salvar</button>
            <button
              type="button"
              onClick={() => {
                handleClear();
              }}
            >
              Limpar
            </button>
          </div>
        </form>
      </div>
      <div className="toast-container">
        {mensagens.map((mensagem) => (
          <div
            key={mensagem.id}
            className={`form-message form-message-${mensagem.tipo}`}
          >
            {mensagem.texto}
          </div>
        ))}
      </div>
    </div>
  );
};
export default CadastroSaida;
