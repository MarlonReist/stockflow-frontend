import React, { useState, useEffect, useRef } from "react";
import "./Categoria.css";
import {
  cadastrarCategoria,
  buscarCategoriaPorID,
  atualizarCategoria,
} from "../../../services/categoriaService";
import { useNavigate, useParams } from "react-router-dom";

const categoriaInicial = {
  nome: "",
};

const Categorias = () => {
  const [categoria, setCategoria] = useState({ ...categoriaInicial });
  const [mensagens, setMensagens] = useState([]);
  const [camposInvalidos, setCamposInvalidos] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();
  const modoEdicao = Boolean(id);
  const nomeInputRef = useRef(null);

  useEffect(() => {
    if (!modoEdicao) {
      return;
    }

    const carregarCategoria = async () => {
      try {
        const response = await buscarCategoriaPorID(id);
        setCategoria(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar categoria", "erro");
      }
    };

    carregarCategoria();
  }, [id, modoEdicao]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCategoria({ ...categoria, [name]: value });

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

  const validarCategoria = () => {
    const erros = [];
    const camposComErro = {};

    if (!categoria.nome.trim()) {
      erros.push("Nome é obrigatório");
      camposComErro.nome = true;
    }

    setCamposInvalidos(camposComErro);

    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarCategoria();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });

      if (camposInvalidos.nome || !categoria.nome.trim()) {
        nomeInputRef.current?.focus();
      }

      return;
    }

    try {
      if (modoEdicao) {
        await atualizarCategoria(id, categoria);
        mostrarMensagem("Categoria atualizada com sucesso", "sucesso");

        setTimeout(() => {
          navigate("/gerenciamento/categorias");
        }, 1000);
      } else {
        await cadastrarCategoria(categoria);
        mostrarMensagem("Categoria cadastrada com sucesso", "sucesso");
        handleClear();
      }
    } catch (error) {
      const mensagemPadrao = modoEdicao
        ? "Erro ao atualizar categoria."
        : "Erro ao cadastrar categoria.";

      const mensagemErro = error.response?.data?.message || mensagemPadrao;
      mostrarMensagem(mensagemErro, "erro");
      return;
    }
  };

  const handleClear = () => {
    setCategoria({ ...categoriaInicial });
    setCamposInvalidos({});
  };

  return (
    <div className="categorias-page">
      <div className="categorias-header">
        <h1>{modoEdicao ? "Editar Categoria" : "Cadastro de Categorias"}</h1>
        <p>
          {modoEdicao
            ? `Atualize os dados de ${categoria.nome || "categoria selecionada"}`
            : "Adicione novas categorias ao sistema"}
        </p>
      </div>
      <div className="categorias-card">
        <form className="categorias-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input
              ref={nomeInputRef}
              type="text"
              name="nome"
              placeholder="Digite o nome da categoria"
              value={categoria.nome}
              onChange={handleChange}
              className={camposInvalidos.nome ? "input-error" : ""}
            />
          </div>
          <div className="form-actions">
            <button type="submit">{modoEdicao ? "Atualizar" : "Salvar"}</button>
            <button
              type="button"
              onClick={() => {
                if (modoEdicao) {
                  navigate("/gerenciamento/categorias");
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

export default Categorias;
