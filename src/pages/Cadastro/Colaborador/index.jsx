import React, { useState, useEffect } from "react";
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
  const navigate = useNavigate();
  const { id } = useParams();
  const modoEdicao = Boolean(id);

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

    if (!colaborador.nome.trim()) {
      erros.push("Nome é obrigatório");
    }
    if (!colaborador.cpf.trim()) {
      erros.push("CPF é obrigatório");
    }
    if (!colaborador.cargo.trim()) {
      erros.push("Cargo é obrigatório");
    }
    if (!colaborador.telefone.trim()) {
      erros.push("Telefone é obrigatório");
    }
    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarColaborador();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });
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
              type="text"
              name="nome"
              placeholder="Digite o nome do colaborador"
              value={colaborador.nome}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>CPF</label>
              <IMaskInput
                mask="000.000.000-00"
                name="cpf"
                placeholder="000.000.000-00"
                value={colaborador.cpf}
                onAccept={(value) => setColaborador({ ...colaborador, cpf: value })}
              />
            </div>
            <div className="form-group">
              <label>Cargo</label>
              <input
                type="text"
                name="cargo"
                placeholder="Ex: Técnico, Gerente"
                value={colaborador.cargo}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Telefone</label>
            <IMaskInput
              mask="(00) 00000-0000"
              name="telefone"
              placeholder="(00) 00000-0000"
              value={colaborador.telefone}
              onAccept={(value) =>
                setColaborador({ ...colaborador, telefone: value })
              }
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
