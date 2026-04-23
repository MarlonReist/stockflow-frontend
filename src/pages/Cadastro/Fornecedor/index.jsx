import React, { useState, useEffect } from "react";
import "./Fornecedor.css";
import {
  cadastrarFornecedor,
  buscarFornecedorPorID,
  atualizarFornecedor,
} from "../../../services/fornecedorService";
import { useNavigate, useParams } from "react-router-dom";

const fornecedorInicial = {
  nome: "",
  cnpj: "",
};

const Fornecedor = () => {
  const [fornecedor, setFornecedor] = useState({ ...fornecedorInicial });
  const [mensagens, setMensagens] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const modoEdicao = Boolean(id);

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

    if (!fornecedor.nome.trim()) {
      erros.push("Nome é obrigatório");
    }
    if (!fornecedor.cnpj.trim()) {
      erros.push("CNPJ é obrigatório");
    }
    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarFornecedor();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });
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
              type="text"
              name="nome"
              placeholder="Digite o nome do fornecedor"
              value={fornecedor.nome}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>CNPJ</label>
            <input
              type="text"
              name="cnpj"
              placeholder="00.000.000/0000-00"
              value={fornecedor.cnpj}
              onChange={handleChange}
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
