import React, { useState, useEffect, useRef } from "react";
import "./Cadastro.css";
import {
  cadastrarEntrada,
} from "../../../services/entradaEstoqueService";
import { listarFornecedores } from "../../../services/fornecedorService";
import { listarAlmoxarifados } from "../../../services/almoxarifadoService";
import { useNavigate } from "react-router-dom";

const entradaInicial = {
  fornecedorId: "",
  almoxarifadoId: "",
};

const CadastroEntrada = () => {
  const [entrada, setEntrada] = useState({ ...entradaInicial });
  const [fornecedores, setFornecedores] = useState([]);
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [camposInvalidos, setCamposInvalidos] = useState({});
  const fornecedorSelectRef = useRef(null);
  const almoxarifadoSelectRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEntrada({ ...entrada, [name]: value });

    if (camposInvalidos[name]) {
      setCamposInvalidos((camposAtuais) => ({
        ...camposAtuais,
        [name]: false,
      }));
    }
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
    const buscarFornecedores = async () => {
      try {
        const response = await listarFornecedores();
        setFornecedores(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar fornecedores", "erro");
      }
    };
    buscarFornecedores();
  }, []);

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
    const camposComErro = {};

    if (!entrada.fornecedorId.trim()) {
      camposComErro.fornecedorId = true;
      erros.push("Fornecedor é obrigatório");
    }
    if (!entrada.almoxarifadoId.trim()) {
      camposComErro.almoxarifadoId = true;
      erros.push("Almoxarifado é obrigatório");
    }

    setCamposInvalidos(camposComErro);
    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarCadastro();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });

      if (!entrada.fornecedorId.trim()) {
        fornecedorSelectRef.current?.focus();
      } else if (!entrada.almoxarifadoId.trim()) {
        almoxarifadoSelectRef.current?.focus();
      }

      return;
    }

    try {
      await cadastrarEntrada(entrada);
      mostrarMensagem("Entrada cadastrada com sucesso", "sucesso");
      handleClear();
    } catch (error) {
      const mensagemPadrao = "Erro ao cadastrar entrada.";
      const mensagemErro = error.response?.data?.message || mensagemPadrao;
      mostrarMensagem(mensagemErro, "erro");
      return;
    }
  };

  const handleClear = () => {
    setEntrada({ ...entradaInicial });
    setCamposInvalidos({});
  };

  return (
    <div className="cadastro-page">
      <div className="cadastro-header">
        <h1>Cadastro de Entrada</h1>
        <p>Registre novas entradas de produtos no estoque</p>
      </div>
      <div className="cadastro-card">
        <form className="cadastro-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Fornecedor</label>
            <select
              ref={fornecedorSelectRef}
              name="fornecedorId"
              value={entrada.fornecedorId}
              onChange={handleChange}
              className={camposInvalidos.fornecedorId ? "input-error" : ""}
            >
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map((fornecedor) => (
                <option key={fornecedor.id} value={fornecedor.id}>
                  {fornecedor.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Almoxarifado de Destino</label>
            <select
              ref={almoxarifadoSelectRef}
              name="almoxarifadoId"
              value={entrada.almoxarifadoId}
              onChange={handleChange}
              className={camposInvalidos.almoxarifadoId ? "input-error" : ""}
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
export default CadastroEntrada;
