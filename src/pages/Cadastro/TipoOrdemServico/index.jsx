import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  atualizarTipoOrdemServico,
  buscarTipoOrdemServicoPorId,
  cadastrarTipoOrdemServico,
} from "../../../services/tipoOrdemServicoService";
import "./TipoOrdemServico.css";

const tipoInicial = {
  nome: "",
};

const TipoOrdemServico = () => {
  const [tipo, setTipo] = useState({ ...tipoInicial });
  const [mensagens, setMensagens] = useState([]);
  const [camposInvalidos, setCamposInvalidos] = useState({});

  const navigate = useNavigate();
  const { id } = useParams();
  const modoEdicao = Boolean(id);
  const nomeInputRef = useRef(null);

  const mostrarMensagem = (texto, tipoMensagem) => {
    const mensagemId = `${Date.now()}-${Math.random()}`;

    setMensagens((mensagensAtuais) => [
      ...mensagensAtuais,
      {
        id: mensagemId,
        texto,
        tipo: tipoMensagem,
      },
    ]);

    setTimeout(() => {
      setMensagens((mensagensAtuais) =>
        mensagensAtuais.filter((mensagem) => mensagem.id !== mensagemId),
      );
    }, 3000);
  };

  useEffect(() => {
    if (!modoEdicao) {
      return;
    }

    const carregarTipo = async () => {
      try {
        const response = await buscarTipoOrdemServicoPorId(id);

        setTipo({
          nome: response.data.nome ?? "",
        });
      } catch (error) {
        mostrarMensagem(
          error.response?.data?.message ||
            "Erro ao carregar tipo de ordem de serviço.",
          "erro",
        );
      }
    };

    carregarTipo();
  }, [id, modoEdicao]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setTipo((tipoAtual) => ({
      ...tipoAtual,
      [name]: value,
    }));

    if (camposInvalidos[name]) {
      setCamposInvalidos((camposAtuais) => ({
        ...camposAtuais,
        [name]: false,
      }));
    }
  };

  const validarTipo = () => {
    const erros = [];
    const camposComErro = {};

    if (!tipo.nome.trim()) {
      erros.push("Nome é obrigatório.");
      camposComErro.nome = true;
    }

    setCamposInvalidos(camposComErro);
    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarTipo();

    if (erros.length > 0) {
      erros.forEach((erro) => mostrarMensagem(erro, "erro"));
      nomeInputRef.current?.focus();
      return;
    }

    const dadosEnvio = {
      nome: tipo.nome.trim(),
    };

    try {
      if (modoEdicao) {
        await atualizarTipoOrdemServico(id, dadosEnvio);
        mostrarMensagem(
          "Tipo de ordem de serviço atualizado com sucesso.",
          "sucesso",
        );

        setTimeout(() => {
          navigate("/gerenciamento/tipos-os");
        }, 1000);

        return;
      }

      await cadastrarTipoOrdemServico(dadosEnvio);
      mostrarMensagem(
        "Tipo de ordem de serviço cadastrado com sucesso.",
        "sucesso",
      );

      setTipo({ ...tipoInicial });
      setCamposInvalidos({});
    } catch (error) {
      const mensagemPadrao = modoEdicao
        ? "Erro ao atualizar tipo de ordem de serviço."
        : "Erro ao cadastrar tipo de ordem de serviço.";

      mostrarMensagem(error.response?.data?.message || mensagemPadrao, "erro");
    }
  };

  const handleClear = () => {
    setTipo({ ...tipoInicial });
    setCamposInvalidos({});
  };

  return (
    <div className="tipo-os-page cadastro-base-page">
      <div className="tipo-os-header cadastro-base-header">
        <h1>
          {modoEdicao
            ? "Editar Tipo de Ordem de Serviço"
            : "Cadastro de Tipos de Ordem de Serviço"}
        </h1>

        <p>
          {modoEdicao
            ? `Atualize os dados de ${tipo.nome || "tipo selecionado"}`
            : "Adicione novos tipos de ordem de serviço"}
        </p>
      </div>

      <div className="toast-container" role="status" aria-live="polite">
        {mensagens.map((mensagem) => (
          <div
            key={mensagem.id}
            className={`form-message form-message-${mensagem.tipo}`}
          >
            {mensagem.texto}
          </div>
        ))}
      </div>

      <div className="tipo-os-card cadastro-base-card">
        <form className="tipo-os-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>

            <input
              ref={nomeInputRef}
              type="text"
              name="nome"
              placeholder="Digite o nome do tipo"
              value={tipo.nome}
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
                  navigate("/gerenciamento/tipos-os");
                  return;
                }

                handleClear();
              }}
            >
              {modoEdicao ? "Voltar" : "Limpar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TipoOrdemServico;
