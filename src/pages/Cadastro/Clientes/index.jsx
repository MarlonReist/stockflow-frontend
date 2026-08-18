import React, { useEffect, useRef, useState } from "react";
import "./Clientes.css";
import {
  cadastrarCliente,
  buscarClientePorID,
  atualizarCliente,
} from "../../../services/clientesService";
import { useNavigate, useParams } from "react-router-dom";
import { IMaskInput } from "react-imask";


const clienteInicial = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  endereco: "",
};

const Clientes = () => {
  const [cliente, setCliente] = useState({ ...clienteInicial });
  const [mensagens, setMensagens] = useState([]);
  const [camposInvalidos, setCamposInvalidos] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();
  const modoEdicao = Boolean(id);
  const nomeInputRef = useRef(null);
  const cpfInputRef = useRef(null);
  const telefoneInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const enderecoInputRef = useRef(null);

  useEffect(() => {
    if (!modoEdicao) {
      return;
    }

    const carregarCliente = async () => {
      try {
        const response = await buscarClientePorID(id);
        setCliente(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar cliente", "erro");
      }
    };

    carregarCliente();
  }, [id, modoEdicao]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCliente({ ...cliente, [name]: value });

    if (camposInvalidos[name]) {
      setCamposInvalidos((camposAtuais) => ({
        ...camposAtuais,
        [name]: false,
      }));
    }
  };

  const handleMaskedChange = (name, value) => {
    setCliente((clienteAtual) => ({
      ...clienteAtual,
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

  const validarCliente = () => {
    const erros = [];
    const camposComErro = {};

    if (!cliente.nome.trim()) {
      erros.push("Nome é obrigatório");
      camposComErro.nome = true;
    }
    if (!cliente.cpf.trim()) {
      erros.push("CPF é obrigatório");
      camposComErro.cpf = true;
    }
    if (!cliente.telefone.trim()) {
      erros.push("Telefone é obrigatório");
      camposComErro.telefone = true;
    }
    if (!cliente.email.trim()) {
      erros.push("Email é obrigatório");
      camposComErro.email = true;
    }
    if (!cliente.endereco.trim()) {
      erros.push("Endereço é obrigatório");
      camposComErro.endereco = true;
    }

    setCamposInvalidos(camposComErro);

    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarCliente();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });

      if (!cliente.nome.trim()) {
        nomeInputRef.current?.focus();
      } else if (!cliente.cpf.trim()) {
        cpfInputRef.current?.focus();
      } else if (!cliente.telefone.trim()) {
        telefoneInputRef.current?.focus();
      } else if (!cliente.email.trim()) {
        emailInputRef.current?.focus();
      } else if (!cliente.endereco.trim()) {
        enderecoInputRef.current?.focus();
      }

      return;
    }

    try {
      if (modoEdicao) {
        await atualizarCliente(id, cliente);
        mostrarMensagem("Cliente atualizado com sucesso", "sucesso");

        setTimeout(() => {
          navigate("/gerenciamento/clientes");
        }, 1000);
      } else {
        await cadastrarCliente(cliente);
        mostrarMensagem("Cliente cadastrado com sucesso", "sucesso");
        handleClear();
      }
    } catch (error) {
      const mensagemPadrao = modoEdicao
        ? "Erro ao atualizar cliente."
        : "Erro ao cadastrar cliente.";

      const mensagemErro = error.response?.data?.message || mensagemPadrao;
      mostrarMensagem(mensagemErro, "erro");
      return;
    }
  };
  const handleClear = () => {
    setCliente({ ...clienteInicial });
    setCamposInvalidos({});
  };

  return (
    <div className="clientes-page">
      <div className="clientes-header">
        <h1>{modoEdicao ? "Editar Cliente" : "Cadastro de Clientes"}</h1>
        <p>
          {modoEdicao
            ? `Atualize os dados de ${cliente.nome || "cliente selecionado"}`
            : "Adicione novos clientes ao sistema"}
        </p>
      </div>
      <div className="clientes-card">
        <form className="clientes-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input
              ref={nomeInputRef}
              type="text"
              name="nome"
              placeholder="Digite o nome do cliente"
              value={cliente.nome}
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
                value={cliente.cpf}
                onAccept={(value) => handleMaskedChange("cpf", value)}
                className={camposInvalidos.cpf ? "input-error" : ""}
              />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <IMaskInput
                inputRef={telefoneInputRef}
                mask="(00) 00000-0000"
                name="telefone"
                placeholder="(00) 00000-0000"
                value={cliente.telefone}
                onAccept={(value) => handleMaskedChange("telefone", value)}
                className={camposInvalidos.telefone ? "input-error" : ""}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              ref={emailInputRef}
              type="email"
              name="email"
              placeholder="exemplo@email.com"
              value={cliente.email}
              onChange={handleChange}
              className={camposInvalidos.email ? "input-error" : ""}
            />
          </div>
          <div className="form-group">
            <label>Endereço</label>
            <input
              ref={enderecoInputRef}
              type="text"
              name="endereco"
              placeholder="Rua, Número, Bairro, cidade, UF"
              value={cliente.endereco}
              onChange={handleChange}
              className={camposInvalidos.endereco ? "input-error" : ""}
            />
          </div>
          <div className="form-actions">
            <button type="submit">{modoEdicao ? "Atualizar" : "Salvar"}</button>
            <button
              type="button"
              onClick={() => {
                if (modoEdicao) {
                  navigate("/gerenciamento/clientes");
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

export default Clientes;
