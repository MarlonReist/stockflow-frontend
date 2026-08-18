import React, { useState, useEffect, useRef } from "react";
import "./Colaborador.css";
import {
  cadastrarColaborador,
  buscarColaboradorPorId,
  atualizarColaborador,
} from "../../../services/colaboradorService";
import { useNavigate, useParams } from "react-router-dom";
import { IMaskInput } from "react-imask";

const colaboradorInicial = {
  nome: "",
  cpf: "",
  cargo: "",
  telefone: "",
};

const Colaborador = () => {
  const [colaborador, setColaborador] = useState({ ...colaboradorInicial });
  const [mensagens, setMensagens] = useState([]);
  const [camposInvalidos, setCamposInvalidos] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();
  const modoEdicao = Boolean(id);
  const nomeInputRef = useRef(null);
  const cpfInputRef = useRef(null);
  const cargoInputRef = useRef(null);
  const telefoneInputRef = useRef(null);

  useEffect(() => {
    if (!modoEdicao) {
      return;
    }

    const carregarColaborador = async () => {
      try {
        const response = await buscarColaboradorPorId(id);
        setColaborador(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar colaborador", "erro");
      }
    };

    carregarColaborador();
  }, [id, modoEdicao]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setColaborador({ ...colaborador, [name]: value });

    if (camposInvalidos[name]) {
      setCamposInvalidos((camposAtuais) => ({
        ...camposAtuais,
        [name]: false,
      }));
    }
  };

  const handleMaskedChange = (name, value) => {
    setColaborador((colaboradorAtual) => ({
      ...colaboradorAtual,
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

  const validarColaborador = () => {
    const erros = [];
    const camposComErro = {};

    if (!colaborador.nome.trim()) {
      erros.push("Nome é obrigatório");
      camposComErro.nome = true;
    }
    if (!colaborador.cpf.trim()) {
      erros.push("CPF é obrigatório");
      camposComErro.cpf = true;
    }
    if (!colaborador.cargo.trim()) {
      erros.push("Cargo é obrigatório");
      camposComErro.cargo = true;
    }
    if (!colaborador.telefone.trim()) {
      erros.push("Telefone é obrigatório");
      camposComErro.telefone = true;
    }

    setCamposInvalidos(camposComErro);

    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarColaborador();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });

      if (!colaborador.nome.trim()) {
        nomeInputRef.current?.focus();
      } else if (!colaborador.cpf.trim()) {
        cpfInputRef.current?.focus();
      } else if (!colaborador.cargo.trim()) {
        cargoInputRef.current?.focus();
      } else if (!colaborador.telefone.trim()) {
        telefoneInputRef.current?.focus();
      }

      return;
    }

    try {
      if (modoEdicao) {
        await atualizarColaborador(id, colaborador);
        mostrarMensagem("Colaborador atualizado com sucesso", "sucesso");

        setTimeout(() => {
          navigate("/gerenciamento/colaboradores");
        }, 1000);
      } else {
        await cadastrarColaborador(colaborador);
        mostrarMensagem("Colaborador cadastrado com sucesso", "sucesso");
        handleClear();
      }
    } catch (error) {
      const mensagemPadrao = modoEdicao
        ? "Erro ao atualizar colaborador."
        : "Erro ao cadastrar colaborador.";

      const mensagemErro = error.response?.data?.message || mensagemPadrao;
      mostrarMensagem(mensagemErro, "erro");
      return;
    }
  };

  const handleClear = () => {
    setColaborador({ ...colaboradorInicial });
    setCamposInvalidos({});
  };

  return (
    <div className="colaborador-page">
      <div className="colaborador-header">
        <h1>{modoEdicao ? "Editar Colaborador" : "Cadastro de Colaborador"}</h1>
        <p>
          {modoEdicao
            ? `Atualize os dados de ${colaborador.nome || "colaborador selecionado"}`
            : "Adicione novos colaboradores ao sistema"}
        </p>
      </div>
      <div className="colaborador-card">
        <form className="colaborador-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input
              ref={nomeInputRef}
              type="text"
              name="nome"
              placeholder="Digite o nome do colaborador"
              value={colaborador.nome}
              onChange={handleChange}
              className={camposInvalidos.nome ? "input-error" : ""}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>CPF</label>
              <IMaskInput
                inputRef={cpfInputRef}
                mask="000.000.000-00"
                name="cpf"
                placeholder="000.000.000-00"
                value={colaborador.cpf}
                onAccept={(value) => handleMaskedChange("cpf", value)}
                className={camposInvalidos.cpf ? "input-error" : ""}
              />
            </div>
            <div className="form-group">
              <label>Cargo</label>
              <input
                ref={cargoInputRef}
                type="text"
                name="cargo"
                placeholder="Ex: Técnico, Gerente"
                value={colaborador.cargo}
                onChange={handleChange}
                className={camposInvalidos.cargo ? "input-error" : ""}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Telefone</label>
            <IMaskInput
              inputRef={telefoneInputRef}
              mask="(00) 00000-0000"
              name="telefone"
              placeholder="(00) 00000-0000"
              value={colaborador.telefone}
              onAccept={(value) => handleMaskedChange("telefone", value)}
              className={camposInvalidos.telefone ? "input-error" : ""}
            />
          </div>
          <div className="form-actions">
            <button type="submit">{modoEdicao ? "Atualizar" : "Salvar"}</button>
            <button
              type="button"
              onClick={() => {
                if (modoEdicao) {
                  navigate("/gerenciamento/colaboradores");
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

export default Colaborador;
