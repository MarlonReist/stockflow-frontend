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
  tipoPessoa: "FISICA",
  nome: "",
  cpf: "",
  cnpj: "",
  responsavelContato: "",
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
  const tipoPessoaInputRef = useRef(null);
  const nomeInputRef = useRef(null);
  const cpfInputRef = useRef(null);
  const cnpjInputRef = useRef(null);
  const responsavelContatoInputRef = useRef(null);
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
        const dados = response.data;

        setCliente({
          tipoPessoa: dados.tipoPessoa ?? "FISICA",
          nome: dados.nome ?? "",
          cpf: dados.cpf ?? "",
          cnpj: dados.cnpj ?? "",
          responsavelContato: dados.responsavelContato ?? "",
          telefone: dados.telefone ?? "",
          email: dados.email ?? "",
          endereco: dados.endereco ?? "",
        });
      } catch (error) {
        mostrarMensagem("Erro ao carregar cliente", "erro");
      }
    };

    carregarCliente();
  }, [id, modoEdicao]);

  const handleTipoPessoaChange = (e) => {
    const novoTipo = e.target.value;

    setCliente((clienteAtual) => ({
      ...clienteAtual,
      tipoPessoa: novoTipo,
      cpf: novoTipo === "FISICA" ? clienteAtual.cpf : "",
      cnpj: novoTipo === "JURIDICA" ? clienteAtual.cnpj : "",
      responsavelContato:
        novoTipo === "JURIDICA" ? clienteAtual.responsavelContato : "",
    }));

    setCamposInvalidos((camposAtuais) => ({
      ...camposAtuais,
      tipoPessoa: false,
      ...(novoTipo === "FISICA"
        ? { cnpj: false, responsavelContato: false }
        : { cpf: false }),
    }));
  };

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

    if (!["FISICA", "JURIDICA"].includes(cliente.tipoPessoa)) {
      erros.push("Selecione um tipo de pessoa válido");
      camposComErro.tipoPessoa = true;
    }
    if (!cliente.nome.trim()) {
      erros.push("Nome é obrigatório");
      camposComErro.nome = true;
    }
    if (cliente.tipoPessoa === "FISICA" && !cliente.cpf.trim()) {
      erros.push("CPF é obrigatório");
      camposComErro.cpf = true;
    }
    if (cliente.tipoPessoa === "JURIDICA" && !cliente.cnpj.trim()) {
      erros.push("CNPJ é obrigatório");
      camposComErro.cnpj = true;
    }
    if (!cliente.telefone.trim()) {
      erros.push("Telefone é obrigatório");
      camposComErro.telefone = true;
    }
    if (
      cliente.tipoPessoa === "JURIDICA" &&
      !cliente.responsavelContato.trim()
    ) {
      erros.push("Responsável pelo contato é obrigatório");
      camposComErro.responsavelContato = true;
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

      if (!["FISICA", "JURIDICA"].includes(cliente.tipoPessoa)) {
        tipoPessoaInputRef.current?.focus();
      } else if (!cliente.nome.trim()) {
        nomeInputRef.current?.focus();
      } else if (cliente.tipoPessoa === "FISICA" && !cliente.cpf.trim()) {
        cpfInputRef.current?.focus();
      } else if (cliente.tipoPessoa === "JURIDICA" && !cliente.cnpj.trim()) {
        cnpjInputRef.current?.focus();
      } else if (!cliente.telefone.trim()) {
        telefoneInputRef.current?.focus();
      } else if (
        cliente.tipoPessoa === "JURIDICA" &&
        !cliente.responsavelContato.trim()
      ) {
        responsavelContatoInputRef.current?.focus();
      } else if (!cliente.email.trim()) {
        emailInputRef.current?.focus();
      } else if (!cliente.endereco.trim()) {
        enderecoInputRef.current?.focus();
      }

      return;
    }

    const dadosEnvio = {
      tipoPessoa: cliente.tipoPessoa,
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email,
      endereco: cliente.endereco,
      ...(cliente.tipoPessoa === "FISICA"
        ? { cpf: cliente.cpf }
        : {
            cnpj: cliente.cnpj,
            responsavelContato: cliente.responsavelContato,
          }),
    };

    try {
      if (modoEdicao) {
        await atualizarCliente(id, dadosEnvio);
        mostrarMensagem("Cliente atualizado com sucesso", "sucesso");

        setTimeout(() => {
          navigate("/gerenciamento/clientes");
        }, 1000);
      } else {
        await cadastrarCliente(dadosEnvio);
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
    <div className="clientes-page cadastro-base-page">
      <div className="clientes-header cadastro-base-header">
        <h1>{modoEdicao ? "Editar Cliente" : "Cadastro de Clientes"}</h1>
        <p>
          {modoEdicao
            ? `Atualize os dados de ${cliente.nome || "cliente selecionado"}`
            : "Adicione novos clientes ao sistema"}
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
      <div className="clientes-card cadastro-base-card">
        <form className="clientes-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tipoPessoa">Tipo de Pessoa</label>
            <select
              id="tipoPessoa"
              ref={tipoPessoaInputRef}
              name="tipoPessoa"
              value={cliente.tipoPessoa}
              onChange={handleTipoPessoaChange}
              className={camposInvalidos.tipoPessoa ? "input-error" : ""}
            >
              <option value="FISICA">Pessoa Física</option>
              <option value="JURIDICA">Pessoa Jurídica</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              {cliente.tipoPessoa === "JURIDICA" ? "Nome/Razão Social" : "Nome"}
            </label>
            <input
              ref={nomeInputRef}
              type="text"
              name="nome"
              placeholder={
                cliente.tipoPessoa === "JURIDICA"
                  ? "Digite o nome ou razão social da empresa"
                  : "Digite o nome do cliente"
              }
              value={cliente.nome}
              onChange={handleChange}
              className={camposInvalidos.nome ? "input-error" : ""}
            />
          </div>
          <div className="form-row">
            {cliente.tipoPessoa === "FISICA" ? (
              <div className="form-group">
                <label htmlFor="cpf">CPF</label>
                <IMaskInput
                  key="cpf"
                  id="cpf"
                  inputRef={cpfInputRef}
                  mask="000.000.000-00"
                  name="cpf"
                  placeholder="000.000.000-00"
                  value={cliente.cpf}
                  onAccept={(value) => handleMaskedChange("cpf", value)}
                  className={camposInvalidos.cpf ? "input-error" : ""}
                />
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="cnpj">CNPJ</label>
                <IMaskInput
                  key="cnpj"
                  id="cnpj"
                  inputRef={cnpjInputRef}
                  mask="00.000.000/0000-00"
                  name="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={cliente.cnpj}
                  onAccept={(value) => handleMaskedChange("cnpj", value)}
                  className={camposInvalidos.cnpj ? "input-error" : ""}
                />
              </div>
            )}
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
          {cliente.tipoPessoa === "JURIDICA" && (
            <div className="form-group">
              <label htmlFor="responsavelContato">
                Responsável pelo contato
              </label>
              <input
                id="responsavelContato"
                ref={responsavelContatoInputRef}
                type="text"
                name="responsavelContato"
                placeholder="Digite o nome do responsável"
                value={cliente.responsavelContato}
                onChange={handleChange}
                className={
                  camposInvalidos.responsavelContato ? "input-error" : ""
                }
              />
            </div>
          )}
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
    </div>
  );
};

export default Clientes;
