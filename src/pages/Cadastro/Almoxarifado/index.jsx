import React, { useState, useEffect } from "react";
import "./Almoxarifado.css";
import {
  cadastrarAlmoxarifado,
  buscarAlmoxarifadoPorID,
  atualizarAlmoxarifado,
} from "../../../services/almoxarifadoService";
import { useNavigate, useParams } from "react-router-dom";

const almoxarifadoInicial = {
  nome: "",
};

const Almoxarifado = () => {
  const [almoxarifado, setAlmoxarifado] = useState({ ...almoxarifadoInicial });
  const [mensagens, setMensagens] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const modoEdicao = Boolean(id);

  useEffect(() => {
    if (!modoEdicao) {
      return;
    }

    const carregarAlmoxarifado = async () => {
      try {
        const response = await buscarAlmoxarifadoPorID(id);
        setAlmoxarifado(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar almoxarifado", "erro");
      }
    };

    carregarAlmoxarifado();
  }, [id, modoEdicao]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAlmoxarifado({ ...almoxarifado, [name]: value });
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

  const validarAlmoxarifado = () => {
    const erros = [];

    if (!almoxarifado.nome.trim()) {
      erros.push("Nome é obrigatório");
    }
    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarAlmoxarifado();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });
      return;
    }

    try {
      if (modoEdicao) {
        await atualizarAlmoxarifado(id, almoxarifado);
        mostrarMensagem("Almoxarifado atualizado com sucesso", "sucesso");

        setTimeout(() => {
          navigate("/gerenciamento/almoxarifados");
        }, 1000);
      } else {
        await cadastrarAlmoxarifado(almoxarifado);
        mostrarMensagem("Almoxarifado cadastrado com sucesso", "sucesso");
        handleClear();
      }
    } catch (error) {
      const mensagemPadrao = modoEdicao
        ? "Erro ao atualizar almoxarifado."
        : "Erro ao cadastrar almoxarifado.";

      const mensagemErro = error.response?.data?.message || mensagemPadrao;
      mostrarMensagem(mensagemErro, "erro");
      return;
    }
  };

  const handleClear = () => {
    setAlmoxarifado({ ...almoxarifadoInicial });
  };

  return (
    <div className="almoxarifado-page">
      <div className="almoxarifado-header">
        <h1>
          {modoEdicao ? "Editar Almoxarifado" : "Cadastro de Almoxarifado"}
        </h1>
        <p>
          {modoEdicao
            ? `Atualize os dados de ${almoxarifado.nome || "almoxarifado selecionado"}`
            : "Adicione novos almoxarifados ao sistema"}
        </p>
      </div>
      <div className="almoxarifado-card">
        <form className="almoxarifado-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              name="nome"
              placeholder="Digite o nome do almoxarifado"
              value={almoxarifado.nome}
              onChange={handleChange}
            />
          </div>
          <div className="form-actions">
            <button type="submit">{modoEdicao ? "Atualizar" : "Salvar"}</button>
            <button
              type="button"
              onClick={() => {
                if (modoEdicao) {
                  navigate("/gerenciamento/almoxarifados");
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

export default Almoxarifado;
