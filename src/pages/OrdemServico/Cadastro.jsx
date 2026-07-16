import React, { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronsLeft,
  FiChevronsRight,
  FiRefreshCw,
  FiSearch,
  FiPrinter,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { listarClientes } from "../../services/clientesService";
import { listarColaboradores } from "../../services/colaboradorService";
import {
  cadastrarOrdemServico,
  buscarOrdemServicoPorId,
  atualizarDescricaoOrdemServico,
  gerarPdfOrdemServico,
  gerarPdfProdutosOrdemServico,
} from "../../services/ordemServicoService";
import "./CadastroOS.css";
import AnexosOSTab from "./components/AnexosOSTab";
import ProdutosOSTab from "./components/ProdutosOSTab";

const ordemInicial = {
  id: "",
  clienteId: "",
  clienteNome: "",
  colaboradorId: "",
  colaboradorNome: "",
  descricao: "",
  status: "",
};

const CadastroOrdemServico = () => {
  const [ordem, setOrdem] = useState({ ...ordemInicial });
  const [ordemSalva, setOrdemSalva] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("principal");
  const [clientes, setClientes] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [seletorClienteAberto, setSeletorClienteAberto] = useState(false);
  const [seletorColaboradorAberto, setSeletorColaboradorAberto] =
    useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState(null);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [buscaColaborador, setBuscaColaborador] = useState("");
  const [paginaClienteAtual, setPaginaClienteAtual] = useState(1);
  const [paginaColaboradorAtual, setPaginaColaboradorAtual] = useState(1);
  const [ordenacaoCliente, setOrdenacaoCliente] = useState({
    coluna: "id",
    direcao: "asc",
  });
  const [ordenacaoColaborador, setOrdenacaoColaborador] = useState({
    coluna: "id",
    direcao: "asc",
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const modoEdicao = Boolean(id);
  const ordemEncerrada =
    ordem.status === "FINALIZADA" || ordem.status === "CANCELADA";
  const dadosPrincipaisBloqueados = ordemSalva || modoEdicao;
  const descricaoBloqueada = (ordemSalva && !modoEdicao) || ordemEncerrada;
  const itensPorPagina = 10;

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
    const carregarClientes = async () => {
      try {
        const response = await listarClientes();
        setClientes(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar clientes", "erro");
      }
    };

    carregarClientes();
  }, []);

  useEffect(() => {
    const carregarColaboradores = async () => {
      try {
        const response = await listarColaboradores();
        setColaboradores(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar colaboradores", "erro");
      }
    };

    carregarColaboradores();
  }, []);

  useEffect(() => {
    if (!modoEdicao) {
      return;
    }

    const carregarOrdemServico = async () => {
      try {
        const response = await buscarOrdemServicoPorId(id);

        setOrdem({
          id: String(response.data.id ?? ""),
          status: response.data.status ?? "",
          clienteId: String(response.data.clienteId ?? ""),
          clienteNome: response.data.clienteNome ?? "",
          colaboradorId: String(response.data.colaboradorId ?? ""),
          colaboradorNome: response.data.colaboradorNome ?? "",
          descricao: response.data.descricao ?? "",
        });

        setOrdemSalva(false);
      } catch (error) {
        mostrarMensagem("Erro ao carregar ordem de serviço.", "erro");
      }
    };

    carregarOrdemServico();
  }, [id, modoEdicao]);

  const clientesFiltrados = clientes.filter((cliente) => {
    const buscaFormatada = buscaCliente.toLowerCase();

    return (
      String(cliente.id).includes(buscaFormatada) ||
      String(cliente.nome || "")
        .toLowerCase()
        .includes(buscaFormatada)
    );
  });

  const colaboradoresFiltrados = colaboradores.filter((colaborador) => {
    const buscaFormatada = buscaColaborador.toLowerCase();

    return (
      String(colaborador.id).includes(buscaFormatada) ||
      String(colaborador.nome || "")
        .toLowerCase()
        .includes(buscaFormatada)
    );
  });

  const handleOrdenarCliente = (coluna) => {
    setOrdenacaoCliente((ordenacaoAtual) => {
      if (ordenacaoAtual.coluna === coluna) {
        return {
          coluna,
          direcao: ordenacaoAtual.direcao === "asc" ? "desc" : "asc",
        };
      }

      return {
        coluna,
        direcao: "asc",
      };
    });
  };

  const handleOrdenarColaborador = (coluna) => {
    setOrdenacaoColaborador((ordenacaoAtual) => {
      if (ordenacaoAtual.coluna === coluna) {
        return {
          coluna,
          direcao: ordenacaoAtual.direcao === "asc" ? "desc" : "asc",
        };
      }

      return {
        coluna,
        direcao: "asc",
      };
    });
  };

  const clientesOrdenados = [...clientesFiltrados].sort((a, b) => {
    let valorA = a[ordenacaoCliente.coluna];
    let valorB = b[ordenacaoCliente.coluna];

    if (ordenacaoCliente.coluna === "id") {
      valorA = Number(valorA);
      valorB = Number(valorB);
    } else {
      valorA = String(valorA ?? "").toLowerCase();
      valorB = String(valorB ?? "").toLowerCase();
    }

    if (valorA < valorB) {
      return ordenacaoCliente.direcao === "asc" ? -1 : 1;
    }

    if (valorA > valorB) {
      return ordenacaoCliente.direcao === "asc" ? 1 : -1;
    }

    return 0;
  });

  const colaboradoresOrdenados = [...colaboradoresFiltrados].sort((a, b) => {
    let valorA = a[ordenacaoColaborador.coluna];
    let valorB = b[ordenacaoColaborador.coluna];

    if (ordenacaoColaborador.coluna === "id") {
      valorA = Number(valorA);
      valorB = Number(valorB);
    } else {
      valorA = String(valorA ?? "").toLowerCase();
      valorB = String(valorB ?? "").toLowerCase();
    }

    if (valorA < valorB) {
      return ordenacaoColaborador.direcao === "asc" ? -1 : 1;
    }

    if (valorA > valorB) {
      return ordenacaoColaborador.direcao === "asc" ? 1 : -1;
    }

    return 0;
  });

  const indiceInicialCliente = (paginaClienteAtual - 1) * itensPorPagina;
  const indiceFinalCliente = indiceInicialCliente + itensPorPagina;
  const clientesPaginados = clientesOrdenados.slice(
    indiceInicialCliente,
    indiceFinalCliente,
  );
  const totalPaginasCliente = Math.ceil(
    clientesOrdenados.length / itensPorPagina,
  );
  const inicioExibidoCliente =
    clientesOrdenados.length > 0 ? indiceInicialCliente + 1 : 0;
  const fimExibidoCliente = Math.min(
    indiceFinalCliente,
    clientesOrdenados.length,
  );

  const indiceInicialColaborador =
    (paginaColaboradorAtual - 1) * itensPorPagina;
  const indiceFinalColaborador = indiceInicialColaborador + itensPorPagina;
  const colaboradoresPaginados = colaboradoresOrdenados.slice(
    indiceInicialColaborador,
    indiceFinalColaborador,
  );
  const totalPaginasColaborador = Math.ceil(
    colaboradoresOrdenados.length / itensPorPagina,
  );
  const inicioExibidoColaborador =
    colaboradoresOrdenados.length > 0 ? indiceInicialColaborador + 1 : 0;
  const fimExibidoColaborador = Math.min(
    indiceFinalColaborador,
    colaboradoresOrdenados.length,
  );

  const renderIconeOrdenacaoCliente = (coluna) => {
    if (ordenacaoCliente.coluna !== coluna) {
      return null;
    }

    return ordenacaoCliente.direcao === "asc" ? (
      <FiChevronUp />
    ) : (
      <FiChevronDown />
    );
  };

  const renderIconeOrdenacaoColaborador = (coluna) => {
    if (ordenacaoColaborador.coluna !== coluna) {
      return null;
    }

    return ordenacaoColaborador.direcao === "asc" ? (
      <FiChevronUp />
    ) : (
      <FiChevronDown />
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setOrdem((ordemAtual) => ({
      ...ordemAtual,
      [name]: value,
    }));
  };

  const handleClienteIdChange = (e) => {
    const valorDigitado = e.target.value;
    const clienteEncontrado = clientes.find(
      (cliente) => String(cliente.id) === valorDigitado,
    );

    setOrdem((ordemAtual) => ({
      ...ordemAtual,
      clienteId: valorDigitado,
      clienteNome: clienteEncontrado ? clienteEncontrado.nome : "",
    }));
  };

  const handleColaboradorIdChange = (e) => {
    const valorDigitado = e.target.value;
    const colaboradorEncontrado = colaboradores.find(
      (colaborador) => String(colaborador.id) === valorDigitado,
    );

    setOrdem((ordemAtual) => ({
      ...ordemAtual,
      colaboradorId: valorDigitado,
      colaboradorNome: colaboradorEncontrado ? colaboradorEncontrado.nome : "",
    }));
  };

  const confirmarCliente = (cliente) => {
    setOrdem((ordemAtual) => ({
      ...ordemAtual,
      clienteId: String(cliente.id),
      clienteNome: cliente.nome,
    }));

    setSeletorClienteAberto(false);
    setClienteSelecionado(null);
    setBuscaCliente("");
  };

  const confirmarColaborador = (colaborador) => {
    setOrdem((ordemAtual) => ({
      ...ordemAtual,
      colaboradorId: String(colaborador.id),
      colaboradorNome: colaborador.nome,
    }));

    setSeletorColaboradorAberto(false);
    setColaboradorSelecionado(null);
    setBuscaColaborador("");
  };

  const handleImprimirOS = async () => {
    if (!ordem.id) {
      mostrarMensagem("Salve a ordem de serviço antes de imprimir.", "erro");
      return;
    }

    try {
      const response = await gerarPdfOrdemServico(ordem.id);

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });

      const pdfUrl = URL.createObjectURL(pdfBlob);
      const janelaPdf = window.open(pdfUrl, "_blank");

      if (!janelaPdf) {
        mostrarMensagem("Permita pop-ups para imprimir a OS.", "erro");
        return;
      }

      janelaPdf.onload = () => {
        janelaPdf.print();
      };

      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 10000);
    } catch (error) {
      mostrarMensagem("Erro ao gerar PDF da ordem de serviço.", "erro");
    }
  };

  const handleImprimirProdutosOS = async () => {
    if (!ordem.id) {
      mostrarMensagem(
        "Salve a ordem de serviço antes de imprimir os produtos.",
        "erro",
      );
      return;
    }

    try {
      const response = await gerarPdfProdutosOrdemServico(ordem.id);

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });

      const pdfUrl = URL.createObjectURL(pdfBlob);
      const janelaPdf = window.open(pdfUrl, "_blank");

      if (!janelaPdf) {
        mostrarMensagem(
          "Permita pop-ups para imprimir os produtos da OS.",
          "erro",
        );
        return;
      }

      janelaPdf.onload = () => {
        janelaPdf.print();
      };

      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 10000);
    } catch (error) {
      mostrarMensagem(
        "Erro ao gerar PDF de produtos da ordem de serviço.",
        "erro",
      );
    }
  };

  const handleClear = () => {
    if (modoEdicao) {
      setOrdem((ordemAtual) => ({
        ...ordemAtual,
        descricao: "",
      }));
      return;
    }

    setOrdem({ ...ordemInicial });
    setOrdemSalva(false);
    setClienteSelecionado(null);
    setColaboradorSelecionado(null);
    setBuscaCliente("");
    setBuscaColaborador("");
    setAbaAtiva("principal");
  };

  const validarOrdem = () => {
    const erros = [];

    if (modoEdicao) {
      if (!ordem.descricao.trim()) {
        erros.push("Descricao e obrigatoria.");
      }

      return erros;
    }

    if (!ordem.clienteId || !ordem.clienteNome) {
      erros.push("Selecione um cliente valido.");
    }

    if (!ordem.colaboradorId || !ordem.colaboradorNome) {
      erros.push("Selecione um colaborador valido.");
    }

    if (!ordem.descricao.trim()) {
      erros.push("Descricao e obrigatoria.");
    }

    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (ordemSalva || ordemEncerrada) {
      return;
    }

    const erros = validarOrdem();

    if (erros.length > 0) {
      erros.forEach((erro) => {
        mostrarMensagem(erro, "erro");
      });
      return;
    }

    try {
      if (modoEdicao) {
        const ordemAtualizada = {
          clienteId: Number(ordem.clienteId),
          colaboradorId: Number(ordem.colaboradorId),
          descricao: ordem.descricao.trim(),
        };

        const response = await atualizarDescricaoOrdemServico(
          id,
          ordemAtualizada,
        );

        setOrdem((ordemAtual) => ({
          ...ordemAtual,
          descricao: response.data.descricao ?? ordem.descricao.trim(),
        }));

        mostrarMensagem("Ordem de serviço atualizada com sucesso.", "sucesso");
        return;
      }

      const ordemParaEnviar = {
        clienteId: Number(ordem.clienteId),
        colaboradorId: Number(ordem.colaboradorId),
        descricao: ordem.descricao.trim(),
      };

      const response = await cadastrarOrdemServico(ordemParaEnviar);

      setOrdem({
        id: String(response.data.id ?? ""),
        status: response.data.status ?? "",
        clienteId: String(response.data.clienteId ?? ""),
        clienteNome: response.data.clienteNome ?? "",
        colaboradorId: String(response.data.colaboradorId ?? ""),
        colaboradorNome: response.data.colaboradorNome ?? "",
        descricao: response.data.descricao ?? "",
      });

      setOrdemSalva(true);
      mostrarMensagem("Ordem de serviço cadastrada com sucesso.", "sucesso");
    } catch (error) {
      const mensagemPadrao = modoEdicao
        ? "Erro ao atualizar ordem de serviço."
        : "Erro ao cadastrar ordem de serviço.";
      const mensagemErro = error.response?.data?.message || mensagemPadrao;

      mostrarMensagem(mensagemErro, "erro");
    }
  };

  return (
    <div className="cadastro-os-page">
      <div className="cadastro-os-header">
        <div className="cadastro-os-header-top">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/os")}
            aria-label="Voltar para ordens"
            title="Voltar"
          >
            <FiArrowLeft />
          </button>
          <h1>
            {modoEdicao
              ? "Editar Ordem de Serviço"
              : "Cadastro de Ordem de Serviço"}
          </h1>
        </div>
        <p>
          {modoEdicao
            ? "Atualize os dados e produtos vinculados a esta ordem"
            : "Registre uma nova ordem de serviço"}
        </p>
      </div>

      <div className="cadastro-os-card">
        <div className="cadastro-os-card-header">
          <div className="cadastro-os-tabs">
            <button
              type="button"
              className={abaAtiva === "principal" ? "active-tab" : ""}
              onClick={() => setAbaAtiva("principal")}
            >
              Principal
            </button>

            <button
              type="button"
              className={abaAtiva === "produtos" ? "active-tab" : ""}
              onClick={() => setAbaAtiva("produtos")}
              disabled={!ordem.id}
            >
              Produtos
            </button>

            <button
              type="button"
              className={abaAtiva === "anexos" ? "active-tab" : ""}
              onClick={() => setAbaAtiva("anexos")}
              disabled={!ordem.id}
            >
              Anexos
            </button>
          </div>

          {abaAtiva === "principal" && (
            <button
              type="button"
              className="print-order-button"
              onClick={handleImprimirOS}
              disabled={!ordem.id}
            >
              <FiPrinter />
              Imprimir OS
            </button>
          )}
          {abaAtiva === "produtos" && (
            <button
              type="button"
              className="print-order-button"
              onClick={handleImprimirProdutosOS}
              disabled={!ordem.id}
            >
              <FiPrinter />
              Imprimir Produtos
            </button>
          )}
        </div>
        {abaAtiva === "principal" && (
          <form className="cadastro-os-form" onSubmit={handleSubmit}>
            <div className="form-group os-id-field">
              <label>ID. OS</label>
              <input type="text" value={ordem.id} readOnly />
            </div>

            <div className="form-group">
              <label>Cliente</label>
              <div className="lookup-field">
                <input
                  type="text"
                  name="clienteId"
                  placeholder="ID"
                  value={ordem.clienteId}
                  onChange={handleClienteIdChange}
                  readOnly={dadosPrincipaisBloqueados}
                />
                <input
                  type="text"
                  name="clienteNome"
                  placeholder="Nome do cliente"
                  value={ordem.clienteNome}
                  readOnly
                />
                <button
                  type="button"
                  aria-label="Pesquisar cliente"
                  title="Pesquisar cliente"
                  disabled={dadosPrincipaisBloqueados}
                  onClick={() => {
                    setSeletorClienteAberto(true);
                    setBuscaCliente("");
                    setPaginaClienteAtual(1);
                    setClienteSelecionado(null);
                  }}
                >
                  <FiSearch />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Colaborador</label>
              <div className="lookup-field">
                <input
                  type="text"
                  name="colaboradorId"
                  placeholder="ID"
                  value={ordem.colaboradorId}
                  onChange={handleColaboradorIdChange}
                  readOnly={dadosPrincipaisBloqueados}
                />
                <input
                  type="text"
                  name="colaboradorNome"
                  placeholder="Nome do colaborador"
                  value={ordem.colaboradorNome}
                  readOnly
                />
                <button
                  type="button"
                  aria-label="Pesquisar colaborador"
                  title="Pesquisar colaborador"
                  disabled={dadosPrincipaisBloqueados}
                  onClick={() => {
                    setSeletorColaboradorAberto(true);
                    setBuscaColaborador("");
                    setPaginaColaboradorAtual(1);
                    setColaboradorSelecionado(null);
                  }}
                >
                  <FiSearch />
                </button>
              </div>
            </div>

            <div className="form-group form-group-full">
              <label>Descricao</label>
              <textarea
                name="descricao"
                placeholder="Descreva o Serviço"
                value={ordem.descricao}
                onChange={handleChange}
                readOnly={descricaoBloqueada}
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={(ordemSalva && !modoEdicao) || ordemEncerrada}
              >
                {ordemEncerrada
                  ? "Bloqueado"
                  : modoEdicao
                    ? "Atualizar"
                    : ordemSalva
                      ? "Salvo"
                      : "Salvar"}
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={ordemEncerrada}
              >
                Limpar
              </button>
              <button
                type="button"
                className="new-order-button"
                onClick={handleClear}
                disabled={!ordemSalva || modoEdicao}
              >
                Novo
              </button>
            </div>
          </form>
        )}
        {abaAtiva === "produtos" && (
          <ProdutosOSTab
            ordemId={ordem.id}
            ordemEncerrada={ordemEncerrada}
            mostrarMensagem={mostrarMensagem}
          />
        )}
        {abaAtiva === "anexos" && (
          <AnexosOSTab ordemId={ordem.id} mostrarMensagem={mostrarMensagem} />
        )}
      </div>

      {seletorClienteAberto && (
        <div className="selector-overlay">
          <div className="selector-box">
            <div className="selector-header">
              <h2>Clientes</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSeletorClienteAberto(false)}
              >
                X
              </button>
            </div>

            <div className="selector-actions">
              <input
                type="text"
                placeholder="Buscar por ID ou Nome..."
                value={buscaCliente}
                onChange={(e) => {
                  setBuscaCliente(e.target.value);
                  setPaginaClienteAtual(1);
                }}
              />
              <div className="pagination-controls selector-pagination-controls">
                <button
                  type="button"
                  onClick={() => setPaginaClienteAtual(1)}
                  disabled={paginaClienteAtual === 1}
                >
                  <FiChevronsLeft />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaginaClienteAtual((paginaAtual) =>
                      Math.max(paginaAtual - 1, 1),
                    )
                  }
                  disabled={paginaClienteAtual === 1}
                >
                  <FiChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBuscaCliente("");
                    setClienteSelecionado(null);
                    setPaginaClienteAtual(1);
                  }}
                >
                  <FiRefreshCw />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaginaClienteAtual((paginaAtual) =>
                      Math.min(paginaAtual + 1, totalPaginasCliente),
                    )
                  }
                  disabled={
                    totalPaginasCliente === 0 ||
                    paginaClienteAtual === totalPaginasCliente
                  }
                >
                  <FiChevronRight />
                </button>
                <button
                  type="button"
                  onClick={() => setPaginaClienteAtual(totalPaginasCliente)}
                  disabled={
                    totalPaginasCliente === 0 ||
                    paginaClienteAtual === totalPaginasCliente
                  }
                >
                  <FiChevronsRight />
                </button>
                <span className="total-itens">
                  {`${inicioExibidoCliente} - ${fimExibidoCliente} / ${clientesOrdenados.length}`}
                </span>
              </div>
            </div>

            <div className="selector-table-wrapper">
              <table className="selector-table">
                <thead>
                  <tr>
                    <th onClick={() => handleOrdenarCliente("id")}>
                      <span className="sortable-header">
                        ID
                        {renderIconeOrdenacaoCliente("id")}
                      </span>
                    </th>
                    <th onClick={() => handleOrdenarCliente("nome")}>
                      <span className="sortable-header">
                        Nome
                        {renderIconeOrdenacaoCliente("nome")}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clientesPaginados.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className={
                        clienteSelecionado?.id === cliente.id
                          ? "selected-row"
                          : ""
                      }
                      onClick={() => setClienteSelecionado(cliente)}
                      onDoubleClick={() => confirmarCliente(cliente)}
                    >
                      <td>{cliente.id}</td>
                      <td>{cliente.nome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="selector-footer">
              <button
                type="button"
                onClick={() => {
                  if (clienteSelecionado) {
                    confirmarCliente(clienteSelecionado);
                    return;
                  }

                  mostrarMensagem("Selecione um cliente", "erro");
                }}
              >
                Selecionar
              </button>
            </div>
          </div>
        </div>
      )}

      {seletorColaboradorAberto && (
        <div className="selector-overlay">
          <div className="selector-box">
            <div className="selector-header">
              <h2>Colaboradores</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSeletorColaboradorAberto(false)}
              >
                X
              </button>
            </div>

            <div className="selector-actions">
              <input
                type="text"
                placeholder="Buscar por ID ou Nome..."
                value={buscaColaborador}
                onChange={(e) => {
                  setBuscaColaborador(e.target.value);
                  setPaginaColaboradorAtual(1);
                }}
              />
              <div className="pagination-controls selector-pagination-controls">
                <button
                  type="button"
                  onClick={() => setPaginaColaboradorAtual(1)}
                  disabled={paginaColaboradorAtual === 1}
                >
                  <FiChevronsLeft />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaginaColaboradorAtual((paginaAtual) =>
                      Math.max(paginaAtual - 1, 1),
                    )
                  }
                  disabled={paginaColaboradorAtual === 1}
                >
                  <FiChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBuscaColaborador("");
                    setColaboradorSelecionado(null);
                    setPaginaColaboradorAtual(1);
                  }}
                >
                  <FiRefreshCw />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaginaColaboradorAtual((paginaAtual) =>
                      Math.min(paginaAtual + 1, totalPaginasColaborador),
                    )
                  }
                  disabled={
                    totalPaginasColaborador === 0 ||
                    paginaColaboradorAtual === totalPaginasColaborador
                  }
                >
                  <FiChevronRight />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaginaColaboradorAtual(totalPaginasColaborador)
                  }
                  disabled={
                    totalPaginasColaborador === 0 ||
                    paginaColaboradorAtual === totalPaginasColaborador
                  }
                >
                  <FiChevronsRight />
                </button>
                <span className="total-itens">
                  {`${inicioExibidoColaborador} - ${fimExibidoColaborador} / ${colaboradoresOrdenados.length}`}
                </span>
              </div>
            </div>

            <div className="selector-table-wrapper">
              <table className="selector-table">
                <thead>
                  <tr>
                    <th onClick={() => handleOrdenarColaborador("id")}>
                      <span className="sortable-header">
                        ID
                        {renderIconeOrdenacaoColaborador("id")}
                      </span>
                    </th>
                    <th onClick={() => handleOrdenarColaborador("nome")}>
                      <span className="sortable-header">
                        Nome
                        {renderIconeOrdenacaoColaborador("nome")}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {colaboradoresPaginados.map((colaborador) => (
                    <tr
                      key={colaborador.id}
                      className={
                        colaboradorSelecionado?.id === colaborador.id
                          ? "selected-row"
                          : ""
                      }
                      onClick={() => setColaboradorSelecionado(colaborador)}
                      onDoubleClick={() => confirmarColaborador(colaborador)}
                    >
                      <td>{colaborador.id}</td>
                      <td>{colaborador.nome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="selector-footer">
              <button
                type="button"
                onClick={() => {
                  if (colaboradorSelecionado) {
                    confirmarColaborador(colaboradorSelecionado);
                    return;
                  }

                  mostrarMensagem("Selecione um colaborador", "erro");
                }}
              >
                Selecionar
              </button>
            </div>
          </div>
        </div>
      )}

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

export default CadastroOrdemServico;
