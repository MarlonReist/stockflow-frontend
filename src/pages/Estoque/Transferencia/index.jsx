import React, { useState, useEffect } from "react";
import {
  FiX,
  FiChevronUp,
  FiChevronDown,
  FiChevronsLeft,
  FiChevronLeft,
  FiRefreshCw,
  FiChevronRight,
  FiChevronsRight,
  FiSearch,
} from "react-icons/fi";
import "./Transferencia.css";
import {
  listarTransferencias,
  cadastrarTransferencia,
  deletarTransferencia,
} from "../../../services/transferenciaService";
import { listarAlmoxarifados } from "../../../services/almoxarifadoService";
import { listarAlmoxarifadosEstoque } from "../../../services/almoxarifadoEstoqueService";
import {
  listarTransferenciaItens,
  cadastrarTransferenciaItem,
  deletarTransferenciaItem,
  atualizarTransferenciaItem,
} from "../../../services/transferenciaItemService";

const Transferencia = () => {
  const [transferencias, setTransferencias] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [buscaData, setBuscaData] = useState("");
  const [transferenciaSelecionada, setTransferenciaSelecionada] =
    useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ordenacao, setOrdenacao] = useState({
    coluna: "id",
    direcao: "asc",
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [transferenciaSalva, setTransferenciaSalva] = useState(false);
  const [seletorAlmoxarifadoAberto, setSeletorAlmoxarifadoAberto] =
    useState(false);
  const [tipoSelecaoAlmoxarifado, setTipoSelecaoAlmoxarifado] = useState("");
  const [almoxarifadoSelecionado, setAlmoxarifadoSelecionado] = useState(null);
  const [buscaAlmoxarifado, setBuscaAlmoxarifado] = useState("");
  const [paginaAlmoxarifadoAtual, setPaginaAlmoxarifadoAtual] = useState(1);
  const [ordenacaoAlmoxarifado, setOrdenacaoAlmoxarifado] = useState({
    coluna: "id",
    direcao: "asc",
  });
  const [abaAtiva, setAbaAtiva] = useState("transferencia");
  const [transferenciaProdutos, setTransferenciaProdutos] = useState([]);
  const [itemProdutoSelecionado, setItemProdutoSelecionado] = useState(null);
  const [buscaProdutoTransferencia, setBuscaProdutoTransferencia] =
    useState("");
  const [paginaProdutoAtual, setPaginaProdutoAtual] = useState(1);
  const [ordenacaoProdutoTransferencia, setOrdenacaoProdutoTransferencia] =
    useState({
      coluna: "id",
      direcao: "asc",
    });
  const [estoqueOrigemProdutos, setEstoqueOrigemProdutos] = useState([]);
  const [modalItemAberto, setModalItemAberto] = useState(false);
  const [produtoTransferenciaSelecionado, setProdutoTransferenciaSelecionado] =
    useState(null);
  const [seletorProdutoAberto, setSeletorProdutoAberto] = useState(false);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [paginaSeletorProdutoAtual, setPaginaSeletorProdutoAtual] = useState(1);
  const [ordenacaoSeletorProduto, setOrdenacaoSeletorProduto] = useState({
    coluna: "id",
    direcao: "asc",
  });

  const transferenciaInicial = {
    id: "",
    almoxarifadoOrigemId: "",
    almoxarifadoOrigemNome: "",
    almoxarifadoDestinoId: "",
    almoxarifadoDestinoNome: "",
    dataTransferencia: "",
    observacao: "",
  };

  const [transferencia, setTransferencia] = useState(transferenciaInicial);
  const itemTransferenciaInicial = {
    idMov: "",
    idProduto: "",
    produtoNome: "",
    quantidade: "",
    saldoDisponivel: "",
  };
  const [itemTransferencia, setItemTransferencia] = useState(
    itemTransferenciaInicial,
  );

  const itensPorPagina = 10;
  const itensPorPaginaAlmoxarifado = 10;
  const itensPorPaginaProduto = 10;
  const itensPorPaginaSeletorProduto = 10;
  const transferenciaBloqueada = Boolean(transferencia.id);

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
    const carregarTransferencias = async () => {
      try {
        const response = await listarTransferencias();
        setTransferencias(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar transferências", "erro");
      }
    };

    carregarTransferencias();
  }, []);

  useEffect(() => {
    const carregarAlmoxarifados = async () => {
      try {
        const response = await listarAlmoxarifados();
        setAlmoxarifados(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar almoxarifados", "erro");
      }
    };

    carregarAlmoxarifados();
  }, []);

  const carregarTransferenciaItens = async (transferenciaId) => {
    try {
      const response = await listarTransferenciaItens();
      const transferenciaIdNumero = Number(transferenciaId);

      const itensDaTransferencia = response.data.filter((item) => {
        const transferenciaRelacionada = Number(
          item.transferenciaId ??
            item.transferenciaAlmoxarifadoId ??
            item.transferenciaAlmoxarifado?.id ??
            item.transferencia?.id ??
            0,
        );

        return transferenciaRelacionada === transferenciaIdNumero;
      });

      const itensNormalizados = itensDaTransferencia.map((item) => ({
        ...item,
        produtoId: item.produtoId ?? item.produto?.id ?? "",
        produtoNome: item.produtoNome ?? item.produto?.nome ?? "",
      }));

      setTransferenciaProdutos(itensNormalizados);
    } catch (error) {
      console.error("Erro ao salvar item da transferência:", {
        payload,
        status: error.response?.status,
        data: error.response?.data,
      });
      mostrarMensagem("Erro ao carregar itens da transferência", "erro");
    }
  };

  const transferenciasFiltradas = transferencias.filter((transferencia) => {
    const buscaFormatada = busca.toLowerCase();

    const matchBusca =
      String(transferencia.observacao || "")
        .toLowerCase()
        .includes(buscaFormatada) || String(transferencia.id).includes(busca);

    const matchData =
      buscaData === "" || transferencia.dataTransferencia === buscaData;

    return matchBusca && matchData;
  });

  const handleOrdenar = (coluna) => {
    setOrdenacao((ordenacaoAtual) => {
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

  const transferenciasOrdenadas = [...transferenciasFiltradas].sort((a, b) => {
    let valorA = a[ordenacao.coluna];
    let valorB = b[ordenacao.coluna];

    if (ordenacao.coluna === "id") {
      valorA = Number(valorA);
      valorB = Number(valorB);
    } else if (ordenacao.coluna === "dataTransferencia") {
      valorA = String(valorA ?? "");
      valorB = String(valorB ?? "");
    } else {
      valorA = String(valorA ?? "").toLowerCase();
      valorB = String(valorB ?? "").toLowerCase();
    }

    if (valorA < valorB) {
      return ordenacao.direcao === "asc" ? -1 : 1;
    }

    if (valorA > valorB) {
      return ordenacao.direcao === "asc" ? 1 : -1;
    }

    return 0;
  });

  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;

  const transferenciasPaginadas = transferenciasOrdenadas.slice(
    indiceInicial,
    indiceFinal,
  );

  const totalPaginas = Math.ceil(
    transferenciasOrdenadas.length / itensPorPagina,
  );
  const inicioExibido =
    transferenciasOrdenadas.length > 0 ? indiceInicial + 1 : 0;
  const fimExibido = Math.min(indiceFinal, transferenciasOrdenadas.length);

  const handlePrimeiraPagina = () => {
    setPaginaAtual(1);
  };

  const handlePaginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const handleRecarregar = () => {
    setBusca("");
    setBuscaData("");
    setTransferenciaSelecionada(null);
    setPaginaAtual(1);
  };

  const handleProximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const handleUltimaPagina = () => {
    setPaginaAtual(totalPaginas);
  };

  const handleAbrirNovo = () => {
    setTransferencia(transferenciaInicial);
    setTransferenciaSalva(false);
    setTransferenciaProdutos([]);
    setItemProdutoSelecionado(null);
    setBuscaProdutoTransferencia("");
    setPaginaProdutoAtual(1);
    setModalAberto(true);
    setAbaAtiva("transferencia");
  };

  const handleCancelar = () => {
    setTransferencia(transferenciaInicial);
    setTransferenciaSalva(false);
    setTransferenciaProdutos([]);
    setItemProdutoSelecionado(null);
    setBuscaProdutoTransferencia("");
    setPaginaProdutoAtual(1);
    setModalAberto(false);
    setAbaAtiva("transferencia");
  };

  const handleOrigemIdChange = (e) => {
    const valorDigitado = e.target.value;

    const almoxarifadoEncontrado = almoxarifados.find(
      (almoxarifado) => String(almoxarifado.id) === valorDigitado,
    );

    setTransferencia((transferenciaAtual) => ({
      ...transferenciaAtual,
      almoxarifadoOrigemId: valorDigitado,
      almoxarifadoOrigemNome: almoxarifadoEncontrado
        ? almoxarifadoEncontrado.nome
        : "",
    }));
  };

  const handleDestinoIdChange = (e) => {
    const valorDigitado = e.target.value;

    const almoxarifadoEncontrado = almoxarifados.find(
      (almoxarifado) => String(almoxarifado.id) === valorDigitado,
    );

    setTransferencia((transferenciaAtual) => ({
      ...transferenciaAtual,
      almoxarifadoDestinoId: valorDigitado,
      almoxarifadoDestinoNome: almoxarifadoEncontrado
        ? almoxarifadoEncontrado.nome
        : "",
    }));
  };

  const almoxarifadosFiltrados = almoxarifados.filter((almoxarifado) => {
    const buscaFormatada = buscaAlmoxarifado.toLowerCase();

    return (
      almoxarifado.nome.toLowerCase().includes(buscaFormatada) ||
      String(almoxarifado.id).includes(buscaFormatada)
    );
  });

  const handleOrdenarAlmoxarifado = (coluna) => {
    setOrdenacaoAlmoxarifado((ordenacaoAtual) => {
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

  const almoxarifadosOrdenados = [...almoxarifadosFiltrados].sort((a, b) => {
    let valorA = a[ordenacaoAlmoxarifado.coluna];
    let valorB = b[ordenacaoAlmoxarifado.coluna];

    if (ordenacaoAlmoxarifado.coluna === "id") {
      valorA = Number(valorA);
      valorB = Number(valorB);
    } else {
      valorA = String(valorA ?? "").toLowerCase();
      valorB = String(valorB ?? "").toLowerCase();
    }

    if (valorA < valorB) {
      return ordenacaoAlmoxarifado.direcao === "asc" ? -1 : 1;
    }

    if (valorA > valorB) {
      return ordenacaoAlmoxarifado.direcao === "asc" ? 1 : -1;
    }

    return 0;
  });

  const indiceInicialAlmoxarifado =
    (paginaAlmoxarifadoAtual - 1) * itensPorPaginaAlmoxarifado;
  const indiceFinalAlmoxarifado =
    indiceInicialAlmoxarifado + itensPorPaginaAlmoxarifado;

  const almoxarifadosPaginados = almoxarifadosOrdenados.slice(
    indiceInicialAlmoxarifado,
    indiceFinalAlmoxarifado,
  );

  const totalPaginasAlmoxarifado = Math.ceil(
    almoxarifadosOrdenados.length / itensPorPaginaAlmoxarifado,
  );
  const inicioExibidoAlmoxarifado =
    almoxarifadosOrdenados.length > 0 ? indiceInicialAlmoxarifado + 1 : 0;
  const fimExibidoAlmoxarifado = Math.min(
    indiceFinalAlmoxarifado,
    almoxarifadosOrdenados.length,
  );

  const handlePrimeiraPaginaAlmoxarifado = () => {
    setPaginaAlmoxarifadoAtual(1);
  };

  const handlePaginaAnteriorAlmoxarifado = () => {
    if (paginaAlmoxarifadoAtual > 1) {
      setPaginaAlmoxarifadoAtual(paginaAlmoxarifadoAtual - 1);
    }
  };

  const handleRecarregarAlmoxarifado = () => {
    setBuscaAlmoxarifado("");
    setAlmoxarifadoSelecionado(null);
    setPaginaAlmoxarifadoAtual(1);
  };

  const handleProximaPaginaAlmoxarifado = () => {
    if (paginaAlmoxarifadoAtual < totalPaginasAlmoxarifado) {
      setPaginaAlmoxarifadoAtual(paginaAlmoxarifadoAtual + 1);
    }
  };

  const handleUltimaPaginaAlmoxarifado = () => {
    setPaginaAlmoxarifadoAtual(totalPaginasAlmoxarifado);
  };

  const produtosTransferenciaFiltrados = transferenciaProdutos.filter(
    (item) => {
      const buscaFormatada = buscaProdutoTransferencia.toLowerCase();

      return (
        String(item.id ?? "").includes(buscaFormatada) ||
        String(item.produtoId ?? "").includes(buscaFormatada) ||
        String(item.produtoNome ?? "")
          .toLowerCase()
          .includes(buscaFormatada)
      );
    },
  );

  const handleOrdenarProdutoTransferencia = (coluna) => {
    setOrdenacaoProdutoTransferencia((ordenacaoAtual) => {
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

  const produtosTransferenciaOrdenados = [
    ...produtosTransferenciaFiltrados,
  ].sort((a, b) => {
    let valorA = a[ordenacaoProdutoTransferencia.coluna];
    let valorB = b[ordenacaoProdutoTransferencia.coluna];

    if (
      ordenacaoProdutoTransferencia.coluna === "id" ||
      ordenacaoProdutoTransferencia.coluna === "produtoId" ||
      ordenacaoProdutoTransferencia.coluna === "quantidade"
    ) {
      valorA = Number(valorA);
      valorB = Number(valorB);
    } else {
      valorA = String(valorA ?? "").toLowerCase();
      valorB = String(valorB ?? "").toLowerCase();
    }

    if (valorA < valorB) {
      return ordenacaoProdutoTransferencia.direcao === "asc" ? -1 : 1;
    }

    if (valorA > valorB) {
      return ordenacaoProdutoTransferencia.direcao === "asc" ? 1 : -1;
    }

    return 0;
  });

  const indiceInicialProduto = (paginaProdutoAtual - 1) * itensPorPaginaProduto;
  const indiceFinalProduto = indiceInicialProduto + itensPorPaginaProduto;

  const produtosTransferenciaPaginados = produtosTransferenciaOrdenados.slice(
    indiceInicialProduto,
    indiceFinalProduto,
  );

  const totalPaginasProduto = Math.ceil(
    produtosTransferenciaOrdenados.length / itensPorPaginaProduto,
  );
  const inicioExibidoProduto =
    produtosTransferenciaOrdenados.length > 0 ? indiceInicialProduto + 1 : 0;
  const fimExibidoProduto = Math.min(
    indiceFinalProduto,
    produtosTransferenciaOrdenados.length,
  );

  const handlePrimeiraPaginaProduto = () => {
    setPaginaProdutoAtual(1);
  };

  const handlePaginaAnteriorProduto = () => {
    if (paginaProdutoAtual > 1) {
      setPaginaProdutoAtual(paginaProdutoAtual - 1);
    }
  };

  const handleRecarregarProduto = () => {
    setBuscaProdutoTransferencia("");
    setItemProdutoSelecionado(null);
    setPaginaProdutoAtual(1);
  };

  const handleProximaPaginaProduto = () => {
    if (paginaProdutoAtual < totalPaginasProduto) {
      setPaginaProdutoAtual(paginaProdutoAtual + 1);
    }
  };

  const handleUltimaPaginaProduto = () => {
    setPaginaProdutoAtual(totalPaginasProduto);
  };

  const produtosSeletorFiltrados = estoqueOrigemProdutos.filter((produto) => {
    const buscaFormatada = buscaProduto.toLowerCase();

    return (
      String(produto.id).includes(buscaFormatada) ||
      String(produto.nome ?? "").toLowerCase().includes(buscaFormatada)
    );
  });

  const handleOrdenarSeletorProduto = (coluna) => {
    setOrdenacaoSeletorProduto((ordenacaoAtual) => {
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

  const produtosSeletorOrdenados = [...produtosSeletorFiltrados].sort(
    (a, b) => {
      let valorA = a[ordenacaoSeletorProduto.coluna];
      let valorB = b[ordenacaoSeletorProduto.coluna];

      if (
        ordenacaoSeletorProduto.coluna === "id" ||
        ordenacaoSeletorProduto.coluna === "saldo"
      ) {
        valorA = Number(valorA);
        valorB = Number(valorB);
      } else {
        valorA = String(valorA ?? "").toLowerCase();
        valorB = String(valorB ?? "").toLowerCase();
      }

      if (valorA < valorB) {
        return ordenacaoSeletorProduto.direcao === "asc" ? -1 : 1;
      }

      if (valorA > valorB) {
        return ordenacaoSeletorProduto.direcao === "asc" ? 1 : -1;
      }

      return 0;
    },
  );

  const indiceInicialSeletorProduto =
    (paginaSeletorProdutoAtual - 1) * itensPorPaginaSeletorProduto;
  const indiceFinalSeletorProduto =
    indiceInicialSeletorProduto + itensPorPaginaSeletorProduto;

  const produtosSeletorPaginados = produtosSeletorOrdenados.slice(
    indiceInicialSeletorProduto,
    indiceFinalSeletorProduto,
  );

  const totalPaginasSeletorProduto = Math.ceil(
    produtosSeletorOrdenados.length / itensPorPaginaSeletorProduto,
  );
  const inicioExibidoSeletorProduto =
    produtosSeletorOrdenados.length > 0 ? indiceInicialSeletorProduto + 1 : 0;
  const fimExibidoSeletorProduto = Math.min(
    indiceFinalSeletorProduto,
    produtosSeletorOrdenados.length,
  );

  const handlePrimeiraPaginaSeletorProduto = () => {
    setPaginaSeletorProdutoAtual(1);
  };

  const handlePaginaAnteriorSeletorProduto = () => {
    if (paginaSeletorProdutoAtual > 1) {
      setPaginaSeletorProdutoAtual(paginaSeletorProdutoAtual - 1);
    }
  };

  const handleRecarregarSeletorProduto = () => {
    setBuscaProduto("");
    setProdutoTransferenciaSelecionado(null);
    setPaginaSeletorProdutoAtual(1);
  };

  const handleProximaPaginaSeletorProduto = () => {
    if (paginaSeletorProdutoAtual < totalPaginasSeletorProduto) {
      setPaginaSeletorProdutoAtual(paginaSeletorProdutoAtual + 1);
    }
  };

  const handleUltimaPaginaSeletorProduto = () => {
    setPaginaSeletorProdutoAtual(totalPaginasSeletorProduto);
  };

  const carregarProdutosOrigem = async (almoxarifadoOrigemId) => {
    try {
      const response = await listarAlmoxarifadosEstoque();

      const produtosOrigem = response.data
        .filter((item) => {
          const almoxarifadoId = Number(
            item.almoxarifadoId ?? item.almoxarifado?.id ?? 0,
          );
          const saldoDisponivel = Number(item.saldo ?? item.quantidade ?? 0);

          return (
            almoxarifadoId === Number(almoxarifadoOrigemId) &&
            saldoDisponivel > 0
          );
        })
        .map((item) => ({
          id: item.produtoId ?? item.produto?.id ?? item.id,
          nome: item.produtoNome ?? item.produto?.nome ?? item.nome ?? "",
          saldo: Number(item.saldo ?? item.quantidade ?? 0),
          unidadeMedida: item.unidadeMedida ?? item.produto?.unidadeMedida ?? "",
          estoqueId: item.id,
        }));

      setEstoqueOrigemProdutos(produtosOrigem);
    } catch (error) {
      mostrarMensagem("Erro ao carregar estoque do almoxarifado de origem", "erro");
    }
  };

  const abrirSeletorProdutoTransferencia = async () => {
    if (!transferencia.almoxarifadoOrigemId) {
      mostrarMensagem("Selecione o almoxarifado de origem primeiro", "erro");
      return;
    }

    setBuscaProduto("");
    setProdutoTransferenciaSelecionado(null);
    setPaginaSeletorProdutoAtual(1);
    await carregarProdutosOrigem(transferencia.almoxarifadoOrigemId);
    setSeletorProdutoAberto(true);
  };

  const abrirModalNovoItemTransferencia = () => {
    const transferenciaId = Number(
      transferencia.id || transferenciaSelecionada?.id || 0,
    );

    if (!transferenciaId) {
      mostrarMensagem("Salve a transferência antes de adicionar produtos", "erro");
      return;
    }

    setItemTransferencia(itemTransferenciaInicial);
    setProdutoTransferenciaSelecionado(null);
    setBuscaProduto("");
    setPaginaSeletorProdutoAtual(1);
    setModalItemAberto(true);
  };

  const handleEditarItemTransferencia = (item = itemProdutoSelecionado) => {
    if (!item) {
      mostrarMensagem("Selecione um item da transferência", "erro");
      return;
    }

    setItemTransferencia({
      idMov: String(item.id ?? ""),
      idProduto: String(item.produtoId ?? item.produto?.id ?? ""),
      produtoNome: item.produtoNome ?? item.produto?.nome ?? "",
      quantidade: String(item.quantidade ?? ""),
      saldoDisponivel: String(item.saldoDisponivel ?? item.saldo ?? ""),
    });
    setProdutoTransferenciaSelecionado(null);
    setBuscaProduto("");
    setPaginaSeletorProdutoAtual(1);
    setModalItemAberto(true);
  };

  const handleDeletarItemTransferencia = async () => {
    const transferenciaId = Number(
      transferencia.id || transferenciaSelecionada?.id || 0,
    );

    if (!itemProdutoSelecionado) {
      mostrarMensagem("Selecione um item da transferência", "erro");
      return;
    }

    try {
      await deletarTransferenciaItem(itemProdutoSelecionado.id);
      await carregarTransferenciaItens(transferenciaId);
      setItemProdutoSelecionado(null);
      mostrarMensagem("Item da transferência excluído com sucesso", "sucesso");
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message ||
        "Erro ao excluir item da transferência";

      mostrarMensagem(mensagemErro, "erro");
    }
  };

  const confirmarProdutoTransferencia = (produto) => {
    setItemTransferencia((itemAtual) => ({
      ...itemAtual,
      idProduto: String(produto.id),
      produtoNome: produto.nome,
      saldoDisponivel: String(produto.saldo ?? ""),
    }));

    setSeletorProdutoAberto(false);
    setProdutoTransferenciaSelecionado(null);
    setBuscaProduto("");
  };

  const handleProdutoTransferenciaIdChange = (e) => {
    const valorDigitado = e.target.value;
    const produtoEncontrado = estoqueOrigemProdutos.find(
      (produto) => String(produto.id) === valorDigitado,
    );

    setItemTransferencia((itemAtual) => ({
      ...itemAtual,
      idProduto: valorDigitado,
      produtoNome: produtoEncontrado ? produtoEncontrado.nome : "",
      saldoDisponivel: produtoEncontrado ? String(produtoEncontrado.saldo ?? "") : "",
    }));
  };

  const handleSalvarItemTransferencia = async () => {
    const transferenciaId = Number(
      transferencia.id || transferenciaSelecionada?.id || 0,
    );

    if (!transferenciaId) {
      mostrarMensagem("Salve a transferência antes de adicionar produtos", "erro");
      return;
    }

    if (!itemTransferencia.idProduto || !itemTransferencia.produtoNome) {
      mostrarMensagem("Selecione um produto", "erro");
      return;
    }

    if (!itemTransferencia.quantidade || Number(itemTransferencia.quantidade) <= 0) {
      mostrarMensagem("Informe uma quantidade válida", "erro");
      return;
    }

    if (
      itemTransferencia.saldoDisponivel &&
      Number(itemTransferencia.quantidade) >
        Number(itemTransferencia.saldoDisponivel)
    ) {
      mostrarMensagem(
        "Quantidade maior que o saldo disponível no almoxarifado de origem",
        "erro",
      );
      return;
    }

    const payload = {
      transferenciaId,
      produtoId: Number(itemTransferencia.idProduto),
      quantidade: Number.parseInt(itemTransferencia.quantidade, 10),
    };

    try {
      if (itemTransferencia.idMov) {
        await atualizarTransferenciaItem(itemTransferencia.idMov, payload);
      } else {
        await cadastrarTransferenciaItem(payload);
      }

      await carregarTransferenciaItens(transferenciaId);
      setModalItemAberto(false);
      setItemTransferencia(itemTransferenciaInicial);
      setProdutoTransferenciaSelecionado(null);
      setBuscaProduto("");
      setPaginaSeletorProdutoAtual(1);
      mostrarMensagem("Item da transferência salvo com sucesso", "sucesso");
    } catch (error) {
      mostrarMensagem(
        error.response?.data?.message || "Erro ao salvar item da transferência",
        "erro",
      );
    }
  };

  const abrirSeletorAlmoxarifado = (tipo) => {
    setTipoSelecaoAlmoxarifado(tipo);
    setBuscaAlmoxarifado("");
    setAlmoxarifadoSelecionado(null);
    setPaginaAlmoxarifadoAtual(1);
    setSeletorAlmoxarifadoAberto(true);
  };

  const confirmarAlmoxarifado = (almoxarifado) => {
    setTransferencia((transferenciaAtual) => ({
      ...transferenciaAtual,
      ...(tipoSelecaoAlmoxarifado === "origem"
        ? {
            almoxarifadoOrigemId: String(almoxarifado.id),
            almoxarifadoOrigemNome: almoxarifado.nome,
          }
        : {
            almoxarifadoDestinoId: String(almoxarifado.id),
            almoxarifadoDestinoNome: almoxarifado.nome,
          }),
    }));

    setSeletorAlmoxarifadoAberto(false);
    setTipoSelecaoAlmoxarifado("");
    setAlmoxarifadoSelecionado(null);
    setBuscaAlmoxarifado("");
  };

  const handleSalvarTransferencia = async () => {
    if (
      !transferencia.almoxarifadoOrigemId ||
      !transferencia.almoxarifadoOrigemNome
    ) {
      mostrarMensagem("Selecione o almoxarifado de origem", "erro");
      return;
    }

    if (
      !transferencia.almoxarifadoDestinoId ||
      !transferencia.almoxarifadoDestinoNome
    ) {
      mostrarMensagem("Selecione o almoxarifado de destino", "erro");
      return;
    }

    if (
      transferencia.almoxarifadoOrigemId === transferencia.almoxarifadoDestinoId
    ) {
      mostrarMensagem("Origem e destino não podem ser iguais", "erro");
      return;
    }

    if (!transferencia.observacao.trim()) {
      mostrarMensagem("Informe a observação", "erro");
      return;
    }

    const payload = {
      almoxarifadoOrigemId: Number(transferencia.almoxarifadoOrigemId),
      almoxarifadoDestinoId: Number(transferencia.almoxarifadoDestinoId),
      observacao: transferencia.observacao.trim(),
    };

    try {
      const response = await cadastrarTransferencia(payload);
      const transferenciaSalva = response.data;

      setTransferencia({
        id: String(transferenciaSalva.id ?? ""),
        almoxarifadoOrigemId: String(
          transferenciaSalva.almoxarifadoOrigemId ??
            transferencia.almoxarifadoOrigemId,
        ),
        almoxarifadoOrigemNome:
          transferenciaSalva.almoxarifadoOrigemNome ??
          transferencia.almoxarifadoOrigemNome,
        almoxarifadoDestinoId: String(
          transferenciaSalva.almoxarifadoDestinoId ??
            transferencia.almoxarifadoDestinoId,
        ),
        almoxarifadoDestinoNome:
          transferenciaSalva.almoxarifadoDestinoNome ??
          transferencia.almoxarifadoDestinoNome,
        dataTransferencia: transferenciaSalva.dataTransferencia ?? "",
        observacao: transferenciaSalva.observacao ?? transferencia.observacao,
      });

      mostrarMensagem("Transferência salva com sucesso", "sucesso");
      setTransferenciaSalva(true);
      await carregarTransferenciaItens(transferenciaSalva.id);
      const responseLista = await listarTransferencias();
      setTransferencias(responseLista.data);
    } catch (error) {
      mostrarMensagem(
        error.response?.data?.message || "Erro ao salvar transferência",
        "erro",
      );
    }
  };

  const handleEditarTransferencia = (item = transferenciaSelecionada) => {
    if (!item) {
      mostrarMensagem("Selecione uma transferência", "erro");
      return;
    }

    setTransferencia({
      id: String(item.id ?? ""),
      almoxarifadoOrigemId: String(
        item.almoxarifadoOrigemId ?? item.almoxarifadoOrigem?.id ?? "",
      ),
      almoxarifadoOrigemNome:
        item.almoxarifadoOrigemNome ?? item.almoxarifadoOrigem?.nome ?? "",
      almoxarifadoDestinoId: String(
        item.almoxarifadoDestinoId ?? item.almoxarifadoDestino?.id ?? "",
      ),
      almoxarifadoDestinoNome:
        item.almoxarifadoDestinoNome ?? item.almoxarifadoDestino?.nome ?? "",
      dataTransferencia: item.dataTransferencia ?? "",
      observacao: item.observacao ?? "",
    });

    setTransferenciaSalva(true);
    setModalAberto(true);
    setAbaAtiva("transferencia");
    setItemProdutoSelecionado(null);
    setBuscaProdutoTransferencia("");
    setPaginaProdutoAtual(1);
    carregarTransferenciaItens(item.id);
  };

  const handleDeletarTransferencia = async () => {
    if (!transferenciaSelecionada) {
      mostrarMensagem("Selecione uma transferência", "erro");
      return;
    }

    try {
      await deletarTransferencia(transferenciaSelecionada.id);

      setTransferencias((transferenciasAtuais) =>
        transferenciasAtuais.filter(
          (item) => item.id !== transferenciaSelecionada.id,
        ),
      );

      setTransferenciaSelecionada(null);
      mostrarMensagem("Transferência excluída com sucesso", "sucesso");
    } catch (error) {
      mostrarMensagem(
        error.response?.data?.message || "Erro ao excluir transferência",
        "erro",
      );
    }
  };

  return (
    <div className="transferencia-page">
      <div className="transferencia-header">
        <h1>Transferência entre Almoxarifados</h1>
        <p>Gerencie as transferências cadastradas</p>
      </div>

      <div className="transferencia-actions">
        <input
          type="text"
          placeholder="Buscar por observação..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
        />
        <div className="date-filter-group">
          <input
            type="date"
            value={buscaData}
            onChange={(e) => {
              setBuscaData(e.target.value);
              setPaginaAtual(1);
            }}
          />
          <button
            type="button"
            className="clear-date-button"
            onClick={() => {
              setBuscaData("");
              setPaginaAtual(1);
            }}
          >
            <FiX />
          </button>
        </div>
        <button
          type="button"
          className="new-item-button"
          onClick={handleAbrirNovo}
        >
          Novo
        </button>
        <button
          type="button"
          className="edit-item-button"
          onClick={handleEditarTransferencia}
        >
          Editar
        </button>
        <button
          type="button"
          className="delete-item-button"
          onClick={handleDeletarTransferencia}
        >
          Deletar
        </button>
        <div className="pagination-controls">
          <button
            className="first"
            onClick={handlePrimeiraPagina}
            disabled={paginaAtual === 1}
          >
            <FiChevronsLeft />
          </button>
          <button
            className="previous"
            onClick={handlePaginaAnterior}
            disabled={paginaAtual === 1}
          >
            <FiChevronLeft />
          </button>
          <button className="refresh" onClick={handleRecarregar}>
            <FiRefreshCw />
          </button>
          <button
            className="next"
            onClick={handleProximaPagina}
            disabled={totalPaginas === 0 || paginaAtual === totalPaginas}
          >
            <FiChevronRight />
          </button>
          <button
            className="last"
            onClick={handleUltimaPagina}
            disabled={totalPaginas === 0 || paginaAtual === totalPaginas}
          >
            <FiChevronsRight />
          </button>
          <span className="total-itens">
            {`${inicioExibido} - ${fimExibido} / ${transferenciasOrdenadas.length}`}
          </span>
        </div>
      </div>
      <div className="transferencia-card">
        <table className="transferencia-table">
          <thead>
            <tr>
              <th onClick={() => handleOrdenar("id")}>
                <span className="sortable-header">
                  ID
                  {ordenacao.coluna === "id" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th onClick={() => handleOrdenar("dataTransferencia")}>
                <span className="sortable-header">
                  Data de criação
                  {ordenacao.coluna === "dataTransferencia" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th onClick={() => handleOrdenar("almoxarifadoOrigemNome")}>
                <span className="sortable-header">
                  Almoxarifado origem
                  {ordenacao.coluna === "almoxarifadoOrigemNome" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th onClick={() => handleOrdenar("almoxarifadoDestinoNome")}>
                <span className="sortable-header">
                  Almoxarifado destino
                  {ordenacao.coluna === "almoxarifadoDestinoNome" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
              <th onClick={() => handleOrdenar("observacao")}>
                <span className="sortable-header">
                  Observação
                  {ordenacao.coluna === "observacao" &&
                    (ordenacao.direcao === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {transferenciasPaginadas.map((transferencia) => (
              <tr
                key={transferencia.id}
                className={
                  transferenciaSelecionada?.id === transferencia.id
                    ? "selected-row"
                    : ""
                }
                onClick={() => setTransferenciaSelecionada(transferencia)}
                onDoubleClick={() => handleEditarTransferencia(transferencia)}
              >
                <td>{transferencia.id}</td>
                <td>{transferencia.dataTransferencia}</td>
                <td>
                  {transferencia.almoxarifadoOrigemNome ||
                    transferencia.almoxarifadoOrigem?.nome ||
                    "-"}
                </td>
                <td>
                  {transferencia.almoxarifadoDestinoNome ||
                    transferencia.almoxarifadoDestino?.nome ||
                    "-"}
                </td>
                <td>{transferencia.observacao || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {modalAberto && (
        <div className="modal-overlay">
          <div className="transferencia-modal">
            <div className="transferencia-modal-header">
              <h2>Transferência entre Almoxarifados</h2>
              <button onClick={handleCancelar}>X</button>
            </div>
            <div className="transferencia-modal-actions">
              <button
                type="button"
                className="new-button"
                onClick={handleAbrirNovo}
              >
                Novo
              </button>
              <button
                type="button"
                className="save-button"
                onClick={handleSalvarTransferencia}
                disabled={transferenciaBloqueada}
              >
                Salvar
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelar}
              >
                Cancelar
              </button>
            </div>
            <div className="modal-tabs">
              <button
                className={abaAtiva === "transferencia" ? "active-tab" : ""}
                onClick={() => setAbaAtiva("transferencia")}
              >
                Transferência entre Almoxarifados
              </button>
              <button
                className={abaAtiva === "produtos" ? "active-tab" : ""}
                disabled={!transferenciaSalva}
                onClick={() => setAbaAtiva("produtos")}
              >
                Produtos
              </button>
            </div>
            {abaAtiva === "transferencia" && (
              <>
                <div className="form-group">
                  <label>ID</label>
                  <input
                    type="text"
                    name="id"
                    value={transferencia.id}
                    readOnly
                  />
                </div>
                <div className="section-bar">Origem</div>
                <div className="form-group">
                  <label>Almoxarifado Origem</label>
                  <div
                    className={`lookup-field ${
                      transferenciaBloqueada ? "" : "lookup-field-clickable"
                    }`}
                    onClick={(event) => {
                      if (
                        event.target.tagName === "INPUT" &&
                        !event.target.readOnly
                      ) {
                        return;
                      }

                      if (transferenciaBloqueada) {
                        return;
                      }

                      abrirSeletorAlmoxarifado("origem");
                    }}
                  >
                    <input
                      type="text"
                      name="almoxarifadoOrigemId"
                      value={transferencia.almoxarifadoOrigemId}
                      onChange={handleOrigemIdChange}
                      readOnly={transferenciaBloqueada}
                    />
                    <input
                      type="text"
                      name="almoxarifadoOrigemNome"
                      value={transferencia.almoxarifadoOrigemNome}
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        abrirSeletorAlmoxarifado("origem");
                      }}
                      disabled={transferenciaBloqueada}
                    >
                      <FiSearch />
                    </button>
                  </div>
                </div>
                <div className="section-bar">Destino</div>
                <div className="form-group">
                  <label>Almoxarifado Destino</label>
                  <div
                    className={`lookup-field ${
                      transferenciaBloqueada ? "" : "lookup-field-clickable"
                    }`}
                    onClick={(event) => {
                      if (
                        event.target.tagName === "INPUT" &&
                        !event.target.readOnly
                      ) {
                        return;
                      }

                      if (transferenciaBloqueada) {
                        return;
                      }

                      abrirSeletorAlmoxarifado("destino");
                    }}
                  >
                    <input
                      type="text"
                      name="almoxarifadoDestinoId"
                      value={transferencia.almoxarifadoDestinoId}
                      onChange={handleDestinoIdChange}
                      readOnly={transferenciaBloqueada}
                    />
                    <input
                      type="text"
                      name="almoxarifadoDestinoNome"
                      value={transferencia.almoxarifadoDestinoNome}
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        abrirSeletorAlmoxarifado("destino");
                      }}
                      disabled={transferenciaBloqueada}
                    >
                      <FiSearch />
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Data de criação</label>
                  <input
                    type="text"
                    name="dataTransferencia"
                    value={transferencia.dataTransferencia}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Observação</label>
                  <textarea
                    name="observacao"
                    id="observacao"
                    value={transferencia.observacao}
                    onChange={(e) =>
                      setTransferencia({
                        ...transferencia,
                        observacao: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}
            {abaAtiva === "produtos" && (
              <div className="produtos-tab-content">
                <div className="produtos-actions">
                  <button type="button" onClick={abrirModalNovoItemTransferencia}>
                    Novo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditarItemTransferencia()}
                  >
                    Editar
                  </button>
                  <button type="button" onClick={handleDeletarItemTransferencia}>
                    Deletar
                  </button>
                </div>
                <div className="produtos-toolbar">
                  <input
                    type="text"
                    placeholder="Buscar por ID ou Produto..."
                    value={buscaProdutoTransferencia}
                    onChange={(e) => {
                      setBuscaProdutoTransferencia(e.target.value);
                      setPaginaProdutoAtual(1);
                    }}
                  />
                  <div className="pagination-controls produtos-pagination-controls">
                    <button
                      className="first"
                      onClick={handlePrimeiraPaginaProduto}
                      disabled={paginaProdutoAtual === 1}
                    >
                      <FiChevronsLeft />
                    </button>
                    <button
                      className="previous"
                      onClick={handlePaginaAnteriorProduto}
                      disabled={paginaProdutoAtual === 1}
                    >
                      <FiChevronLeft />
                    </button>
                    <button
                      className="refresh"
                      onClick={handleRecarregarProduto}
                    >
                      <FiRefreshCw />
                    </button>
                    <button
                      className="next"
                      onClick={handleProximaPaginaProduto}
                      disabled={
                        totalPaginasProduto === 0 ||
                        paginaProdutoAtual === totalPaginasProduto
                      }
                    >
                      <FiChevronRight />
                    </button>
                    <button
                      className="last"
                      onClick={handleUltimaPaginaProduto}
                      disabled={
                        totalPaginasProduto === 0 ||
                        paginaProdutoAtual === totalPaginasProduto
                      }
                    >
                      <FiChevronsRight />
                    </button>
                    <span className="total-itens">
                      {`${inicioExibidoProduto} - ${fimExibidoProduto} / ${produtosTransferenciaOrdenados.length}`}
                    </span>
                  </div>
                </div>
                <div className="produtos-table-wrapper">
                  <table className="produtos-table">
                    <thead>
                      <tr>
                        <th
                          onClick={() =>
                            handleOrdenarProdutoTransferencia("id")
                          }
                        >
                          <span className="sortable-header">
                            ID
                            {ordenacaoProdutoTransferencia.coluna === "id" &&
                              (ordenacaoProdutoTransferencia.direcao ===
                              "asc" ? (
                                <FiChevronUp />
                              ) : (
                                <FiChevronDown />
                              ))}
                          </span>
                        </th>
                        <th
                          onClick={() =>
                            handleOrdenarProdutoTransferencia("produtoNome")
                          }
                        >
                          <span className="sortable-header">
                            Produto
                            {ordenacaoProdutoTransferencia.coluna ===
                              "produtoNome" &&
                              (ordenacaoProdutoTransferencia.direcao ===
                              "asc" ? (
                                <FiChevronUp />
                              ) : (
                                <FiChevronDown />
                              ))}
                          </span>
                        </th>
                        <th
                          onClick={() =>
                            handleOrdenarProdutoTransferencia("quantidade")
                          }
                        >
                          <span className="sortable-header">
                            Quantidade
                            {ordenacaoProdutoTransferencia.coluna ===
                              "quantidade" &&
                              (ordenacaoProdutoTransferencia.direcao ===
                              "asc" ? (
                                <FiChevronUp />
                              ) : (
                                <FiChevronDown />
                              ))}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtosTransferenciaPaginados.length > 0 ? (
                        produtosTransferenciaPaginados.map((item) => (
                          <tr
                            key={item.id}
                            className={
                              itemProdutoSelecionado?.id === item.id
                                ? "selected-row"
                                : ""
                            }
                            onClick={() => setItemProdutoSelecionado(item)}
                            onDoubleClick={() => handleEditarItemTransferencia(item)}
                          >
                            <td>{item.id}</td>
                            <td>{`${item.produtoId ?? "-"} - ${item.produtoNome ?? "-"}`}</td>
                            <td>{item.quantidade}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="empty-state-cell">
                            Nenhum produto vinculado a esta transferência.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {modalItemAberto && (
        <div className="item-transferencia-overlay">
          <div className="item-transferencia-modal">
            <div className="item-transferencia-header">
              <h2>Produto da Transferência</h2>
              <button
                type="button"
                onClick={() => {
                  setModalItemAberto(false);
                }}
              >
                X
              </button>
            </div>
            <div className="item-transferencia-actions">
              <button
                type="button"
                className="new-button"
                onClick={() => {
                  setItemTransferencia(itemTransferenciaInicial);
                  setProdutoTransferenciaSelecionado(null);
                  setBuscaProduto("");
                  setPaginaSeletorProdutoAtual(1);
                }}
              >
                Novo
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setModalItemAberto(false);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="save-button"
                onClick={handleSalvarItemTransferencia}
              >
                Salvar
              </button>
            </div>
            <div className="item-transferencia-form">
              <div className="form-group">
                <label>ID Mov.</label>
                <input type="text" value={itemTransferencia.idMov} readOnly />
              </div>
              <div className="form-group">
                <label>Produto</label>
                <div
                  className="lookup-field lookup-field-clickable"
                  onClick={(event) => {
                    if (
                      event.target.tagName === "INPUT" &&
                      !event.target.readOnly
                    ) {
                      return;
                    }

                    abrirSeletorProdutoTransferencia();
                  }}
                >
                  <input
                    type="text"
                    value={itemTransferencia.idProduto}
                    onChange={handleProdutoTransferenciaIdChange}
                  />
                  <input
                    type="text"
                    value={itemTransferencia.produtoNome}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      abrirSeletorProdutoTransferencia();
                    }}
                  >
                    <FiSearch />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Saldo disponível</label>
                <input
                  type="text"
                  value={itemTransferencia.saldoDisponivel}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Quantidade</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={itemTransferencia.quantidade}
                  onChange={(e) =>
                    setItemTransferencia((itemAtual) => ({
                      ...itemAtual,
                      quantidade: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {seletorAlmoxarifadoAberto && (
        <div className="almoxarifado-overlay">
          <div className="almoxarifado-box">
            <div className="almoxarifado-header">
              <h1>Almoxarifados</h1>
              <button
                className="close-modal-btn"
                onClick={() => {
                  setSeletorAlmoxarifadoAberto(false);
                }}
              >
                X
              </button>
            </div>
            <div className="almoxarifado-actions">
              <input
                type="text"
                placeholder="Buscar por ID ou Nome..."
                value={buscaAlmoxarifado}
                onChange={(e) => {
                  setBuscaAlmoxarifado(e.target.value);
                  setPaginaAlmoxarifadoAtual(1);
                }}
              />
              <div className="pagination-controls almoxarifado-pagination-controls">
                <button
                  className="first"
                  onClick={handlePrimeiraPaginaAlmoxarifado}
                  disabled={paginaAlmoxarifadoAtual === 1}
                >
                  <FiChevronsLeft />
                </button>
                <button
                  className="previous"
                  onClick={handlePaginaAnteriorAlmoxarifado}
                  disabled={paginaAlmoxarifadoAtual === 1}
                >
                  <FiChevronLeft />
                </button>
                <button
                  className="refresh"
                  onClick={handleRecarregarAlmoxarifado}
                >
                  <FiRefreshCw />
                </button>
                <button
                  className="next"
                  onClick={handleProximaPaginaAlmoxarifado}
                  disabled={
                    totalPaginasAlmoxarifado === 0 ||
                    paginaAlmoxarifadoAtual === totalPaginasAlmoxarifado
                  }
                >
                  <FiChevronRight />
                </button>
                <button
                  className="last"
                  onClick={handleUltimaPaginaAlmoxarifado}
                  disabled={
                    totalPaginasAlmoxarifado === 0 ||
                    paginaAlmoxarifadoAtual === totalPaginasAlmoxarifado
                  }
                >
                  <FiChevronsRight />
                </button>
                <span className="total-itens">
                  {`${inicioExibidoAlmoxarifado} - ${fimExibidoAlmoxarifado} / ${almoxarifadosOrdenados.length}`}
                </span>
              </div>
            </div>
            <div className="almoxarifado-table-wrapper">
              <table className="almoxarifado-table">
                <thead>
                  <tr>
                    <th onClick={() => handleOrdenarAlmoxarifado("id")}>
                      <span className="sortable-header">
                        ID
                        {ordenacaoAlmoxarifado.coluna === "id" &&
                          (ordenacaoAlmoxarifado.direcao === "asc" ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          ))}
                      </span>
                    </th>
                    <th onClick={() => handleOrdenarAlmoxarifado("nome")}>
                      <span className="sortable-header">
                        Nome
                        {ordenacaoAlmoxarifado.coluna === "nome" &&
                          (ordenacaoAlmoxarifado.direcao === "asc" ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          ))}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {almoxarifadosPaginados.map((almoxarifado) => (
                    <tr
                      key={almoxarifado.id}
                      className={
                        almoxarifadoSelecionado?.id === almoxarifado.id
                          ? "selected-row"
                          : ""
                      }
                      onClick={() => {
                        almoxarifadoSelecionado?.id === almoxarifado.id
                          ? setAlmoxarifadoSelecionado(null)
                          : setAlmoxarifadoSelecionado(almoxarifado);
                      }}
                      onDoubleClick={() => confirmarAlmoxarifado(almoxarifado)}
                    >
                      <td>{almoxarifado.id}</td>
                      <td>{almoxarifado.nome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="almoxarifado-footer">
              <button
                onClick={() => {
                  if (almoxarifadoSelecionado) {
                    confirmarAlmoxarifado(almoxarifadoSelecionado);
                  } else {
                    mostrarMensagem("Selecione um registro", "erro");
                  }
                }}
              >
                Selecionar
              </button>
            </div>
          </div>
        </div>
      )}

      {seletorProdutoAberto && (
        <div className="produto-transferencia-overlay">
          <div className="produto-transferencia-box">
            <div className="produto-transferencia-header">
              <h1>Produtos</h1>
              <button
                className="close-modal-btn"
                onClick={() => {
                  setSeletorProdutoAberto(false);
                }}
              >
                X
              </button>
            </div>
            <div className="produto-transferencia-actions">
              <input
                type="text"
                placeholder="Buscar por ID ou Nome..."
                value={buscaProduto}
                onChange={(e) => {
                  setBuscaProduto(e.target.value);
                  setPaginaSeletorProdutoAtual(1);
                }}
              />
              <div className="pagination-controls produto-transferencia-pagination-controls">
                <button
                  className="first"
                  onClick={handlePrimeiraPaginaSeletorProduto}
                  disabled={paginaSeletorProdutoAtual === 1}
                >
                  <FiChevronsLeft />
                </button>
                <button
                  className="previous"
                  onClick={handlePaginaAnteriorSeletorProduto}
                  disabled={paginaSeletorProdutoAtual === 1}
                >
                  <FiChevronLeft />
                </button>
                <button
                  className="refresh"
                  onClick={handleRecarregarSeletorProduto}
                >
                  <FiRefreshCw />
                </button>
                <button
                  className="next"
                  onClick={handleProximaPaginaSeletorProduto}
                  disabled={
                    totalPaginasSeletorProduto === 0 ||
                    paginaSeletorProdutoAtual === totalPaginasSeletorProduto
                  }
                >
                  <FiChevronRight />
                </button>
                <button
                  className="last"
                  onClick={handleUltimaPaginaSeletorProduto}
                  disabled={
                    totalPaginasSeletorProduto === 0 ||
                    paginaSeletorProdutoAtual === totalPaginasSeletorProduto
                  }
                >
                  <FiChevronsRight />
                </button>
                <span className="total-itens">
                  {`${inicioExibidoSeletorProduto} - ${fimExibidoSeletorProduto} / ${produtosSeletorOrdenados.length}`}
                </span>
              </div>
            </div>
            <div className="produto-transferencia-table-wrapper">
              <table className="produto-transferencia-table">
                <thead>
                  <tr>
                    <th onClick={() => handleOrdenarSeletorProduto("id")}>
                      <span className="sortable-header">
                        ID
                        {ordenacaoSeletorProduto.coluna === "id" &&
                          (ordenacaoSeletorProduto.direcao === "asc" ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          ))}
                      </span>
                    </th>
                    <th onClick={() => handleOrdenarSeletorProduto("nome")}>
                      <span className="sortable-header">
                        Nome
                        {ordenacaoSeletorProduto.coluna === "nome" &&
                          (ordenacaoSeletorProduto.direcao === "asc" ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          ))}
                      </span>
                    </th>
                    <th onClick={() => handleOrdenarSeletorProduto("saldo")}>
                      <span className="sortable-header">
                        Quantidade
                        {ordenacaoSeletorProduto.coluna === "saldo" &&
                          (ordenacaoSeletorProduto.direcao === "asc" ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          ))}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {produtosSeletorPaginados.map((produto) => (
                    <tr
                      key={produto.id}
                      className={
                        produtoTransferenciaSelecionado?.id === produto.id
                          ? "selected-row"
                          : ""
                      }
                      onClick={() => {
                        produtoTransferenciaSelecionado?.id === produto.id
                          ? setProdutoTransferenciaSelecionado(null)
                          : setProdutoTransferenciaSelecionado(produto);
                      }}
                      onDoubleClick={() =>
                        confirmarProdutoTransferencia(produto)
                      }
                    >
                      <td>{produto.id}</td>
                      <td>{produto.nome}</td>
                      <td>{produto.saldo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="produto-transferencia-footer">
              <button
                type="button"
                onClick={() => {
                  if (produtoTransferenciaSelecionado) {
                    confirmarProdutoTransferencia(
                      produtoTransferenciaSelecionado,
                    );
                  } else {
                    mostrarMensagem("Selecione um produto", "erro");
                  }
                }}
              >
                Selecionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transferencia;

