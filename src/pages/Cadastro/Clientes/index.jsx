import React, { useEffect, useState } from "react";
import "./Clientes.css";
import {
  cadastrarCliente,
  buscarClientePorID,
  atualizarCliente,
} from "../../../services/clientesService";
import {useNavigate, useParams } from "react-router-dom";

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
  const navigate = useNavigate();
  const { id } = useParams();
  const modoEdicao = Boolean(id);

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

    if (!cliente.nome.trim()) {
      erros.push("Nome é obrigatório");
    }
    if (!cliente.cpf.trim()) {
      erros.push("CPF é obrigatório");
    }
    if (!cliente.telefone.trim()) {
      erros.push("Telefone é obrigatório");
    }
    if (!cliente.email.trim()) {
      erros.push("Email é obrigatório");
    }
    if (!cliente.endereco.trim()) {
      erros.push("Endereço é obrigatório");
    }
    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erros = validarCliente();
    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });
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
              type="text"
              name="nome"
              placeholder="Digite o nome do cliente"
              value={cliente.nome}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>CPF</label>
              <input
                type="text"
                name="cpf"
                placeholder="000.000.000-00"
                value={cliente.cpf}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input
                type="text"
                name="telefone"
                placeholder="(00) 00000-0000"
                value={cliente.telefone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="exemplo@email.com"
              value={cliente.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Endereço</label>
            <input
              type="text"
              name="endereco"
              placeholder="Rua, Número, Bairro, cidade, UF"
              value={cliente.endereco}
              onChange={handleChange}
            />
          </div>
          <div className="form-actions">
            <button type="submit">{modoEdicao ? "Atualizar" : "Salvar"}</button>
            <button type="button" onClick={handleClear}>
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

export default Clientes;
