import React, { useState, useEffect, useRef } from "react";
import "./Produto.css";
import {
  cadastrarProduto,
  buscarProdutoPorID,
  atualizarProduto,
} from "../../../services/produtoService";
import { listarCategorias } from "../../../services/categoriaService";
import { IMaskInput } from "react-imask";
import { useNavigate, useParams } from "react-router-dom";

const produtoInicial = {
  nome: "",
  preco: "",
  categoriaId: "",
  unidadeMedida: "",
};

const Produto = () => {
  const [produto, setProduto] = useState({ ...produtoInicial });
  const [categorias, setCategorias] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [camposInvalidos, setCamposInvalidos] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();
  const modoEdicao = Boolean(id);
  const nomeInputRef = useRef(null);
  const precoInputRef = useRef(null);
  const categoriaSelectRef = useRef(null);
  const unidadeMedidaSelectRef = useRef(null);

  useEffect(() => {
    if (!modoEdicao) {
      return;
    }

    const carregarProduto = async () => {
      try {
        const response = await buscarProdutoPorID(id);
        setProduto({
          nome: response.data.nome,
          preco: String(response.data.preco.toFixed(2).replace(".", ",")),
          categoriaId: String(response.data.categoriaId),
          unidadeMedida: response.data.unidadeMedida,
        });
      } catch (error) {
        mostrarMensagem("Erro ao carregar produto", "erro");
      }
    };

    carregarProduto();
  }, [id, modoEdicao]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProduto({ ...produto, [name]: value });

    if (camposInvalidos[name]) {
      setCamposInvalidos((camposAtuais) => ({
        ...camposAtuais,
        [name]: false,
      }));
    }
  };

  const handleMaskedChange = (name, value) => {
    setProduto((produtoAtual) => ({
      ...produtoAtual,
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

  useEffect(() => {
    const buscarCategorias = async () => {
      try {
        const response = await listarCategorias();
        setCategorias(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar categoria", "erro");
      }
    };
    buscarCategorias();
  }, []);

  const validarProduto = () => {
    const erros = [];
    const camposComErro = {};

    if (!produto.nome.trim()) {
      erros.push("Nome é obrigatório");
      camposComErro.nome = true;
    }
    if (!produto.preco.trim()) {
      erros.push("Preço é obrigatório");
      camposComErro.preco = true;
    }
    if (!produto.categoriaId.trim()) {
      erros.push("Categoria é obrigatório");
      camposComErro.categoriaId = true;
    }
    if (!produto.unidadeMedida.trim()) {
      erros.push("Unidade de Medida é obrigatório");
      camposComErro.unidadeMedida = true;
    }

    setCamposInvalidos(camposComErro);

    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const produtoParaEnviar = {
      ...produto,
      preco: Number(produto.preco.replace(/\./g, "").replace(",", ".")),
    };

    const erros = validarProduto();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });

      if (!produto.nome.trim()) {
        nomeInputRef.current?.focus();
      } else if (!produto.preco.trim()) {
        precoInputRef.current?.focus();
      } else if (!produto.categoriaId.trim()) {
        categoriaSelectRef.current?.focus();
      } else if (!produto.unidadeMedida.trim()) {
        unidadeMedidaSelectRef.current?.focus();
      }

      return;
    }

    try {
      if (modoEdicao) {
        await atualizarProduto(id, produtoParaEnviar);
        mostrarMensagem("Produto atualizado com sucesso", "sucesso");

        setTimeout(() => {
          navigate("/gerenciamento/produtos");
        }, 1000);
      } else {
        await cadastrarProduto(produtoParaEnviar);
        mostrarMensagem("Produto cadastrado com sucesso", "sucesso");
        handleClear();
      }
    } catch (error) {
      const mensagemPadrao = modoEdicao
        ? "Erro ao atualizar produto."
        : "Erro ao cadastrar produto.";

      const mensagemErro = error.response?.data?.message || mensagemPadrao;
      mostrarMensagem(mensagemErro, "erro");
      return;
    }
  };

  const handleClear = () => {
    setProduto({ ...produtoInicial });
    setCamposInvalidos({});
  };

  return (
    <div className="produto-page">
      <div className="produto-header">
        <h1>{modoEdicao ? "Editar Produto" : "Cadastro de Produto"}</h1>
        <p>
          {modoEdicao
            ? "Atualize os dados do produto selecionado"
            : "Adicione novos produtos ao sistema"}
        </p>
      </div>
      <div className="produto-card">
        <form className="produto-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input
              ref={nomeInputRef}
              type="text"
              name="nome"
              placeholder="Digite o nome do produto"
              value={produto.nome}
              onChange={handleChange}
              className={camposInvalidos.nome ? "input-error" : ""}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Preço</label>
              <IMaskInput
                inputRef={precoInputRef}
                mask={Number}
                scale={2}
                radix=","
                thousandsSeparator="."
                name="preco"
                placeholder="Digite o preço"
                padFractionalZeros={true}
                normalizeZeros={true}
                value={produto.preco}
                onAccept={(value) => handleMaskedChange("preco", value)}
                className={camposInvalidos.preco ? "input-error" : ""}
              />
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select
                ref={categoriaSelectRef}
                name="categoriaId"
                value={produto.categoriaId}
                onChange={handleChange}
                className={camposInvalidos.categoriaId ? "input-error" : ""}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Unidade de Medida</label>
            <select
              ref={unidadeMedidaSelectRef}
              name="unidadeMedida"
              value={produto.unidadeMedida}
              onChange={handleChange}
              className={camposInvalidos.unidadeMedida ? "input-error" : ""}
            >
              <option value=""> Selecione uma unidade</option>
              <option value="UNIDADES">Unidades</option>
              <option value="METRO">Metro</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit">{modoEdicao ? "Atualizar" : "Salvar"}</button>
            <button
              type="button"
              onClick={() => {
                if (modoEdicao) {
                  navigate("/gerenciamento/produtos");
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

export default Produto;
