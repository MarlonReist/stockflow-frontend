import React, { useState, useEffect, useRef } from "react";
import "./Fornecedor.css";
import {
  cadastrarFornecedor,
  buscarFornecedorPorID,
  atualizarFornecedor,
} from "../../../services/fornecedorService";
import { useNavigate, useParams } from "react-router-dom";
import { IMaskInput } from "react-imask";

const fornecedorInicial = {
  nome: "",
  cnpj: "",
};

const Fornecedor = () => {
  const [fornecedor, setFornecedor] = useState({ ...fornecedorInicial });
  const [mensagens, setMensagens] = useState([]);
  const [camposInvalidos, setCamposInvalidos] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();
  const modoEdicao = Boolean(id);
  const nomeInputRef = useRef(null);
  const cnpjInputRef = useRef(null);

  useEffect(() => {
    if (!modoEdicao) {
      return;
    }

    const carregarFornecedor = async () => {
      try {
        const response = await buscarFornecedorPorID(id);
        setFornecedor(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar fornecedor", "erro");
      }
    };

    carregarFornecedor();
  }, [id, modoEdicao]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFornecedor({ ...fornecedor, [name]: value });

    if (camposInvalidos[name]) {
      setCamposInvalidos((camposAtuais) => ({
        ...camposAtuais,
        [name]: false,
      }));
    }
  };

  const handleMaskedChange = (name, value) => {
    setFornecedor((fornecedorAtual) => ({
      ...fornecedorAtual,
      [name]: value,
    }));

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

  const validarFornecedor = () => {
    const erros = [];
    const camposComErro = {};

    if (!fornecedor.nome.trim()) {
      erros.push("Nome é obrigatório");
      camposComErro.nome = true;
    }
    if (!fornecedor.cnpj.trim()) {
      erros.push("CNPJ é obrigatório");
      camposComErro.cnpj = true;
    }

    setCamposInvalidos(camposComErro);

    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarFornecedor();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });

      if (!fornecedor.nome.trim()) {
        nomeInputRef.current?.focus();
      } else if (!fornecedor.cnpj.trim()) {
        cnpjInputRef.current?.focus();
      }

      return;
    }

    try {
      if (modoEdicao) {
        await atualizarFornecedor(id, fornecedor);
        mostrarMensagem("Fornecedor atualizado com sucesso", "sucesso");

        setTimeout(() => {
          navigate("/gerenciamento/fornecedores");
        }, 1000);
      } else {
        await cadastrarFornecedor(fornecedor);
        mostrarMensagem("Fornecedor cadastrado com sucesso", "sucesso");
        handleClear();
      }
    } catch (error) {
      const mensagemPadrao = modoEdicao
        ? "Erro ao atualizar fornecedor."
        : "Erro ao cadastrar fornecedor.";

      const mensagemErro = error.response?.data?.message || mensagemPadrao;
      mostrarMensagem(mensagemErro, "erro");
      return;
    }
  };

  const handleClear = () => {
    setFornecedor({ ...fornecedorInicial });
    setCamposInvalidos({});
  };

  return (
    <div className="fornecedor-page">
      <div className="fornecedor-header">
        <h1>{modoEdicao ? "Editar Fornecedor" : "Cadastro de Fornecedores"}</h1>
        <p>
          {modoEdicao
            ? `Atualize os dados de ${fornecedor.nome || "fornecedor selecionado"}`
            : "Adicione novos fornecedores ao sistema"}
        </p>
      </div>
      <div className="fornecedor-card">
        <form className="fornecedor-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input
              ref={nomeInputRef}
              type="text"
              name="nome"
              placeholder="Digite o nome do fornecedor"
              value={fornecedor.nome}
              onChange={handleChange}
              className={camposInvalidos.nome ? "input-error" : ""}
            />
          </div>
          <div className="form-group">
            <label>CNPJ</label>
            <IMaskInput
              inputRef={cnpjInputRef}
              mask="00.000.000/0000-00"
              name="cnpj"
              placeholder="00.000.000/0000-00"
              value={fornecedor.cnpj}
              onAccept={(value) => handleMaskedChange("cnpj", value)}
              className={camposInvalidos.cnpj ? "input-error" : ""}
            />
          </div>
          <div className="form-actions">
            <button type="submit">{modoEdicao ? "Atualizar" : "Salvar"}</button>
            <button
              type="button"
              onClick={() => {
                if (modoEdicao) {
                  navigate("/gerenciamento/fornecedores");
                } else {
                  handleClear();
                }
              }}
            >
              {modoEdicao ? "Voltar" : "Limpar"}
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

export default Fornecedor;
