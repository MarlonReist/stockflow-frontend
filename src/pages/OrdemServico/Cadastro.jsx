import React, { useEffect, useRef, useState } from "react";
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
  atualizarTipoDaOrdemServico,
  agendarOrdemServico,
  iniciarAtendimentoOrdemServico,
  concluirAtendimentoOrdemServico,
} from "../../services/ordemServicoService";
import { listarTiposOrdemServicoAtivos } from "../../services/tipoOrdemServicoService";
import "./CadastroOS.css";
import AnexosOSTab from "./components/AnexosOSTab";
import ProdutosOSTab from "./components/ProdutosOSTab";

const formatarDataHoraParaInput = (valor) => {
  if (!valor) {
    return "";
  }

  return String(valor).slice(0, 16);
};

const formatarDataHoraExibicao = (valor) => {
  if (!valor) {
    return "-";
  }

  const [data, horario = ""] = String(valor).split("T");
  const [ano, mes, dia] = data.split("-");

  if (!ano || !mes || !dia) {
    return "-";
  }

  const horaMinuto = horario.slice(0, 5);

  return horaMinuto
    ? `${dia}/${mes}/${ano} ${horaMinuto}`
    : `${dia}/${mes}/${ano}`;
};

const formatarStatusOrdem = (status) => {
  const nomes = {
    ABERTA: "Aberta",
    AGENDADA: "Agendada",
    EM_ATENDIMENTO: "Em atendimento",
    AGUARDANDO_CONFERENCIA: "Aguardando conferência",
    FINALIZADA: "Finalizada",
    CANCELADA: "Cancelada",
  };

  return nomes[status] ?? status ?? "-";
};

const ordemInicial = {
  id: "",
  clienteId: "",
  clienteNome: "",
  colaboradorId: "",
  colaboradorNome: "",
  tipoOrdemServicoId: "",
  tipoOrdemServicoNome: "",
  descricao: "",
  status: "",
  dataAgendada: "",
  inicioAtendimento: "",
  fimAtendimento: "",
  observacaoConclusao: "",
  dataFechamento: "",
};

const CadastroOrdemServico = () => {
  const [ordem, setOrdem] = useState({ ...ordemInicial });
  const [ordemSalva, setOrdemSalva] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("principal");
  const [clientes, setClientes] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [tiposOrdemServico, setTiposOrdemServico] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [seletorClienteAberto, setSeletorClienteAberto] = useState(false);
  const [seletorColaboradorAberto, setSeletorColaboradorAberto] =
    useState(false);
  const [seletorTipoOrdemServicoAberto, setSeletorTipoOrdemServicoAberto] =
    useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState(null);
  const [tipoOrdemServicoSelecionado, setTipoOrdemServicoSelecionado] =
    useState(null);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [buscaColaborador, setBuscaColaborador] = useState("");
  const [buscaTipoOrdemServico, setBuscaTipoOrdemServico] = useState("");
  const [paginaClienteAtual, setPaginaClienteAtual] = useState(1);
  const [paginaColaboradorAtual, setPaginaColaboradorAtual] = useState(1);
  const [paginaTipoOrdemServicoAtual, setPaginaTipoOrdemServicoAtual] =
    useState(1);
  const [camposInvalidos, setCamposInvalidos] = useState({});
  const [ordenacaoCliente, setOrdenacaoCliente] = useState({
    coluna: "id",
    direcao: "asc",
  });
  const [ordenacaoColaborador, setOrdenacaoColaborador] = useState({
    coluna: "id",
    direcao: "asc",
  });
  const [ordenacaoTipoOrdemServico, setOrdenacaoTipoOrdemServico] = useState({
    coluna: "nome",
    direcao: "asc",
  });
  const navigate = useNavigate();
  const clienteIdInputRef = useRef(null);
  const colaboradorIdInputRef = useRef(null);
  const tipoOrdemServicoIdInputRef = useRef(null);
  const descricaoTextareaRef = useRef(null);
  const tipoOrdemServicoOriginalIdRef = useRef("");
  const dataAgendadaInputRef = useRef(null);
  const [agendando, setAgendando] = useState(false);
  const [iniciandoAtendimento, setIniciandoAtendimento] = useState(false);
  const [confirmacaoInicioAberta, setConfirmacaoInicioAberta] = useState(false);
  const { id } = useParams();
  const modoEdicao = Boolean(id);
  const ordemEncerrada =
    ordem.status === "FINALIZADA" || ordem.status === "CANCELADA";
  const ordemAguardandoConferencia = ordem.status === "AGUARDANDO_CONFERENCIA";

  const ordemSomenteLeitura = ordemEncerrada || ordemAguardandoConferencia;
  const clienteBloqueado = ordemSalva || modoEdicao;
  const colaboradorBloqueado =
    ordemSalva || (modoEdicao && ordem.status !== "ABERTA");
  const descricaoBloqueada = (ordemSalva && !modoEdicao) || ordemSomenteLeitura;
  const tipoOrdemServicoBloqueado =
    ordemSalva || (modoEdicao && ordem.status !== "ABERTA");
  const [conclusaoAberta, setConclusaoAberta] = useState(false);
  const [concluindoAtendimento, setConcluindoAtendimento] = useState(false);
  const [observacaoConclusao, setObservacaoConclusao] = useState("");
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
    const carregarTiposOrdemServico = async () => {
      try {
        const response = await listarTiposOrdemServicoAtivos();
        setTiposOrdemServico(response.data);
      } catch (error) {
        mostrarMensagem(
          error.response?.data?.message ||
            "Erro ao carregar tipos de ordem de serviço.",
          "erro",
        );
      }
    };

    carregarTiposOrdemServico();
  }, []);

  useEffect(() => {
    if (!modoEdicao) {
      return;
    }

    const carregarOrdemServico = async () => {
      try {
        const response = await buscarOrdemServicoPorId(id);

        tipoOrdemServicoOriginalIdRef.current = String(
          response.data.tipoOrdemServicoId ?? "",
        );

        setOrdem({
          id: String(response.data.id ?? ""),
          status: response.data.status ?? "",
          clienteId: String(response.data.clienteId ?? ""),
          clienteNome: response.data.clienteNome ?? "",
          colaboradorId: String(response.data.colaboradorId ?? ""),
          colaboradorNome: response.data.colaboradorNome ?? "",
          tipoOrdemServicoId: String(response.data.tipoOrdemServicoId ?? ""),
          tipoOrdemServicoNome: response.data.tipoOrdemServicoNome ?? "",
          descricao: response.data.descricao ?? "",
          dataAgendada: formatarDataHoraParaInput(response.data.dataAgendada),
          inicioAtendimento: response.data.inicioAtendimento ?? "",
          fimAtendimento: response.data.fimAtendimento ?? "",
          observacaoConclusao: response.data.observacaoConclusao ?? "",
          dataFechamento: response.data.dataFechamento ?? "",
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

  const tiposOrdemServicoFiltrados = tiposOrdemServico.filter((tipo) => {
    const buscaFormatada = buscaTipoOrdemServico.toLowerCase();

    return (
      String(tipo.id).includes(buscaFormatada) ||
      String(tipo.nome || "")
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

  const handleOrdenarTipoOrdemServico = (coluna) => {
    setOrdenacaoTipoOrdemServico((ordenacaoAtual) => {
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

  const tiposOrdemServicoOrdenados = [...tiposOrdemServicoFiltrados].sort(
    (a, b) => {
      let valorA = a[ordenacaoTipoOrdemServico.coluna];
      let valorB = b[ordenacaoTipoOrdemServico.coluna];

      if (ordenacaoTipoOrdemServico.coluna === "id") {
        valorA = Number(valorA);
        valorB = Number(valorB);
      } else {
        valorA = String(valorA ?? "").toLowerCase();
        valorB = String(valorB ?? "").toLowerCase();
      }

      if (valorA < valorB) {
        return ordenacaoTipoOrdemServico.direcao === "asc" ? -1 : 1;
      }

      if (valorA > valorB) {
        return ordenacaoTipoOrdemServico.direcao === "asc" ? 1 : -1;
      }

      return 0;
    },
  );

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

  const indiceInicialTipoOrdemServico =
    (paginaTipoOrdemServicoAtual - 1) * itensPorPagina;

  const indiceFinalTipoOrdemServico =
    indiceInicialTipoOrdemServico + itensPorPagina;

  const tiposOrdemServicoPaginados = tiposOrdemServicoOrdenados.slice(
    indiceInicialTipoOrdemServico,
    indiceFinalTipoOrdemServico,
  );

  const totalPaginasTipoOrdemServico = Math.ceil(
    tiposOrdemServicoOrdenados.length / itensPorPagina,
  );

  const inicioExibidoTipoOrdemServico =
    tiposOrdemServicoOrdenados.length > 0
      ? indiceInicialTipoOrdemServico + 1
      : 0;

  const fimExibidoTipoOrdemServico = Math.min(
    indiceFinalTipoOrdemServico,
    tiposOrdemServicoOrdenados.length,
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

  const renderIconeOrdenacaoTipoOrdemServico = (coluna) => {
    if (ordenacaoTipoOrdemServico.coluna !== coluna) {
      return null;
    }

    return ordenacaoTipoOrdemServico.direcao === "asc" ? (
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

    if (camposInvalidos[name]) {
      setCamposInvalidos((camposAtuais) => ({
        ...camposAtuais,
        [name]: false,
      }));
    }
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

    if (camposInvalidos.clienteId) {
      setCamposInvalidos((camposAtuais) => ({
        ...camposAtuais,
        clienteId: false,
      }));
    }
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

    if (camposInvalidos.colaboradorId) {
      setCamposInvalidos((camposAtuais) => ({
        ...camposAtuais,
        colaboradorId: false,
      }));
    }
  };

  const handleTipoOrdemServicoIdChange = (e) => {
    const valorDigitado = e.target.value;

    const tipoEncontrado = tiposOrdemServico.find(
      (tipo) => String(tipo.id) === valorDigitado,
    );

    setOrdem((ordemAtual) => ({
      ...ordemAtual,
      tipoOrdemServicoId: valorDigitado,
      tipoOrdemServicoNome: tipoEncontrado ? tipoEncontrado.nome : "",
    }));

    if (camposInvalidos.tipoOrdemServicoId) {
      setCamposInvalidos((camposAtuais) => ({
        ...camposAtuais,
        tipoOrdemServicoId: false,
      }));
    }
  };

  const confirmarCliente = (cliente) => {
    setOrdem((ordemAtual) => ({
      ...ordemAtual,
      clienteId: String(cliente.id),
      clienteNome: cliente.nome,
    }));

    setCamposInvalidos((camposAtuais) => ({
      ...camposAtuais,
      clienteId: false,
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

    setCamposInvalidos((camposAtuais) => ({
      ...camposAtuais,
      colaboradorId: false,
    }));

    setSeletorColaboradorAberto(false);
    setColaboradorSelecionado(null);
    setBuscaColaborador("");
  };

  const confirmarTipoOrdemServico = (tipoOrdemServico) => {
    setOrdem((ordemAtual) => ({
      ...ordemAtual,
      tipoOrdemServicoId: String(tipoOrdemServico.id),
      tipoOrdemServicoNome: tipoOrdemServico.nome,
    }));

    setCamposInvalidos((camposAtuais) => ({
      ...camposAtuais,
      tipoOrdemServicoId: false,
    }));

    setSeletorTipoOrdemServicoAberto(false);
    setTipoOrdemServicoSelecionado(null);
    setBuscaTipoOrdemServico("");
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
      setCamposInvalidos({});
      return;
    }

    setOrdem({ ...ordemInicial });
    setCamposInvalidos({});
    setOrdemSalva(false);
    setClienteSelecionado(null);
    setColaboradorSelecionado(null);
    setBuscaCliente("");
    setBuscaColaborador("");
    setAbaAtiva("principal");
  };

  const validarOrdem = () => {
    const erros = [];
    const camposComErro = {};

    if (modoEdicao) {
      if (!ordem.tipoOrdemServicoId || !ordem.tipoOrdemServicoNome) {
        camposComErro.tipoOrdemServicoId = true;
        erros.push("Selecione um tipo de ordem de serviço válido.");
      }

      if (!ordem.descricao.trim()) {
        camposComErro.descricao = true;
        erros.push("Descricao e obrigatoria.");
      }

      setCamposInvalidos(camposComErro);
      return erros;
    }

    if (!ordem.clienteId || !ordem.clienteNome) {
      camposComErro.clienteId = true;
      erros.push("Selecione um cliente valido.");
    }

    if (!ordem.tipoOrdemServicoId || !ordem.tipoOrdemServicoNome) {
      camposComErro.tipoOrdemServicoId = true;
      erros.push("Selecione um tipo de ordem de serviço válido.");
    }

    if (!ordem.descricao.trim()) {
      camposComErro.descricao = true;
      erros.push("Descricao e obrigatoria.");
    }

    setCamposInvalidos(camposComErro);
    return erros;
  };

  const handleAgendarOrdem = async () => {
    if (!modoEdicao || ordem.status !== "ABERTA") {
      mostrarMensagem("Apenas ordens abertas podem ser agendadas.", "erro");
      return;
    }

    const camposComErro = {};

    if (!ordem.colaboradorId || !ordem.colaboradorNome) {
      camposComErro.colaboradorId = true;
    }

    if (!ordem.dataAgendada) {
      camposComErro.dataAgendada = true;
    }

    setCamposInvalidos((camposAtuais) => ({
      ...camposAtuais,
      ...camposComErro,
    }));

    if (Object.keys(camposComErro).length > 0) {
      if (camposComErro.colaboradorId) {
        mostrarMensagem(
          "Selecione um colaborador para agendar a ordem de serviço.",
          "erro",
        );
        colaboradorIdInputRef.current?.focus();
      } else {
        mostrarMensagem("Informe a data e hora do agendamento.", "erro");
        dataAgendadaInputRef.current?.focus();
      }

      return;
    }

    try {
      setAgendando(true);

      const response = await agendarOrdemServico(ordem.id, {
        colaboradorId: Number(ordem.colaboradorId),
        dataAgendada: ordem.dataAgendada,
      });

      setOrdem((ordemAtual) => ({
        ...ordemAtual,
        status: response.data.status ?? "AGENDADA",
        colaboradorId: String(
          response.data.colaboradorId ?? ordemAtual.colaboradorId,
        ),
        colaboradorNome:
          response.data.colaboradorNome ?? ordemAtual.colaboradorNome,
        dataAgendada: formatarDataHoraParaInput(
          response.data.dataAgendada ?? ordemAtual.dataAgendada,
        ),
      }));

      setCamposInvalidos({});
      mostrarMensagem("Ordem de serviço agendada com sucesso.", "sucesso");
    } catch (error) {
      mostrarMensagem(
        error.response?.data?.message ||
          "Não foi possível agendar a ordem de serviço.",
        "erro",
      );
    } finally {
      setAgendando(false);
    }
  };

  const handleIniciarAtendimento = async () => {
    if (!modoEdicao || ordem.status !== "AGENDADA") {
      mostrarMensagem(
        "Apenas ordens agendadas podem iniciar atendimento.",
        "erro",
      );
      return;
    }

    try {
      setIniciandoAtendimento(true);

      const response = await iniciarAtendimentoOrdemServico(ordem.id);

      setOrdem((ordemAtual) => ({
        ...ordemAtual,
        status: response.data.status ?? "EM_ATENDIMENTO",
        inicioAtendimento:
          response.data.inicioAtendimento ?? ordemAtual.inicioAtendimento,
      }));

      setConfirmacaoInicioAberta(false);

      mostrarMensagem("Atendimento iniciado com sucesso.", "sucesso");
    } catch (error) {
      mostrarMensagem(
        error.response?.data?.message ||
          "Não foi possível iniciar o atendimento.",
        "erro",
      );
    } finally {
      setIniciandoAtendimento(false);
    }
  };

  const abrirConclusaoAtendimento = () => {
    if (!modoEdicao || ordem.status !== "EM_ATENDIMENTO") {
      mostrarMensagem(
        "Apenas ordens em atendimento podem ser concluídas.",
        "erro",
      );
      return;
    }

    setObservacaoConclusao(ordem.observacaoConclusao ?? "");
    setConclusaoAberta(true);
  };

  const handleConcluirAtendimento = async () => {
    if (!modoEdicao || ordem.status !== "EM_ATENDIMENTO") {
      mostrarMensagem(
        "Apenas ordens em atendimento podem ser concluídas.",
        "erro",
      );
      return;
    }

    try {
      setConcluindoAtendimento(true);

      const response = await concluirAtendimentoOrdemServico(ordem.id, {
        observacaoConclusao: observacaoConclusao.trim(),
      });

      setOrdem((ordemAtual) => ({
        ...ordemAtual,
        status: response.data.status ?? "AGUARDANDO_CONFERENCIA",
        fimAtendimento:
          response.data.fimAtendimento ?? ordemAtual.fimAtendimento,
        observacaoConclusao:
          response.data.observacaoConclusao ?? observacaoConclusao.trim(),
      }));

      setConclusaoAberta(false);
      mostrarMensagem("Atendimento concluído com sucesso.", "sucesso");
    } catch (error) {
      mostrarMensagem(
        error.response?.data?.message ||
          "Não foi possível concluir o atendimento.",
        "erro",
      );
    } finally {
      setConcluindoAtendimento(false);
    }
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

      if (!modoEdicao && (!ordem.clienteId || !ordem.clienteNome)) {
        clienteIdInputRef.current?.focus();
      } else if (!ordem.tipoOrdemServicoId || !ordem.tipoOrdemServicoNome) {
        tipoOrdemServicoIdInputRef.current?.focus();
      } else if (!ordem.descricao.trim()) {
        descricaoTextareaRef.current?.focus();
      }

      return;
    }

    try {
      if (modoEdicao) {
        const ordemAtualizada = {
          descricao: ordem.descricao.trim(),
        };

        const responseDescricao = await atualizarDescricaoOrdemServico(
          id,
          ordemAtualizada,
        );

        const tipoAlterado =
          String(ordem.tipoOrdemServicoId) !==
          tipoOrdemServicoOriginalIdRef.current;

        let responseTipo = null;

        if (tipoAlterado) {
          try {
            responseTipo = await atualizarTipoDaOrdemServico(id, {
              tipoOrdemServicoId: Number(ordem.tipoOrdemServicoId),
            });
          } catch (error) {
            setOrdem((ordemAtual) => ({
              ...ordemAtual,
              descricao:
                responseDescricao.data.descricao ?? ordem.descricao.trim(),
            }));

            const mensagemTipo =
              error.response?.data?.message ||
              "Erro ao atualizar tipo da ordem de serviço.";

            mostrarMensagem(
              `Descrição atualizada, mas o tipo não foi alterado: ${mensagemTipo}`,
              "erro",
            );
            return;
          }
        }

        setOrdem((ordemAtual) => ({
          ...ordemAtual,
          descricao: responseDescricao.data.descricao ?? ordem.descricao.trim(),
          tipoOrdemServicoId: responseTipo
            ? String(
                responseTipo.data.tipoOrdemServicoId ??
                  ordemAtual.tipoOrdemServicoId,
              )
            : ordemAtual.tipoOrdemServicoId,
          tipoOrdemServicoNome: responseTipo
            ? (responseTipo.data.tipoOrdemServicoNome ??
              ordemAtual.tipoOrdemServicoNome)
            : ordemAtual.tipoOrdemServicoNome,
        }));

        if (responseTipo) {
          tipoOrdemServicoOriginalIdRef.current = String(
            responseTipo.data.tipoOrdemServicoId ?? ordem.tipoOrdemServicoId,
          );
        }

        mostrarMensagem("Ordem de serviço atualizada com sucesso.", "sucesso");
        return;
      }

      const ordemParaEnviar = {
        clienteId: Number(ordem.clienteId),
        colaboradorId: ordem.colaboradorId ? Number(ordem.colaboradorId) : null,
        tipoOrdemServicoId: Number(ordem.tipoOrdemServicoId),
        descricao: ordem.descricao.trim(),
      };

      const response = await cadastrarOrdemServico(ordemParaEnviar);

      tipoOrdemServicoOriginalIdRef.current = String(
        response.data.tipoOrdemServicoId ?? "",
      );

      setOrdem({
        id: String(response.data.id ?? ""),
        status: response.data.status ?? "",
        clienteId: String(response.data.clienteId ?? ""),
        clienteNome: response.data.clienteNome ?? "",
        colaboradorId: String(response.data.colaboradorId ?? ""),
        colaboradorNome: response.data.colaboradorNome ?? "",
        tipoOrdemServicoId: String(response.data.tipoOrdemServicoId ?? ""),
        tipoOrdemServicoNome: response.data.tipoOrdemServicoNome ?? "",
        descricao: response.data.descricao ?? "",
        dataAgendada: formatarDataHoraParaInput(response.data.dataAgendada),
        inicioAtendimento: response.data.inicioAtendimento ?? "",
        fimAtendimento: response.data.fimAtendimento ?? "",
        observacaoConclusao: response.data.observacaoConclusao ?? "",
        dataFechamento: response.data.dataFechamento ?? "",
      });

      setOrdemSalva(false);
      mostrarMensagem(
        "Ordem de serviço cadastrada. Agora você pode realizar o agendamento.",
        "sucesso",
      );

      navigate(`/os/editar/${response.data.id}`, {
        replace: true,
      });
    } catch (error) {
      const mensagemPadrao = modoEdicao
        ? "Erro ao atualizar ordem de serviço."
        : "Erro ao cadastrar ordem de serviço.";
      const mensagemErro = error.response?.data?.message || mensagemPadrao;

      mostrarMensagem(mensagemErro, "erro");
    }
  };

  const abrirSeletorCliente = () => {
    if (clienteBloqueado) {
      return;
    }

    setSeletorClienteAberto(true);
    setBuscaCliente("");
    setPaginaClienteAtual(1);
    setClienteSelecionado(null);
  };

  const abrirSeletorColaborador = () => {
    if (colaboradorBloqueado) {
      return;
    }

    setSeletorColaboradorAberto(true);
    setBuscaColaborador("");
    setPaginaColaboradorAtual(1);
    setColaboradorSelecionado(null);
  };

  const abrirSeletorTipoOrdemServico = () => {
    if (tipoOrdemServicoBloqueado) {
      return;
    }

    setSeletorTipoOrdemServicoAberto(true);
    setBuscaTipoOrdemServico("");
    setPaginaTipoOrdemServicoAtual(1);
    setTipoOrdemServicoSelecionado(null);
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
              <div
                className={`lookup-field ${clienteBloqueado ? "" : "lookup-field-clickable"}`}
                onClick={(event) => {
                  if (
                    event.target.tagName === "INPUT" &&
                    !event.target.readOnly
                  ) {
                    return;
                  }

                  abrirSeletorCliente();
                }}
              >
                <input
                  ref={clienteIdInputRef}
                  type="text"
                  name="clienteId"
                  placeholder="ID"
                  value={ordem.clienteId}
                  onChange={handleClienteIdChange}
                  readOnly={clienteBloqueado}
                  className={camposInvalidos.clienteId ? "input-error" : ""}
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
                  disabled={clienteBloqueado}
                  onClick={(event) => {
                    event.stopPropagation();
                    abrirSeletorCliente();
                  }}
                >
                  <FiSearch />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Colaborador (opcional)</label>
              <div
                className={`lookup-field ${colaboradorBloqueado ? "" : "lookup-field-clickable"}`}
                onClick={(event) => {
                  if (
                    event.target.tagName === "INPUT" &&
                    !event.target.readOnly
                  ) {
                    return;
                  }

                  abrirSeletorColaborador();
                }}
              >
                <input
                  ref={colaboradorIdInputRef}
                  type="text"
                  name="colaboradorId"
                  placeholder="ID"
                  value={ordem.colaboradorId}
                  onChange={handleColaboradorIdChange}
                  readOnly={colaboradorBloqueado}
                  className={camposInvalidos.colaboradorId ? "input-error" : ""}
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
                  disabled={colaboradorBloqueado}
                  onClick={(event) => {
                    event.stopPropagation();
                    abrirSeletorColaborador();
                  }}
                >
                  <FiSearch />
                </button>
              </div>
            </div>

            {modoEdicao && (
              <div className="form-group os-agendamento-field">
                <label>Data e hora do agendamento</label>

                <input
                  ref={dataAgendadaInputRef}
                  type="datetime-local"
                  name="dataAgendada"
                  value={ordem.dataAgendada}
                  onChange={handleChange}
                  disabled={ordem.status !== "ABERTA"}
                  className={camposInvalidos.dataAgendada ? "input-error" : ""}
                />
              </div>
            )}

            <div className="form-group">
              <label>Tipo</label>

              <div
                className={`lookup-field ${
                  tipoOrdemServicoBloqueado ? "" : "lookup-field-clickable"
                }`}
                onClick={(event) => {
                  if (
                    event.target.tagName === "INPUT" &&
                    !event.target.readOnly
                  ) {
                    return;
                  }

                  abrirSeletorTipoOrdemServico();
                }}
              >
                <input
                  ref={tipoOrdemServicoIdInputRef}
                  type="text"
                  name="tipoOrdemServicoId"
                  placeholder="ID"
                  value={ordem.tipoOrdemServicoId}
                  onChange={handleTipoOrdemServicoIdChange}
                  readOnly={tipoOrdemServicoBloqueado}
                  className={
                    camposInvalidos.tipoOrdemServicoId ? "input-error" : ""
                  }
                />

                <input
                  type="text"
                  name="tipoOrdemServicoNome"
                  placeholder="Tipo da ordem de serviço"
                  value={ordem.tipoOrdemServicoNome}
                  readOnly
                />

                <button
                  type="button"
                  aria-label="Pesquisar tipo de ordem de serviço"
                  title="Pesquisar tipo de ordem de serviço"
                  disabled={tipoOrdemServicoBloqueado}
                  onClick={(event) => {
                    event.stopPropagation();
                    abrirSeletorTipoOrdemServico();
                  }}
                >
                  <FiSearch />
                </button>
              </div>
            </div>
            <div className="form-group form-group-full">
              <label>Descricao</label>
              <textarea
                ref={descricaoTextareaRef}
                name="descricao"
                placeholder="Descreva o Serviço"
                value={ordem.descricao}
                onChange={handleChange}
                readOnly={descricaoBloqueada}
                className={camposInvalidos.descricao ? "input-error" : ""}
              />
            </div>
            {modoEdicao && (
              <div className="os-lifecycle-panel">
                <div className="os-lifecycle-header">
                  <h3>Ciclo do atendimento</h3>

                  <span data-status={ordem.status}>
                    {formatarStatusOrdem(ordem.status)}
                  </span>
                </div>

                <div className="os-lifecycle-grid">
                  <div>
                    <span>Agendamento</span>
                    <strong>
                      {formatarDataHoraExibicao(ordem.dataAgendada)}
                    </strong>
                  </div>

                  <div>
                    <span>Início do atendimento</span>
                    <strong>
                      {formatarDataHoraExibicao(ordem.inicioAtendimento)}
                    </strong>
                  </div>

                  <div>
                    <span>Fim do atendimento</span>
                    <strong>
                      {formatarDataHoraExibicao(ordem.fimAtendimento)}
                    </strong>
                  </div>

                  <div>
                    <span>Fechamento administrativo</span>
                    <strong>
                      {formatarDataHoraExibicao(ordem.dataFechamento)}
                    </strong>
                  </div>

                  {ordem.observacaoConclusao && (
                    <div className="os-lifecycle-observation">
                      <span>Observação da conclusão</span>
                      <strong>{ordem.observacaoConclusao}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="form-actions">
              {modoEdicao && ordem.status === "ABERTA" && (
                <button
                  type="button"
                  className="schedule-order-button"
                  onClick={handleAgendarOrdem}
                  disabled={agendando}
                >
                  {agendando ? "Agendando..." : "Agendar OS"}
                </button>
              )}

              {modoEdicao && ordem.status === "AGENDADA" && (
                <button
                  type="button"
                  className="start-service-button"
                  onClick={() => setConfirmacaoInicioAberta(true)}
                  disabled={iniciandoAtendimento}
                >
                  Iniciar atendimento
                </button>
              )}
              {modoEdicao && ordem.status === "EM_ATENDIMENTO" && (
                <button
                  type="button"
                  className="complete-service-button"
                  onClick={abrirConclusaoAtendimento}
                  disabled={concluindoAtendimento}
                >
                  Concluir atendimento
                </button>
              )}
              <button
                type="submit"
                disabled={(ordemSalva && !modoEdicao) || ordemSomenteLeitura}
              >
                {ordemSomenteLeitura
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
                disabled={ordemSomenteLeitura}
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
            ordemEncerrada={ordemSomenteLeitura}
            mostrarMensagem={mostrarMensagem}
          />
        )}
        {abaAtiva === "anexos" && (
          <AnexosOSTab ordemId={ordem.id} mostrarMensagem={mostrarMensagem} />
        )}
      </div>
      {conclusaoAberta && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!concluindoAtendimento) {
              setConclusaoAberta(false);
            }
          }}
        >
          <div
            className="modal-content conclusao-atendimento-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="conclusao-atendimento-titulo"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="conclusao-atendimento-titulo">Concluir atendimento</h2>

              <button
                type="button"
                onClick={() => setConclusaoAberta(false)}
                disabled={concluindoAtendimento}
                aria-label="Fechar conclusão"
              >
                X
              </button>
            </div>

            <div className="modal-body">
              <label htmlFor="observacao-conclusao">
                Observação da conclusão
              </label>

              <textarea
                id="observacao-conclusao"
                value={observacaoConclusao}
                onChange={(event) => setObservacaoConclusao(event.target.value)}
                maxLength={1000}
                placeholder="Descreva o serviço realizado pelo técnico..."
                autoFocus
              />

              <span className="conclusao-contador">
                {observacaoConclusao.length} / 1000
              </span>

              <p>
                Ao confirmar, o término do atendimento será registrado
                automaticamente e a OS seguirá para conferência.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setConclusaoAberta(false)}
                disabled={concluindoAtendimento}
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={handleConcluirAtendimento}
                disabled={concluindoAtendimento}
              >
                {concluindoAtendimento
                  ? "Concluindo..."
                  : "Confirmar conclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
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
      {confirmacaoInicioAberta && (
        <div
          className="modal-overlay"
          onClick={() => setConfirmacaoInicioAberta(false)}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inicio-atendimento-titulo"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="inicio-atendimento-titulo">Iniciar atendimento</h2>

              <button
                type="button"
                onClick={() => setConfirmacaoInicioAberta(false)}
                aria-label="Fechar confirmação"
              >
                X
              </button>
            </div>

            <div className="modal-body">
              <p>
                Deseja iniciar o atendimento da OS <strong>{ordem.id}</strong>?
              </p>
              <p>O horário de início será registrado automaticamente.</p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setConfirmacaoInicioAberta(false)}
                disabled={iniciandoAtendimento}
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={handleIniciarAtendimento}
                disabled={iniciandoAtendimento}
              >
                {iniciandoAtendimento ? "Iniciando..." : "Confirmar início"}
              </button>
            </div>
          </div>
        </div>
      )}
      {seletorTipoOrdemServicoAberto && (
        <div className="selector-overlay">
          <div className="selector-box">
            <div className="selector-header">
              <h2>Tipos de Ordem de Serviço</h2>

              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSeletorTipoOrdemServicoAberto(false)}
                aria-label="Fechar seleção de tipo"
              >
                X
              </button>
            </div>

            <div className="selector-actions">
              <input
                type="text"
                placeholder="Buscar por ID ou Nome..."
                value={buscaTipoOrdemServico}
                onChange={(e) => {
                  setBuscaTipoOrdemServico(e.target.value);
                  setPaginaTipoOrdemServicoAtual(1);
                }}
              />

              <div className="pagination-controls selector-pagination-controls">
                <button
                  type="button"
                  title="Primeira página"
                  aria-label="Primeira página"
                  onClick={() => setPaginaTipoOrdemServicoAtual(1)}
                  disabled={paginaTipoOrdemServicoAtual === 1}
                >
                  <FiChevronsLeft />
                </button>

                <button
                  type="button"
                  title="Página anterior"
                  aria-label="Página anterior"
                  onClick={() =>
                    setPaginaTipoOrdemServicoAtual((paginaAtual) =>
                      Math.max(paginaAtual - 1, 1),
                    )
                  }
                  disabled={paginaTipoOrdemServicoAtual === 1}
                >
                  <FiChevronLeft />
                </button>

                <button
                  type="button"
                  title="Limpar busca"
                  aria-label="Limpar busca"
                  onClick={() => {
                    setBuscaTipoOrdemServico("");
                    setTipoOrdemServicoSelecionado(null);
                    setPaginaTipoOrdemServicoAtual(1);
                  }}
                >
                  <FiRefreshCw />
                </button>

                <button
                  type="button"
                  title="Próxima página"
                  aria-label="Próxima página"
                  onClick={() =>
                    setPaginaTipoOrdemServicoAtual((paginaAtual) =>
                      Math.min(paginaAtual + 1, totalPaginasTipoOrdemServico),
                    )
                  }
                  disabled={
                    totalPaginasTipoOrdemServico === 0 ||
                    paginaTipoOrdemServicoAtual === totalPaginasTipoOrdemServico
                  }
                >
                  <FiChevronRight />
                </button>

                <button
                  type="button"
                  title="Última página"
                  aria-label="Última página"
                  onClick={() =>
                    setPaginaTipoOrdemServicoAtual(totalPaginasTipoOrdemServico)
                  }
                  disabled={
                    totalPaginasTipoOrdemServico === 0 ||
                    paginaTipoOrdemServicoAtual === totalPaginasTipoOrdemServico
                  }
                >
                  <FiChevronsRight />
                </button>

                <span className="total-itens">
                  {`${inicioExibidoTipoOrdemServico} - ${fimExibidoTipoOrdemServico} / ${tiposOrdemServicoOrdenados.length}`}
                </span>
              </div>
            </div>

            <div className="selector-table-wrapper">
              <table className="selector-table">
                <thead>
                  <tr>
                    <th onClick={() => handleOrdenarTipoOrdemServico("id")}>
                      <span className="sortable-header">
                        ID
                        {renderIconeOrdenacaoTipoOrdemServico("id")}
                      </span>
                    </th>

                    <th onClick={() => handleOrdenarTipoOrdemServico("nome")}>
                      <span className="sortable-header">
                        Nome
                        {renderIconeOrdenacaoTipoOrdemServico("nome")}
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tiposOrdemServicoPaginados.map((tipo) => (
                    <tr
                      key={tipo.id}
                      className={
                        tipoOrdemServicoSelecionado?.id === tipo.id
                          ? "selected-row"
                          : ""
                      }
                      onClick={() => setTipoOrdemServicoSelecionado(tipo)}
                      onDoubleClick={() => confirmarTipoOrdemServico(tipo)}
                    >
                      <td>{tipo.id}</td>
                      <td>{tipo.nome}</td>
                    </tr>
                  ))}

                  {tiposOrdemServicoPaginados.length === 0 && (
                    <tr>
                      <td colSpan="2" className="empty-state-cell">
                        Nenhum tipo ativo encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="selector-footer">
              <button
                type="button"
                onClick={() => {
                  if (tipoOrdemServicoSelecionado) {
                    confirmarTipoOrdemServico(tipoOrdemServicoSelecionado);
                    return;
                  }

                  mostrarMensagem(
                    "Selecione um tipo de ordem de serviço.",
                    "erro",
                  );
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
